#! /usr/bin/env node
/* @flow */

import pkg from '../../package.json';
import program from 'commander';

import serve from '../serve';
import build from '../build';

program
  .version(pkg.version)
  .description(pkg.description);

program
  .command(
    'serve <source>'
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
  .description(
    'Serve the site from the given source directory'
  )
  .action(
    (source, options) =>
      serve(source, options.port, options.hostname)
  );

program
  .command(
    'build <source> [destination=./build]'
  )
  .description(
    'Build site from the given source directory, optionally specifying a destination directory'
  )
  .action(
    (source, destination = './build') =>
      build(source, destination)
  );

program.parse(process.argv);
