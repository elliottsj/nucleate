import serializeError from 'serialize-error';

let mod = null;

function raise(error) {
  process.send({
    type: 'ERROR',
    payload: serializeError(error),
  });
}

process.on('message', (message) => {
  switch (message.type) {
    case 'REQUIRE_MODULE': {
      const modulePath = message.payload;
      mod = require(modulePath);
      break;
    }
    case 'CALL_ASYNC_METHOD': {
      const { methodName, args } = message.payload;
      if (!mod) {
        raise(new Error('No module has been `require`-ed yet.'));
      }
      const method = mod[methodName];
      method(...args).then((result) => {
        process.send({
          type: 'ASYNC_METHOD_RESULT',
          payload: result,
        });
      }, (error) => {
        process.send({
          type: 'ASYNC_METHOD_ERROR',
          payload: serializeError(error),
        });
      });
      break;
    }
    default:
      raise(new Error(`Invalid message type: ${message.type}`));
  }
});

process.send({
  type: 'READY',
});
