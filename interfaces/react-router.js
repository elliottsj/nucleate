declare type ReactRouter$AsyncRouteGetter<T> =
  (location: any, cb: (error: ?Error, result: ?T) => void) => void;

declare type ReactRouter$AsyncIndexRoute = ReactRouter$AsyncRouteGetter<ReactRouter$PlainRoute>;
declare type ReactRouter$AsyncChildRoutes = ReactRouter$AsyncRouteGetter<ReactRouter$PlainRoute[]>;

declare interface ReactRouter$PlainRoute {
  path?: string;
  component?: ReactClass<{}>;
  getComponent?: (location: any, cb: (error: ?Error, component?: ReactClass<{}>) => void) => void;
  indexRoute?: ReactRouter$PlainRoute;
  getIndexRoute?: ReactRouter$AsyncIndexRoute;
  childRoutes?: ReactRouter$PlainRoute[];
  getChildRoutes?: ReactRouter$AsyncChildRoutes;
}

declare module 'react-router' {
  declare type PlainRoute = ReactRouter$PlainRoute;
  declare var Link;
}
