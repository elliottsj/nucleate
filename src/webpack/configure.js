import path from 'path';
import webpack from 'webpack';

const babelLoader = require.resolve('babel-loader');
const combineLoader = require.resolve('combine-loader');
const frontMatterLoader = require.resolve('front-matter-loader');
const htmlLoader = require.resolve('html-loader');
const jsonLoader = require.resolve('json-loader');
const markdownItLoader = require.resolve('markdown-it-loader');
const rawLoader = require.resolve('raw-loader');

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
        {
          test: /\.jsx?$/,
          include: path.dirname(entry),
          loader: babelLoader,
        },
        {
          test: /\.json$/,
          loader: jsonLoader,
        },
        {
          test: /\.md$/,
          include: path.dirname(entry),
          loader: `${combineLoader}?${JSON.stringify({
            meta: [jsonLoader, `${frontMatterLoader}?onlyAttributes`],
            markdown: [rawLoader, `${frontMatterLoader}?onlyBody`],
          })}`,
        },
        // {
        //   test: /\.md$/,
        //   include: path.dirname(entry),
        //   loader: `${combineLoader}?${JSON.stringify({
        //     meta: [jsonLoader, `${frontMatterLoader}?onlyAttributes`],
        //     content: [htmlLoader, markdownItLoader, `${frontMatterLoader}?onlyBody`],
        //   })}`,
        // },
      ],
    },
    resolve: {
      // TODO: remove this
      alias: {
        nucleate: path.resolve(__dirname, '..'),
      },
      extensions: ['', '.js', '.jsx'],
    },
    resolveLoader: {
      fallback: path.resolve(__dirname, './loaders'),
    },
    plugins: [
      new webpack.DefinePlugin({
        __SITE_ENTRY__: JSON.stringify(entry),
      }),
      // new webpack.HotModuleReplacementPlugin()
    ],
  };
}
