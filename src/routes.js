import parallel from 'async/parallel';
import filter from 'lodash/fp/filter';
import map from 'lodash/fp/map';
import pipe from 'lodash/fp/pipe';
import sortBy from 'lodash/fp/sortBy';
import uniqBy from 'lodash/fp/uniqBy';
import memoize from 'memoize-id';
import path from 'path';

import type { PlainRoute } from 'react-router';
import type { Context } from 'webpack';

import createHTMLComponent from './components/createHTMLComponent';

type RouteModule = ReactRouter$PlainRoute & {
  html?: string,
  layout?: ReactClass,
  meta?: JSONObject,
};
type ModulePath = string;
type ContextRouteModule = [ModulePath, RouteModule];

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
export function createRoute(mod, routePath) {
  const pth = mod.path || routePath;
  return {
    meta: {},
    ...mod,
    component: (
      mod.component ||
      (mod.html && createHTMLComponent(mod.layout, mod.meta, mod.html))
    ),
    ...(pth && { path: pth }),
  };
}

export function getRoutePath(moduleName) {
  return path.join(
    path.dirname(moduleName),
    path.basename(moduleName, path.extname(moduleName))
  );
}

export const createRoutesFromModules: (modules: ContextRouteModule[]) => PlainRoute[] = pipe(
  // Sort by shortest module path so that the shorter path is taken for duplicate modules
  // e.g. choose './posts' over './posts.jsx'
  sortBy(([modulePath]) => modulePath.length),
  uniqBy(([, mod]) => mod),
  // Exclude index modules, they should be included in a separate `includeRoute` call
  filter(([modulePath]) => !modulePath.endsWith('/index')),
  map(([modulePath, mod]) => createRoute(mod, getRoutePath(modulePath))),
);

/**
 * Create a memoized CPS function which resolves with the module resolved by the given module loader
 */
export function includeRoute(
  loadModule: CPSFunction0<RouteModule>
): NodeCPSFunction1<any, PlainRoute> {
  return memoize((partialNextState, cb) => {
    loadModule(mod => cb(null, createRoute(mod)));
  }, { arity: 0, async: 'immediate' });
}

export function includeRoutes(context: Context): NodeCPSFunction1<any, PlainRoute[]> {
  return memoize((partialNextState, cb0) => {
    const moduleLoaders: NodeCPSFunction0<ContextRouteModule>[] = context.keys().map(
      modulePath => (cb1) => context(modulePath)(mod => cb1(null, [modulePath, mod]))
    );
    parallel(moduleLoaders, (error, modules) => {
      if (error) {
        cb0(error);
        return;
      }
      cb0(null, createRoutesFromModules(modules));
    });
  }, { arity: 0, async: 'immediate' });
}
