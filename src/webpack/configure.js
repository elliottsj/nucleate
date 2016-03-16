import ExtractTextPlugin from 'extract-text-webpack-plugin';
import fs from 'fs';
import path from 'path';
import webpack from 'webpack';

const babelLoader = require.resolve('babel-loader');
const combineLoader = require.resolve('combine-loader');
const cssLoader = require.resolve('css-loader');
const frontMatterLoader = require.resolve('front-matter-loader');
const jsonLoader = require.resolve('json-loader');
const rawLoader = require.resolve('raw-loader');

const layoutLoader = require.resolve('./loaders/layout-loader');

export default function configure({
  entry,
  hmr = false,
  name,
  outputPath,
  target,
}) {
  const entryDir = fs.statSync(path.dirname(entry)).isDirectory()
    ? entry
    : path.dirname(entry);

  return {
    name,
    entry: [
      ...(hmr ? [`${require.resolve('webpack-hot-middleware/client')}?reload=true`] : []),
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
          test: /\.css$/,
          include: entryDir,
          loader: ExtractTextPlugin.extract(cssLoader),
        },
        {
          test: /\.jsx?$/,
          include: entryDir,
          exclude: /node_modules/,
          loader: babelLoader,
        },
        {
          test: /\.json$/,
          loader: jsonLoader,
        },
        {
          test: /\.md$/,
          include: entryDir,
          loader: `${combineLoader}?${JSON.stringify({
            layout: [layoutLoader, jsonLoader, `${frontMatterLoader}?onlyAttributes`],
            meta: [jsonLoader, `${frontMatterLoader}?onlyAttributes`],
            markdown: [rawLoader, `${frontMatterLoader}?onlyBody`],
          })}`,
        },
      ],
    },
    resolve: {
      root: entryDir,
      extensions: ['', '.js', '.jsx'],
    },
    resolveLoader: {
      fallback: path.resolve(__dirname, './loaders'),
    },
    plugins: [
      new webpack.DefinePlugin({
        __SITE_ENTRY__: JSON.stringify(entry),
      }),
      new ExtractTextPlugin(`${name}.bundle.css`, { allChunks: true }),
      new webpack.optimize.OccurrenceOrderPlugin(),
      ...(hmr ? [new webpack.HotModuleReplacementPlugin()] : []),
    ],
  };
}
