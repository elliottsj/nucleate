import createLogger from './utils/createLogger';
const log = createLogger('build');

import split from 'argv-split';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import webpack from 'webpack';

import configure from './webpack/configure';
import requireInChild from './utils/requireInChild';

const BUNDLE_ARGV = split(process.env.BUNDLE_ARGV || '');

function getBundlePath(stats) {
  const mainAssets = stats.toJson().assetsByChunkName.main;
  return path.resolve(
    stats.compilation.compiler.outputPath,
    Array.isArray(mainAssets) ? mainAssets[0] : mainAssets
  );
}

export default function (source, destination) {
  const entry = path.resolve(source);
  log.info(`building ${entry}`);

  const clientConfig = configure({
    entry,
    hmr: true,
    name: 'client',
    outputPath: path.resolve(destination, 'assets'),
    target: 'web',
  });
  const serverConfig = configure({
    entry,
    hmr: false,
    name: 'server',
    outputPath: path.resolve(__dirname, '../build'),
    target: 'node',
  });
  const clientCompiler = webpack(clientConfig);
  clientCompiler.run((err, stats) => {
    if (err) {
      throw err;
    }
    log.info('client webpack completed');
    log.log('info', stats.toString({ chunkModules: false, colors: true }));
  });

  const serverCompiler = webpack(serverConfig);
  serverCompiler.run((err, stats) => {
    if (err) {
      throw err;
    }
    const bundlePath = getBundlePath(stats);
    const bundleProxy = requireInChild(bundlePath, BUNDLE_ARGV);
    bundleProxy.callAsyncMethod('renderAll').then((routesMarkup) => {
      bundleProxy.kill();
      for (const [routePath, markup] of routesMarkup) {
        const htmlPath = path.resolve(destination, routePath.replace(/^\//, ''), 'index.html');
        log.info(`rendering ${htmlPath}`);
        mkdirp.sync(path.dirname(htmlPath));
        fs.writeFileSync(htmlPath, markup);
      }
    }).catch((error) => {
      bundleProxy.kill();
      log.error(error.stack);
    });
    log.info('server webpack completed');
    log.log('info', stats.toString({ chunkModules: false, colors: true }));
  });
}
