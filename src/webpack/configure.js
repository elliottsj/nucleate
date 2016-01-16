import webpack from 'webpack'

const babelLoader = require.resolve('babel-loader')
const combineLoader = require.resolve('combine-loader')
const jsonLoader = require.resolve('json-loader')
const frontMatterLoader = require.resolve('front-matter-loader')
const htmlLoader = require.resolve('html-loader')
const markdownItLoader = require.resolve('markdown-it-loader')

export default function configure ({
  buildDir,
  name,
  siteRoot,
  target
}) {
  return {
    name,
    entry: require.resolve('../entry'),
    output: {
      path: buildDir,
      publicPath: '/assets',
      filename: 'bundle.js',
      pathinfo: true,
      libraryTarget: 'umd'
    },
    target,
    devtool: 'source-map',
    module: {
      loaders: [
        { test: /\.js$/, include: siteRoot, loader: babelLoader },
        {
          test: /\.md$/,
          include: siteRoot,
          loader: `${combineLoader}?${JSON.stringify({
            meta: [jsonLoader, `${frontMatterLoader}?onlyAttributes`],
            content: [htmlLoader, markdownItLoader, `${frontMatterLoader}?onlyBody`]
          })}`
        }
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
