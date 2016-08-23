import loaderUtils from 'loader-utils';

module.exports = function load(source) {
  // Get JSON value as `meta` from json-loader
  const meta = this.exec(source, this.resourcePath);
  if (meta.layout) {
    // `.layout` is defined, so `require()` the layout
    return `module.exports = require(${loaderUtils.stringifyRequest(this, meta.layout)}).default;`;
  }
  return 'module.exports = undefined;';
};
