import loaderUtils from 'loader-utils';

module.exports = function load() {
  const [meta] = this.inputValue;
  if (meta.layout) {
    return `module.exports = require(${loaderUtils.stringifyRequest(this, meta.layout)}).default;`;
  }
  return 'module.exports = undefined;';
};
