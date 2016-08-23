import ExtractTextPlugin from 'extract-text-webpack-plugin';
import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import XhrEvalChunkPlugin from 'xhr-eval-chunk-webpack-plugin';

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
  entry,
  hmr = false,
  name,
  outputPath,
  target,
  xhrEvalChunks = false,
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
    devtool: 'cheap-module-eval-source-map',
    module: {
      loaders: [
        {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          loader: ExtractTextPlugin.extract({ loader: `${cssLoader}?sourceMap` }),
        },
        {
          test: /\.module\.css$/,
          loader: ExtractTextPlugin.extract({ loader: `${cssLoader}?sourceMap&modules` }),
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
      alias: {
        nucleate: path.resolve(__dirname, '../..'),
      },
      modules: [entryDir, 'node_modules'],
      extensions: ['', '.js', '.jsx', '.json'],
    },
    resolveLoader: {
      modules: path.resolve(__dirname, './loaders'),
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        __SITE_ENTRY__: JSON.stringify(entry),
      }),
      new ExtractTextPlugin({ filename: '[name].bundle.css', allChunks: true }),
      ...(hmr ? [
        new webpack.HotModuleReplacementPlugin(),
      ] : []),
      ...(xhrEvalChunks ? [
        new XhrEvalChunkPlugin(),
      ] : []),
    ],
    'markdown-it': {
      preset: 'commonmark',
    },
  };
}
