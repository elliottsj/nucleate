import memoize from 'memoize-id';
import path from 'path';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router';
import {
  filter,
  reduce,
} from 'wu';
import Children from './components/Children';
import invertMap from './utils/invertMap';
import resolvePromiseMap from './utils/resolvePromiseMap';

export { Link };
export { default as assets } from './components/assets';
export { default as Children } from './components/Children';
export { default as query } from './components/query';
export { default as QueryContext } from './components/QueryContext';
export {
  queryRoute,
  queryChildRoutes,
  resolveQueries,
} from './query';

function createMarkdownComponent(Layout = Children, meta, markdown) {
  return function MarkdownPage() {
    return (
      <Layout {...meta}>
        <ReactMarkdown
          source={markdown}
          renderers={{
            Link: props => /^~/.test(props.href)
              ? <Link to={props.href.replace(/^~/, '')} {...props} />
              : 'a',
          }}
        />
      </Layout>
    );
  };
}

/**
 * Create a react-router PlainRoute from the given module and optional routePath.
 * Memoized to ensure at most one PlainRoute is created per module.

 * XXX: this function must be memoized, otherwise `getIndexRoute()` / `getChildRoutes()`
 * will return a *new* PlainRoute, which causes `isIndexRoute` to fail.
 *
 * @param  {Object} mod
 *   Module object
 * @param  {String} [routePath]
 *   Optional path which will be used as a fallback for `mod.path`
 * @param  {Array<PlainRoute>}
 *   Optional additional routes to be appended to the module's child routes
 * @return {PlainRoute}
 *   A react-router PlainRoute
 */
export const createRoute = memoize((mod, routePath, moreChildRoutes = []) => {
  // Memoize route getters with async: 'immediate' so the cached route is synchronously available
  // to react-router upon rendering
  const getIndexRoute = (
    mod.getIndexRoute && memoize(mod.getIndexRoute, { arity: 0, async: 'immediate' })
  );
  const getChildRoutes = (
    mod.getChildRoutes && memoize(
      (location, callback) => mod.getChildRoutes(location, (error, childRoutes) => {
        callback(error, [...childRoutes, ...moreChildRoutes]);
      }),
      { arity: 0, async: 'immediate' }
    )
  );

  return {
    ...mod,
    component: mod.component || (mod.markdown && createMarkdownComponent(mod.layout, mod.meta, mod.markdown)),
    getIndexRoute,
    getChildRoutes,
    path: mod.path || routePath,
  };
});

function plainBasename(moduleName) {
  return path.basename(moduleName, path.extname(moduleName));
}

function dedupeModuleMap(moduleMap) {
  const uniqModuleMap = reduce(
    (uniq, [moduleName, mod]) =>
      (!uniq.has(mod) || moduleName < uniq.get(mod).length)
        ? uniq.set(mod, moduleName)
        : uniq,
    new Map(),
    moduleMap
  );

  return invertMap(uniqModuleMap);
}

function createRoutesFromMap(moduleMap) {
  const nonIndexModuleMap = filter(
    ([moduleName]) => plainBasename(moduleName) !== 'index',
    moduleMap
  );
  const uniqModuleMap = dedupeModuleMap(nonIndexModuleMap);
  return [...uniqModuleMap].map(
    ([moduleName, mod]) => createRoute(mod, plainBasename(moduleName))
  );
}

export function includeRoute(loadModule) {
  return async (location, callback) => {
    callback(null, await loadModule());
  };
}

export function includeRoutes(context) {
  const loadModules = () => resolvePromiseMap(new Map(
    context.keys().map(moduleName => [moduleName, context(moduleName)()])
  ));

  return async (location, callback) => {
    const moduleMap = await loadModules();
    callback(null, createRoutesFromMap(moduleMap));
  };
}
