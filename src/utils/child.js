/* @flow */

/*
 * The module which is executed in a child process via `ChildExecutor#invoke`.
 */

import serializeError from 'serialize-error';

function send(message) {
  if (process.send) { process.send(message); }
}

process.on('message', (message) => {
  if (message.type === 'INVOKE_MODULE_FUNCTION') {
    const { modulePath, fnName, args } = message.payload;
    // $FlowIgnore: `require` is used here to execute the module at the given path
    const mod = require(modulePath); // eslint-disable-line global-require
    mod[fnName](...args).then(
      result => send({ type: 'RESULT', payload: result })
    ).catch((error) => {
      send({ type: 'ERROR', payload: serializeError(error) });
    });
    return;
  }

  send({
    type: 'ERROR',
    payload: serializeError(new Error(`Invalid message type: ${message.type}`)),
  });
});

send({ type: 'READY' });
