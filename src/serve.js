import createLogger from './utils/createLogger';
const log = createLogger('serve');

import express from 'express';
import path from 'path';
import Rx from 'rx-lite';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
// TODO: fix https://github.com/glenjamin/webpack-hot-middleware/issues/18
// import webpackHotMiddleware from 'webpack-hot-middleware'

import requireInChild from './utils/requireInChild';
import configure from './webpack/configure';

const { BUNDLE_ARGV } = process.env;

/**
 * Create a hot observable which emits `null` when the webpack build is in
 * progress, and emits the webpack `stats` object when the build is completed.
 * The most recent element is replayed to new subscribers.
 *
 * @param  {Compiler} compiler The webpack compiler
 * @return {Observable}        A hot RxJS Observable
 */
function createWebpack$(compiler) {
  const webpack$ = Rx.Observable.create((observer) => {
    compiler.plugin('invalid', () => observer.onNext(null));
    compiler.plugin('failed', err => observer.onError(err));
    compiler.plugin('done', stats => observer.onNext(stats));
  }).replay(null, 1);
  webpack$.connect();
  return webpack$;
}

function getBundlePath(stats) {
  return path.resolve(
    stats.compilation.compiler.outputPath,
    stats.toJson().assetsByChunkName.main
  );
}

export default function (source) {
  log.info(`serving ${source}`);

  const clientConfig = configure({
    name: 'client',
    outputPath: '/',
    entry: path.resolve(__dirname, '../examples/blog/index.jsx'),
    target: 'web',
  });
  const serverConfig = configure({
    name: 'server',
    outputPath: path.resolve(__dirname, '../build'),
    entry: path.resolve(__dirname, '../examples/blog/index.jsx'),
    target: 'node',
  });
  const clientCompiler = webpack(clientConfig);
  const devMiddleware = webpackDevMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    stats: { chunkModules: false, colors: true },
  });
  // const hotMiddleware = webpackHotMiddleware(compiler)

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
  // app.use(hotMiddleware)
  app.use((req, res) => {
    log.info('waiting for webpack');
    serverWebpackDone$.subscribe((stats) => {
      const bundlePath = getBundlePath(stats);
      const bundleProxy = requireInChild(bundlePath, BUNDLE_ARGV);
      bundleProxy.callAsyncMethod('renderPath', req.path).then((markup) => {
        log.info(`rendered ${req.path}`);
        bundleProxy.kill();
        res.send(markup);
      }).catch((error) => {
        bundleProxy.kill();
        log.error(error.stack);
        res.status(500).type('text').send(error.stack);
      });
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
