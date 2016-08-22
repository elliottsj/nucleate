/* @flow */

import createLogger from './utils/createLogger';
const log = createLogger('serve');

import { Observable } from '@reactivex/rxjs';
import split from 'argv-split';
import express from 'express';
import path from 'path';
import url from 'url';
import webpack from 'webpack';
import Stats from 'webpack/lib/Stats';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import createChildExecutor from './utils/createChildExecutor';
import configure from './webpack/configure';

// If a BUNDLE_ARGV env var is defined, pass it as arguments
// to the child process executing the bundle
const BUNDLE_ARGV = split(process.env.BUNDLE_ARGV || '');

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
function createWebpack$(compiler: webpack.Compiler): Observable {
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

/**
 * Serve the Nucleate site from the given directory.
 * @param  {string} source
 *   Path to the directory containing the site root
 * @param  {number} port
 *   Port on which to serve the site
 * @param  {string} hostname
 *   Hostname on which to serve the site
 */
export default function serve(source: string, port: number, hostname: string) {
  const entry = path.resolve(source);
  log.info(`serving ${entry}`);

  /*
   * Configure and start webpack bundler for the browser, served over HTTP via
   * webpack-dev-middleware, with hot reload via webpack-hot-middleware.
   */
  const clientConfig = configure({
    entry,
    hmr: true,
    name: 'client',
    // Output to the root of webpack-dev-middleware's memory file system
    outputPath: '/',
    target: 'web',
    xhrEvalChunks: true,
  });
  const clientCompiler = webpack(clientConfig);
  const devMiddleware = webpackDevMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    stats: { chunkModules: false, colors: true },
  });
  const hotMiddleware = webpackHotMiddleware(clientCompiler);

  /*
   * Configure and start webpack bundler for the server for static rendering.
   * Resulting bundle is executed in a child process for each incoming request.
   */
  const serverConfig = configure({
    entry,
    hmr: false,
    name: 'server',
    // Output to 'node_modules/nucleate/build'
    // XXX: only one site can be served at a time per node_modules directory
    // TODO: output to unique location (memory?) to allow multiple sites
    outputPath: path.resolve(__dirname, '../build'),
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
