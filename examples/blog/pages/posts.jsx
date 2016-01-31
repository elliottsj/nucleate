import {
  Children,
  createRoute,
  createRoutesFromContext,
} from 'nucleate';

export const getIndexRoute = (location, callback) => {
  require.ensure([], (require) => {
    const indexRoute = createRoute(require('./posts/index.jsx'));
    callback(null, indexRoute);
  });
};

export const getChildRoutes = (location, callback) => {
  require.ensure([], (require) => {
    const childRoutes = createRoutesFromContext(require.context('./posts', false));
    callback(null, childRoutes);
  });
};

export const component = Children;
