export { Link } from 'react-router';
export { default as Assets } from './components/Assets';
export { default as Children } from './components/Children';
export { default as query } from './components/query';
export { default as QueryContext } from './components/QueryContext';
export {
  queryRoute,
  queryChildRoutes,
  resolveQueries,
} from './query';

import memoize from 'memoize-id';
import path from 'path';
import React from 'react';

function createHtmlComponent(html) {
  return function HtmlFragment() {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };
}

/**
 * Create a react-router PlainRoute from the given module and optional routePath.
 * Memoized to ensure at most one PlainRoute is created per module.

 * XXX: if this function is not memoized, `getIndexRoute()` / `getChildRoutes()`
 * will return a *new* PlainRoute, which causes `isIndexRoute` to fail.
 *
 * @param  {Object} mod         Module object
 * @param  {String} [routePath] Optional path which will be used as a fallback for `mod.path`
 * @return {PlainRoute}         A react-router PlainRoute
 */
export const createRoute = memoize((mod, routePath) => ({
  ...mod,
  component: mod.component || (mod.content && createHtmlComponent(mod.content)),
  path: mod.path || routePath,
}));

function plainBasename(moduleName) {
  return path.basename(moduleName, path.extname(moduleName));
}

export function createRoutesFromContext(context) {
  return context.keys().filter(
    moduleName => plainBasename(moduleName) !== 'index'
  ).map((moduleName) => {
    const mod = context(moduleName);
    return createRoute(mod, plainBasename(moduleName));
  });
}
