#! /usr/bin/env node
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
  .description(
    'Serve the site from the given source directory'
  )
  .action(source => serve(source));

program
  .command(
    'build <source> [destination=./build]'
  )
  .description(
    'Build site from the given source directory, optionally specifying a destination directory'
  )
  .action((source, destination) => build(source, destination));

program.parse(process.argv);
