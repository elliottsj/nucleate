/* @flow */

import createLogger from './utils/createLogger';
const log = createLogger('serve');

import { Observable } from '@reactivex/rxjs';
import split from 'argv-split';
import express from 'express';
import path from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import createChildExecutor from './utils/createChildExecutor';
import configure from './webpack/configure';

const BUNDLE_ARGV = split(process.env.BUNDLE_ARGV || '');

/**
 * Create a hot observable which emits `null` when the webpack build is in
 * progress, and emits the webpack `stats` object when the build is completed.
 * The most recent element is replayed to new subscribers.
 *
 * @param  {Compiler} compiler The webpack compiler
 * @return {Observable}        A hot RxJS Observable
 */
function createWebpack$(compiler) {
  const webpack$ = Observable.create((observer) => {
    compiler.plugin('invalid', () => observer.next(null));
    compiler.plugin('failed', error => observer.error(error));
    compiler.plugin('done', stats => observer.next(stats));
  }).publishReplay(1);
  webpack$.connect();
  return webpack$;
}

function getBundlePath(stats) {
  const mainAssets = stats.toJson().assetsByChunkName.main;
  return path.resolve(
    stats.compilation.compiler.outputPath,
    Array.isArray(mainAssets) ? mainAssets[0] : mainAssets
  );
}

export default function serve(source) {
  const entry = path.resolve(source);
  log.info(`serving ${entry}`);

  const clientConfig = configure({
    entry,
    hmr: true,
    name: 'client',
    outputPath: '/',
    target: 'web',
  });
  const serverConfig = configure({
    entry,
    hmr: false,
    name: 'server',
    outputPath: path.resolve(__dirname, '../build'),
    target: 'node',
  });
  const clientCompiler = webpack(clientConfig);
  const devMiddleware = webpackDevMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    stats: { chunkModules: false, colors: true },
  });
  const hotMiddleware = webpackHotMiddleware(clientCompiler);

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
      const bundlePath = getBundlePath(stats);
      const bundleExecutor = createChildExecutor(bundlePath, BUNDLE_ARGV);
      try {
        const markup = await bundleExecutor.invoke('renderPath', req.path);
        log.info(`rendered ${req.path}`);
        res.send(markup);
      } catch (error) {
        log.error(`server render error:\n${error.stack}`);
        res.status(500).type('text').send(error.stack);
      }
    }, () => {
      log.error('error rendering page using server bundle');
    }, () => {
      log.info('completed page render');
    });
  });

  app.listen(3000, () => {
    log.info(`started listening on port ${3000}`);
  });
}
