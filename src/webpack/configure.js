import path from 'path';
import webpack from 'webpack';

const babelLoader = require.resolve('babel-loader');
const combineLoader = require.resolve('combine-loader');
const jsonLoader = require.resolve('json-loader');
const frontMatterLoader = require.resolve('front-matter-loader');
const htmlLoader = require.resolve('html-loader');
const markdownItLoader = require.resolve('markdown-it-loader');

export default function configure({
  outputPath,
  name,
  entry,
  target,
}) {
  return {
    name,
    entry: [
      // require.resolve('webpack-hot-middleware/client'),
      require.resolve('../entry'),
    ],
    output: {
      path: outputPath,
      publicPath: '/assets/',
      filename: `${name}.bundle.js`,
      pathinfo: true,
      libraryTarget: 'umd',
    },
    target,
    devtool: 'eval',
    module: {
      loaders: [
        { test: /\.jsx?$/, include: path.dirname(entry), loader: babelLoader },
        {
          test: /\.md$/,
          include: path.dirname(entry),
          loader: `${combineLoader}?${JSON.stringify({
            meta: [jsonLoader, `${frontMatterLoader}?onlyAttributes`],
            content: [htmlLoader, markdownItLoader, `${frontMatterLoader}?onlyBody`],
          })}`,
        },
      ],
    },
    resolve: {
      // TODO: remove this
      alias: {
        nucleate: path.resolve(__dirname, '..'),
      },
    },
    resolveLoader: {
      alias: {
        route: require.resolve('./loaders/route'),
      },
      extensions: ['', '.js', '.jsx'],
    },
    plugins: [
      new webpack.DefinePlugin({
        __NUCLEATE_ROOT__: JSON.stringify(entry),
      }),
      new webpack.optimize.OccurenceOrderPlugin(),
      // new webpack.HotModuleReplacementPlugin()
    ],
  };
}
