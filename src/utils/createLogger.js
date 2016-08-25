// @flow

import log from 'npmlog';

export interface Logger {
  error(message: string): void;
  info(message: string): void;
  log(message: string): void;
  silent(message: string): void;
  silly(message: string): void;
  verbose(message: string): void;
  warn(message: string): void;
}

/**
 * Create a stderr logger with the given prefix.
 * @param  {string} prefix
 *   A prefix to all log messages
 * @return {Object}
 *   An object with methods: `silly`, `verbose`, `info`,
 *   `warn`, `error`, and `silent` which can be used
 *   to log messages to stderr.
 */
export default function createLogger(prefix: string): Logger {
  return {
    log: (level, message, ...args) => {
      log.log(level, /* no prefix */ '', message, ...args);
    },
    silly: log.silly.bind(prefix),
    verbose: log.verbose.bind(prefix),
    info: log.info.bind(prefix),
    warn: log.warn.bind(prefix),
    error: log.error.bind(prefix),
    silent: log.silent.bind(prefix),
  };
}
