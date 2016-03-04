import {
  Children,
  includeRoute,
  includeRoutes,
} from 'nucleate';

export const getIndexRoute = includeRoute(require('route!./posts/'));
export const getChildRoutes = includeRoutes(require.context('route!./posts/', false));
export const component = Children;
