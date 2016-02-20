import log from 'npmlog';

/**
 * Create a stderr logger with the given prefix.
 * @param  {String} prefix A prefix to all log messages
 * @return {Object}        An object with methods: `silly`, `verbose`, `info`,
 *                         `warn`, `error`, and `silent` which can be used
 *                         to log messages to stderr.
 */
export default function createLogger(prefix) {
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
