import evaluate from 'eval';
import express from 'express';
import path from 'path';
import Rx from 'rx-lite';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
// TODO: fix https://github.com/glenjamin/webpack-hot-middleware/issues/18
// import webpackHotMiddleware from 'webpack-hot-middleware'

import configure from './webpack/configure';

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

// function evalBundle(stats) {
//   debugger
//   const bundleFilenames = stats.toJson().children.find(c => c.name === 'server').assetsByChunkName['main'];
//   const bundleFilename = Array.isArray(bundleFilenames) ? bundleFilenames[0] : bundleFilenames;
//   const bundleAsset = stats.stats.find(s => s.compilation.name === 'server').compilation.assets[bundleFilename];
//   const bundleSource = bundleAsset.source();
//   return evaluate(bundleSource, bundleFilename, /* scope: */ null, /* includeGlobals: */ true)
// }

function requireBundle(stats) {
  const bundlePath = path.resolve(
    stats.compilation.compiler.outputPath,
    stats.toJson().assetsByChunkName.main
  );
  return require(bundlePath);
}

export default function (source) {
  console.log('serving', source);

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
  serverCompiler.run((err, stats) => {
    console.log('server webpack completed');
  });

  const app = express();
  app.use(devMiddleware);
  // app.use(hotMiddleware)
  app.use((req, res) => {
    console.log('waiting for webpack');
    serverWebpackDone$.subscribe((stats) => {
      const renderer = requireBundle(stats);
      renderer.renderPath(req.path).then((markup) => {
        res.send(markup);
      }).catch((error) => {
        console.error(error.stack);
        res.status(500).type('text').send(error.stack);
      });
    }, () => {
      console.error('error');
    }, () => {
      console.log('completed');
    });
  });

  app.listen(3000, () => {
    console.log('started listening on port %d', 3000);
  });
}
