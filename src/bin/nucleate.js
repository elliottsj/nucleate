#! /usr/bin/env node
// @flow

import program from 'commander';
import pkg from '../../package.json';
import {
  build,
  serve,
} from '../compile';

program
  .version(pkg.version)
  .description(pkg.description);

function applyCommonOptions(pg) {
  return pg
    .option(
      '--devtool [type]',
      'Use a custom webpack devtool. ' +
      'Use \'none\' to disable. Default: \'cheap-module-eval-source-map\'',
      devtool => (devtool === 'none' ? undefined : devtool),
      'cheap-module-eval-source-map',
    )
    .option(
      '-m --minify',
      'Minify JS and CSS.',
      false,
    );
}

applyCommonOptions(
  program
    .command(
      'serve <source>'
    )
    .description(
      'Serve the site from the given source directory'
    )
  )
  .option(
    '-p --port [port]',
    'Port to use. [3000]',
    v => parseInt(v, 10),
    3000,
  )
  .option(
    '-h --hostname [hostname]',
    'Hostname to use. [::] if IPv6 available, else 0.0.0.0',
  )
  .action(
    (source, options) =>
      serve({
        source,
        devtool: options.devtool,
        hostname: options.hostname,
        minify: options.minify,
        port: options.port,
      })
  );

applyCommonOptions(
  program
    .command(
      'build <source> [destination=./build]'
    )
    .description(
      'Build site from the given source directory, optionally specifying a destination directory'
    )
  )
  .action(
    (source, destination = './build', options) =>
      build({
        source,
        destination,
        devtool: options.devtool,
        minify: options.minify,
      })
  );

program.parse(process.argv);
