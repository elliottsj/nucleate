import path from 'path'
import webpack from 'webpack'
import NucleatePlugin from 'nucleate-webpack-plugin'

export default function makeWebpackConfig ({ srcDir }) {
  const isProduction = process.env.NODE_ENV === 'production'
  return {
    entry: 'nucleate/lib/entry',
    output: {
      path: './build/',
      publicPath: '/',
      filename: 'bundle.js',
      pathinfo: !isProduction,
      libraryTarget: 'umd'
    },
    module: {
      loaders: [
        {
          test: /\.md$/,
          include: srcDir,
          loader: 'combine-loader?' + JSON.stringify({
            frontmatter: ['json-loader', 'front-matter-loader?onlyAttributes'],
            content: ['html-loader', 'markdown-it-loader', 'front-matter-loader?onlyBody']
          })
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        __NUCLEATE_SRC_DIR__: JSON.stringify(srcDir)
      }),
      new NucleatePlugin('main'),
      ...(isProduction
        ? [
          new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false },
            sourceMap: false
          })
        ]
        : []
      )
    ],
    resolve: {
      root: srcDir
    },
    // To avoid having loader peerDependencies,
    // resolve loaders in ../node_modules as a fallback
    resolveLoader: {
      fallback: path.resolve(__dirname, '../node_modules')
    },
    devtool: isProduction
      ? 'eval'
      : undefined,
    devServer: {
      stats: { chunkModules: false, colors: true }
    }
  }
}
