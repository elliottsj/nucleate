import path from 'path';
import pify from 'pify';

import awaitValues from './utils/awaitValues';
import match from './utils/match';
import mapValues from './utils/mapValues';

async function getIndexRoute(route) {
  if (route.indexRoute) {
    return route.indexRoute;
  } else if (route.getIndexRoute) {
    return new Promise((resolve, reject) => route.getIndexRoute(null, (error, indexRoute) => {
      if (error) {
        reject(error);
      } else {
        resolve(indexRoute);
      }
    }));
  }
  return null;
}

async function isIndexRoute(routes) {
  const indexRoute = await getIndexRoute(routes[routes.length - 2]);
  const lastRoute = routes[routes.length - 1];
  return indexRoute === lastRoute;
}

async function getChildRoutes(route) {
  if (route.childRoutes) {
    return route.childRoutes;
  }
  return pify(route.getChildRoutes)(/* location: */ null);
}

export function queryRoute(location) {
  return async (routes) => {
    const [redirectLocation, renderProps] = await match({ routes, location });
    if (redirectLocation) {
      throw new Error(`Unexpected redirect: ${redirectLocation}`);
    }
    const matchedRoutes = renderProps.routes;
    const route =
      await isIndexRoute(matchedRoutes)
        ? matchedRoutes[matchedRoutes.length - 2]
        : matchedRoutes[matchedRoutes.length - 1];
    return route;
  };
}

export function queryChildRoutes(location) {
  return async (routes) => {
    const childRoutes = await getChildRoutes(await queryRoute(location)(routes));
    return childRoutes.map(route => ({
      ...route,
      route,
      fullpath: path.resolve(location.pathname || location, route.path),
    }));
  };
}

async function resolveQueries(routes, component) {
  if (!component.nucleateQuery) {
    return null;
  }
  return awaitValues(mapValues(query => query(routes), component.nucleateQuery));
}

export async function resolveComponentsQueries(routes, components) {
  return new Map(await Promise.all(components.map(
    async component => [component, await resolveQueries(routes, component)]
  )));
}
