import webpack from 'webpack'
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin'

export default function makeWebpackConfig ({ srcDir }) {
  return {
    entry: 'nucleate/lib/entry',
    output: {
      path: './build/',
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
      stats: { chunkModules: false, colors: true }
    }
  }
}
