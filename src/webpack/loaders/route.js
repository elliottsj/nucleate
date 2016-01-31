module.exports = function () {};
module.exports.pitch = function (remainingRequest) {
  // Escape quotation marks (")
  const request = remainingRequest.replace(/\x22/g, '\\\x22');
  return (
    `var route = require("-!${request}");` +
    `route.modulePath = "${request}";` +
    `module.exports = route;`
  );
};
