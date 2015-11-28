import webpack from 'webpack'
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin'

export default function makeWebpackConfig ({ srcDir }) {
  const isProduction = process.env.NODE_ENV === 'production'
  return {
    entry: 'nucleate/lib/entry',
    output: {
      path: './build/',
      publicPath: '/',
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
          loaders: [
            'html',
            'markdown-it',
            'front-matter?onlyBody' // Strip frontmatter before passing to markdown-it
          ]
        },
        {
          test: /\.(gif|jpg|jpeg|png|svg)/,
          include: srcDir,
          loader: 'file'
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        __NUCLEATE_SRC_DIR__: JSON.stringify(srcDir)
      }),
      new StaticSiteGeneratorPlugin('main'),
      ...(isProduction
        ? [
          new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false },
            // sourceMap: false
          })
        ]
        : []
      )
    ],
    resolve: {
      root: srcDir
    },
    devtool: isProduction
      ? 'eval'
      : undefined,
    devServer: {
      stats: { chunkModules: false, colors: true }
    }
  }
}
