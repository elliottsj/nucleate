import evaluate from 'eval'
import express from 'express'
import path from 'path'
import Rx from 'rx-lite'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
// TODO: fix https://github.com/glenjamin/webpack-hot-middleware/issues/18
// import webpackHotMiddleware from 'webpack-hot-middleware'

import configure from './webpack/configure'

/**
 * Create a hot observable which emits `null` when the webpack build is in
 * progress, and emits the webpack `stats` object when the build is completed.
 * The most recent element is replayed to new subscribers.
 *
 * @param  {Compiler} compiler The webpack compiler
 * @return {Observable}        A hot RxJS Observable
 */
function createWebpack$ (compiler) {
  const webpack$ = Rx.Observable.create((observer) => {
    compiler.plugin('invalid', () => observer.onNext(null))
    compiler.plugin('failed', err => observer.onError(err))
    compiler.plugin('done', stats => observer.onNext(stats))
  }).replay(null, 1)
  webpack$.connect()
  return webpack$
}

function evalBundle (stats) {
  const bundleFilenames = stats.toJson().children.find(c => c.name === 'server').assetsByChunkName['main']
  const bundleFilename = Array.isArray(bundleFilenames) ? bundleFilenames[0] : bundleFilenames
  const bundleAsset = stats.stats.find(s => s.compilation.name === 'server').compilation.assets[bundleFilename]
  const bundleSource = bundleAsset.source()
  return evaluate(bundleSource, bundleFilename, /* scope: */ null, /* includeGlobals: */ true)
}

export default function (source) {
  console.log('serving', source)

  const clientConfig = configure({
    name: 'client',
    target: 'web',
    buildDir: '/',
    siteRoot: path.resolve(__dirname, '../examples/blog')
  })
  const serverConfig = configure({
    name: 'server',
    target: 'node',
    buildDir: '/',
    siteRoot: path.resolve(__dirname, '../examples/blog')
  })
  const compiler = webpack([clientConfig, serverConfig])
  const webpack$ = createWebpack$(compiler)
  // Create an observable which completes upon successful webpack build
  const webpackDone$ = webpack$.skipWhile(stats => !stats).take(1)

  const devMiddleware = webpackDevMiddleware(compiler, {
    publicPath: clientConfig.output.publicPath,
    stats: { chunkModules: false, colors: true }
  })
  // const hotMiddleware = webpackHotMiddleware(compiler)

  const app = express()
  app.use(devMiddleware)
  // app.use(hotMiddleware)
  app.use((req, res, next) => {
    console.log('waiting for webpack')
    webpackDone$.subscribe((stats) => {
      const renderer = evalBundle(stats)
      renderer.renderPath(req.path).then((markup) => {
        res.send(markup)
      }).catch((error) => {
        res.status(500).type('text').send(error.stack)
      })
    }, () => {
      console.error('error')
    }, () => {
      console.log('completed')
    })
  })

  app.listen(3000, () => {
    console.log('started listening on port %d', 3000)
  })
}
