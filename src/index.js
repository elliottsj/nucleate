/* @flow */

import map from 'lodash/fp/map';
import pipe from 'lodash/fp/pipe';
import sortBy from 'lodash/fp/sortBy';
import uniqBy from 'lodash/fp/uniqBy';
import memoize from 'memoize-id';
import path from 'path';
import React from 'react';
import renderHTML from '@elliottsj/react-render-html';
import { Link } from 'react-router';

import type { PlainRoute } from 'react-router';
import type { Context } from 'webpack';

import Children from './components/Children';
import { asCPSFunction1 } from './utils/promises';

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

type RouteModule = ReactRouter$PlainRoute & {
  html?: string,
  layout?: ReactClass,
  meta?: JSONObject,
};
type ModulePath = string;
type ContextRouteModule = [ModulePath, RouteModule];

function replaceLinks() {
  return (next) => (node, key) => {
    const element = next(node, key);
    if (node.tagName === 'a' && /^~/.test(element.props.href)) {
      return <Link {...element.props} to={element.props.href.replace(/^~/, '')} />;
    }
    return element;
  };
}

function createHTMLComponent(Layout = Children, meta, html) {
  return function HTMLFragment() {
    return (
      <Layout {...meta}>
        <div>
          {renderHTML(html, replaceLinks)}
        </div>
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
    meta: {},
    ...mod,
    component: (
      mod.component || (mod.html && createHTMLComponent(mod.layout, mod.meta, mod.html))
    ),
    getIndexRoute,
    getChildRoutes,
    path: mod.path || routePath,
  };
});

function basenameWithoutExtension(moduleName) {
  return path.basename(moduleName, path.extname(moduleName));
}

const createRoutesFromModules: (modules: ContextRouteModule[]) => PlainRoute[] = pipe(
  // Sort by shortest module path so that the shorter path is taken for duplicate modules
  // e.g. choose './posts' over './posts.jsx'
  sortBy(([modulePath]) => modulePath.length),
  uniqBy(([, mod]) => mod),
  map(([modulePath, mod]) => createRoute(mod, basenameWithoutExtension(modulePath))),
);

export function includeRoute(loadModule: () => Promise<RouteModule>): ReactRouter$AsyncIndexRoute {
  return asCPSFunction1(loadModule().then(createRoute));
}
export function includeRoutes(context: Context): ReactRouter$AsyncChildRoutes {
  const modulesPromises: Promise<ContextRouteModule>[] = context.keys()
    .map(modulePath => context(modulePath)().then(mod => [modulePath, mod]));
  return asCPSFunction1(Promise.all(modulesPromises).then(createRoutesFromModules));
}
