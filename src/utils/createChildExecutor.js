// @flow

import createLogger from './createLogger';
const log = createLogger('requireInChild');

import childProcess from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';

export interface ChildExecutor {
  invoke(fnName: string, ...args: Array<any>): Promise<JSON>;
}

/**
 * Create an EventEmitter which emits messages from the executing child process.
 */
function createMessageEmitter(cp: childProcess.ChildProcess) {
  const emitter = new EventEmitter();
  cp.on('message', message => emitter.emit(message.type, message.payload));
  return emitter;
}

/**
 * Create an object with a single method `invoke`, which executes the Node.js module at the given
 * path in a child process and invokes the named exported function, returning a promise which
 * resolves with the returned value, else rejects with an error.
 */
export default function createChildExecutor(
  modulePath: string,
  execArgv: Array<string> = []
): ChildExecutor {
  return {
    invoke(fnName, ...args) {
      return new Promise((resolve, reject) => {
        const cp = childProcess.fork(path.resolve(__dirname, './child'), [], { execArgv });
        cp.on('error', (error) => {
          log.error(
            `An error occurred while executing '${modulePath}' as a child process:\n${error.stack}`
          );
        });
        const messageEmitter = createMessageEmitter(cp);
        messageEmitter.on('RESULT', result => {
          cp.kill();
          resolve(result);
        });
        messageEmitter.on('ERROR', error => {
          cp.kill();
          reject(error);
        });
        messageEmitter.on('READY', () => cp.send({
          type: 'INVOKE_MODULE_FUNCTION',
          payload: { modulePath, fnName, args },
        }));
      });
    },
  };
}
