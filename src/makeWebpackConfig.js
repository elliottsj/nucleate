import webpack from 'webpack'
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin'

export default function makeWebpackConfig ({ srcDir }) {
  return {
    entry: 'nucleate/lib/entry',
    output: {
      path: './build/',
      // publicPath: '/static/',
      filename: 'bundle.js',
      libraryTarget: 'umd'
    },
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          include: srcDir,
          loader: 'babel'
        },
        {
          test: /\.md$/,
          include: srcDir,
          loader: 'html!markdown-it'
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        __NUCLEATE_SRC_DIR__: JSON.stringify(srcDir)
      }),
      new StaticSiteGeneratorPlugin('main')
    ],
    devtool: 'eval',
    devServer: {
      historyApiFallback: true,
      stats: { chunkModules: false, colors: true }
    }
  }
}
