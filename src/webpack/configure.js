import ExtractTextPlugin from 'extract-text-webpack-plugin';
import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import ChunkApiPlugin from 'webpack-chunks-api-plugin';

const babelLoader = require.resolve('babel-loader');
const combineLoader = require.resolve('combine-loader');
const cssLoader = require.resolve('css-loader');
const frontMatterLoader = require.resolve('front-matter-loader');
const htmlLoader = require.resolve('html-loader');
const jsonLoader = require.resolve('json-loader');
const markdownItLoader = require.resolve('markdown-it-loader');
const urlLoader = require.resolve('url-loader');

const layoutLoader = require.resolve('./loaders/layout-loader');

export default function configure({
  commonsChunk = false,
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
      chunkFilename: '[name].bundle.js',
      filename: '[name].bundle.js',
      pathinfo: true,
      libraryTarget: 'umd',
    },
    target,
    devtool: 'eval',
    module: {
      loaders: [
        {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          loader: ExtractTextPlugin.extract(cssLoader),
        },
        {
          test: /\.module\.css$/,
          loader: ExtractTextPlugin.extract(`${cssLoader}?modules`),
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
            html: [htmlLoader, markdownItLoader, `${frontMatterLoader}?onlyBody`],
          })}`,
        },
        {
          test: /\.(gif|jpg|jpeg|png|svg|eot|woff|woff2|ttf)(\?v=.+)?$/,
          loader: `${urlLoader}?limit=10000`,
        },
      ],
    },
    resolve: {
      root: entryDir,
      extensions: ['', '.js', '.jsx', '.json'],
    },
    resolveLoader: {
      fallback: path.resolve(__dirname, './loaders'),
    },
    plugins: [
      new webpack.DefinePlugin({
        __SITE_ENTRY__: JSON.stringify(entry),
      }),
      new ExtractTextPlugin('[name].bundle.css', { allChunks: true }),
      ...(commonsChunk ? [
        new webpack.optimize.CommonsChunkPlugin({ name: 'commons' }),
      ] : []),
      ...(hmr ? [
        new webpack.HotModuleReplacementPlugin(),
      ] : []),
      new ChunkApiPlugin(),
    ],
    'markdown-it': {
      preset: 'commonmark',
    },
  };
}
