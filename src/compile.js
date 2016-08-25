// @flow

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/skipWhile';
import 'rxjs/add/operator/take';

import split from 'argv-split';
import crypto from 'crypto';
import del from 'del';
import fs from 'fs';
import express from 'express';
import mkdirp from 'mkdirp';
import os from 'os';
import path from 'path';
import url from 'url';
import webpack from 'webpack';
import Stats from 'webpack/lib/Stats';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import type {
  Compiler,
} from 'webpack';

import createChildExecutor from './utils/createChildExecutor';
import createLogger from './utils/createLogger';
import configure from './webpack/configure';

// If a BUNDLE_ARGV env var is defined, pass it as arguments
// to the child process executing the bundle
const BUNDLE_ARGV = split(process.env.BUNDLE_ARGV || '');

/**
 * Get the path to a unique temporary directory to which server build assets will be emitted.
 * Uniqueness is required for when multiple `serve` / `build` invocations are running concurrently.
 */
function getServerBuildDirectory(): string {
  // Generate a random string to ensure uniqueness
  const buildToken = crypto.randomBytes(16).toString('hex');
  return path.resolve(os.tmpdir(), `nucleate-${buildToken}`);
}

/**
 * Create a hot observable which emits `null` when the webpack build is in
 * progress, and emits the webpack `stats` object when the build is completed.
 * The most recent element is replayed to new subscribers.
 *
 * @param  {Compiler} compiler
 *   The webpack compiler
 * @return {Observable}
 *   A hot RxJS Observable
 */
function createWebpack$(compiler: Compiler): Observable {
  const webpack$ = Observable.create((observer) => {
    compiler.plugin('invalid', () => observer.next(null));
    compiler.plugin('failed', error => observer.error(error));
    compiler.plugin('done', stats => observer.next(stats));
  }).publishReplay(1);
  webpack$.connect();
  return webpack$;
}

/**
 * Get the absolute path to the main JS bundle on disk.
 */
function getBundlePath(stats: Stats): string {
  const mainAssets = stats.toJson().assetsByChunkName.main;
  return path.resolve(
    stats.compilation.compiler.outputPath,
    Array.isArray(mainAssets) ? mainAssets[0] : mainAssets
  );
}

function onExit(cb) {
  process.on('exit', cb);
  process.on('SIGINT', () => process.exit(0));
}

type CompileOptions = {
  devtool?: string,
  minify: boolean,
  preserveBuild?: boolean,
  source: string,
};

type BuildOptions = CompileOptions & {
  destination: string,
};

type ServeOptions = CompileOptions & {
  hostname: string,
  port: number,
};

/**
 * Serve a Nucleate site from the given directory.
 * @param  {string} source
 *   Path to the directory containing the site root
 * @param  {number} port
 *   Port on which to serve the site
 * @param  {string} hostname
 *   Hostname on which to serve the site
 */
export function serve(
  {
    devtool,
    hostname = undefined,
    minify,
    port,
    preserveBuild = false,
    source,
  }: ServeOptions
) {
  const log = createLogger('serve');
  const entry = path.resolve(source);
  log.info(`serving ${entry}`);

  /*
   * Configure and start webpack bundler for the browser, served over HTTP via
   * webpack-dev-middleware, with hot reload via webpack-hot-middleware.
   */
  const clientConfig = configure({
    devtool,
    entry,
    hmr: true,
    minify,
    // Output to the root of webpack-dev-middleware's memory file system
    outputPath: '/',
    target: 'web',
    // Dynamically load chunks via XHR + eval, instead of webpack's default <script> tag method,
    // since extra <script> tags will cause React to fail to reuse markup upon render.
    xhrEvalChunks: true,
  });
  const clientCompiler = webpack(clientConfig);
  const devMiddleware = webpackDevMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    stats: { chunkModules: false, colors: true },
  });
  const hotMiddleware = webpackHotMiddleware(clientCompiler);

  // Output to a unique build directory
  const serverBuildDirectory = getServerBuildDirectory();
  if (!preserveBuild) {
    process.stdin.resume();
    onExit(() => {
      log.info(`deleting server build directory ${serverBuildDirectory}`);
      del.sync([serverBuildDirectory], { force: true });
    });
  }
  log.info('server build directory', serverBuildDirectory);

  /*
   * Configure and start webpack bundler for the server for static rendering.
   * Resulting bundle is executed in a child process for each incoming request.
   */
  const serverConfig = configure({
    devtool: 'source-map',
    entry,
    hmr: false,
    name: 'server',
    outputPath: serverBuildDirectory,
    target: 'node',
  });
  const serverCompiler = webpack(serverConfig);
  const serverWebpack$ = createWebpack$(serverCompiler);
  // Create an observable which completes upon successful webpack build
  const serverWebpackDone$ = serverWebpack$.skipWhile(stats => !stats).take(1);
  serverCompiler.watch({}, (err, stats) => {
    log.info('server webpack completed');
    log.log('info', stats.toString({ chunkModules: false, colors: true }));
  });

  const app = express();
  app.use(devMiddleware);
  app.use(hotMiddleware);
  app.use((req, res) => {
    log.info('waiting for webpack');
    serverWebpackDone$.subscribe(async (stats) => {
      const bundleExecutor = createChildExecutor(getBundlePath(stats), BUNDLE_ARGV);
      try {
        const markup = await bundleExecutor.invoke('renderPath', req.path);
        log.info(`rendered ${req.path}`);
        res.send(markup);
      } catch (error) {
        log.error(`server render error:\n${error.stack}`);
        res.status(500).type('text').send(error.stack);
      }
    }, (error) => {
      log.error(`error rendering page using server bundle:\n${error.stack}`);
    }, () => {
      log.info('completed page render');
    });
  });

  const server = app.listen(port, hostname, () => {
    const address = server.address();
    log.info(`serving on ${url.format({
      protocol: 'http',
      hostname: address.address,
      port: address.port,
    })}`);
  });
}

/**
 * Build a Nucleate site from the given directory.
 */
export async function build(
  {
    devtool,
    destination,
    minify = false,
    preserveBuild = false,
    source,
  }: BuildOptions
) {
  const log = createLogger('build');
  const entry = path.resolve(source);
  log.info(`building ${entry}`);

  const clientBuildDirectory = path.resolve(destination);
  log.info(`output in ${clientBuildDirectory}`);
  await del([clientBuildDirectory]);

  const clientConfig = configure({
    devtool,
    entry,
    hmr: false,
    minify,
    outputPath: path.resolve(clientBuildDirectory, 'assets'),
    target: 'web',
    // Dynamically load chunks via XHR + eval, instead of webpack's default <script> tag method,
    // since extra <script> tags will cause React to fail to reuse markup upon render.
    xhrEvalChunks: true,
  });

  // Output to a unique build directory
  const serverBuildDirectory = getServerBuildDirectory();
  if (!preserveBuild) {
    process.stdin.resume();
    onExit(() => {
      log.info(`deleting server build directory ${serverBuildDirectory}`);
      del.sync([serverBuildDirectory], { force: true });
    });
  }
  log.info('server build directory', serverBuildDirectory);

  const serverConfig = configure({
    devtool: 'source-map',
    entry,
    hmr: false,
    outputPath: serverBuildDirectory,
    target: 'node',
  });
  const clientCompiler = webpack(clientConfig);
  clientCompiler.run((err, stats) => {
    if (err) {
      throw err;
    }
    log.info('client webpack completed');
    log.log('info', stats.toString({ chunkModules: false, colors: true }));
  });

  const serverCompiler = webpack(serverConfig);
  serverCompiler.run(async (err, stats) => {
    if (err) {
      throw err;
    }
    const bundlePath = getBundlePath(stats);
    const bundleExecutor = createChildExecutor(bundlePath, BUNDLE_ARGV);
    try {
      const routesMarkup = await bundleExecutor.invoke('renderAll');
      for (const [routePath, markup] of routesMarkup) {
        const htmlPath = path.resolve(destination, routePath.replace(/^\//, ''), 'index.html');
        log.info(`rendering ${htmlPath}`);
        mkdirp.sync(path.dirname(htmlPath));
        fs.writeFileSync(htmlPath, markup);
      }
    } catch (error) {
      log.error(error.stack);
    }
    log.info('server webpack completed');
    log.log('info', stats.toString({ chunkModules: false, colors: true }));
  });
}
