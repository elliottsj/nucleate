import webpack from 'webpack'

const babelLoader = require.resolve('babel-loader')

export default function configure ({
  buildDir,
  siteRoot
}) {
  return {
    entry: require.resolve('../entry'),
    output: {
      path: buildDir,
      publicPath: '/assets',
      filename: 'bundle.js',
      pathinfo: true,
      libraryTarget: 'umd'
    },
    devtool: 'source-map',
    module: {
      loaders: [
        { test: /\.js$/, include: siteRoot, loader: babelLoader }
      ]
    },
    resolve: {
      alias: {
        'nucleate': require.resolve('..')
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        __NUCLEATE_ROOT__: JSON.stringify(siteRoot)
      })
    ]
  }
}
