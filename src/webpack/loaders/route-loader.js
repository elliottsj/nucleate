import loaderUtils from 'loader-utils';

const bundleLoader = require.resolve('bundle-loader');

module.exports = function load() {};
module.exports.pitch = function pitch(remainingRequest) {
  const request = loaderUtils.stringifyRequest(this, `!!${bundleLoader}?lazy!${remainingRequest}`);
  return `module.exports = require(${request})`;
};
