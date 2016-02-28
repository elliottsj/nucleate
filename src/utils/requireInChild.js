import createLogger from './createLogger';
const log = createLogger('requireInChild');

import split from 'argv-split';
import childProcess from 'child_process';
import path from 'path';

function once(cp, messageType, done) {
  function listener(message) {
    if (message.type === messageType) {
      cp.removeListener('message', listener);
      done(message.payload);
    }
  }
  cp.on('message', listener);
}

export default function requireInChild(modulePath, argv = '') {
  const cp = childProcess.fork(path.resolve(__dirname, './child'), [], {
    execArgv: split(argv),
  });

  const childReady = new Promise((resolve) => {
    once(cp, 'READY', () => {
      cp.send({
        type: 'REQUIRE_MODULE',
        payload: modulePath,
      });
      resolve();
    });
  });

  cp.on('message', (message) => {
    if (message.type === 'ERROR') {
      const error = message.payload;
      log.error(`An error occurred while executing the child process: ${error}`);
    }
  });

  function callAsyncMethod(methodName, ...args) {
    return childReady.then(() => new Promise((resolve, reject) => {
      once(cp, 'ASYNC_METHOD_RESULT', payload => resolve(payload));
      once(cp, 'ASYNC_METHOD_ERROR', payload => reject(payload));
      cp.send({
        type: 'CALL_ASYNC_METHOD',
        payload: { methodName, args },
      });
    }));
  }

  function kill() {
    cp.kill();
  }

  return {
    callAsyncMethod,
    kill,
  };
}
