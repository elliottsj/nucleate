import ExtractTextPlugin from 'extract-text-webpack-plugin';
import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import ConstDependency from 'webpack/lib/dependencies/ConstDependency';
import BasicEvaluatedExpression from 'webpack/lib/BasicEvaluatedExpression';

const babelLoader = require.resolve('babel-loader');
const combineLoader = require.resolve('combine-loader');
const cssLoader = require.resolve('css-loader');
const frontMatterLoader = require.resolve('front-matter-loader');
const jsonLoader = require.resolve('json-loader');
const rawLoader = require.resolve('raw-loader');
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
      filename: `${name}.[name].bundle.js`,
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
            markdown: [rawLoader, `${frontMatterLoader}?onlyBody`],
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
      extensions: ['', '.js', '.jsx'],
    },
    resolveLoader: {
      fallback: path.resolve(__dirname, './loaders'),
    },
    plugins: [
      new webpack.DefinePlugin({
        __SITE_ENTRY__: JSON.stringify(entry),
      }),
      new ExtractTextPlugin(`${name}.[name].bundle.css`, { allChunks: true }),
      new webpack.optimize.OccurrenceOrderPlugin(),
      ...(commonsChunk ? [
        new webpack.optimize.CommonsChunkPlugin({ name: 'commons' })
      ] : []),
      ...(hmr ? [
        new webpack.HotModuleReplacementPlugin()
      ] : []),
      {
        apply(compiler) {
          compiler.plugin('compilation', (compilation) => {
            compilation.mainTemplate.plugin('require-ensure', function (source, chunk, hash) {
              const filename = this.outputOptions.filename || 'bundle.js';
              const chunkFilename = this.outputOptions.chunkFilename || `[id].${filename}`;
              const chunkMaps = chunk.getChunkMaps();
              const assetPath = this.applyPluginsWaterfall("asset-path", JSON.stringify(chunkFilename), {
                hash: "\" + " + this.renderCurrentHashCode(hash) + " + \"",
                hashWithLength: function(length) {
                  return "\" + " + this.renderCurrentHashCode(hash, length) + " + \"";
                }.bind(this),
                chunk: {
                  id: "\" + chunkId + \"",
                  hash: "\" + " + JSON.stringify(chunkMaps.hash) + "[chunkId] + \"",
                  hashWithLength: function(length) {
                    var shortChunkHashMap = {};
                    Object.keys(chunkMaps.hash).forEach(function(chunkId) {
                      if(typeof chunkMaps.hash[chunkId] === "string")
                        shortChunkHashMap[chunkId] = chunkMaps.hash[chunkId].substr(0, length);
                    });
                    return "\" + " + JSON.stringify(shortChunkHashMap) + "[chunkId] + \"";
                  },
                  name: "\" + (" + JSON.stringify(chunkMaps.name) + "[chunkId]||chunkId) + \""
                }
              });

              // surround the chunk-loading code with `'start';` and `'end';` string literals
              return this.asString([
                'var isInstalled = !!installedChunks[chunkId];',
                '(function loadChunk(callback) {',
                this.indent(source),
                '}(function() {',
                this.indent([
                  'if (!isInstalled) {',
                  this.indent([
                    `${this.requireFn}.c.push({`,
                    this.indent([
                      'id: chunkId,',
                      `path: ${this.requireFn}.p + ${assetPath}`,
                    ]),
                    '});',
                  ]),
                  '}',
                  'callback.apply(this, arguments);',
                ]),
                '}));',
              ]);
            });
            compilation.mainTemplate.plugin('require-extensions', function (source) {
              return this.asString([
                source,
                '',
                '// __webpack_chunks__',
                `${this.requireFn}.c = [];`,
              ]);
            });
          });
          compiler.parser.plugin('expression __webpack_chunks__', function (expr) {
            const dep = new ConstDependency('__webpack_require__.c', expr.range);
            dep.loc = expr.loc;
            this.state.current.addDependency(dep);
            return true;
          });
          compiler.parser.plugin('evaluate typeof __webpack_chunks__', function (expr) {
            return new BasicEvaluatedExpression().setString('string').setRange(expr.range);
          });
        },
      },
    ],
  };
}
