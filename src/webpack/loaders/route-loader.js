import loaderUtils from 'loader-utils';

module.exports = function load() {};
module.exports.pitch = function pitch(remainingRequest) {
  const request = loaderUtils.stringifyRequest(this, `!!promise-loader?global!${remainingRequest}`);
  return `module.exports = require(${request})`;
};
