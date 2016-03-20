import 'babel-polyfill';

import pify from 'pify';
import React, { Component, PropTypes } from 'react';
import { render } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { browserHistory, match, Router, RouterContext } from 'react-router';
import urljoin from 'url-join';

import { createRoute } from '.';
import { resolveComponentsQueries } from './query';
import QueryContext from './components/QueryContext';

const siteEntry = require(__SITE_ENTRY__);

function NoMatch() {
  return <div>404: No matching route</div>;
}

class ServerError extends Component {
  static propTypes = {
    location: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
  };

  static contextTypes = {
    router: PropTypes.object,
  };

  componentDidMount() {
    const { router } = this.context;
    const { location } = this.props;
    if (location.query.destination) {
      router.push(location.query.destination);
    }
  }

  render() {
    const { location } = this.props;

    return (
      <div>
        <h3>Nucleate server error</h3>
        {location.query.destination ? (
          <p>Redirected to <em>{location.query.destination}</em>; check the console for errors</p>
        ) : (
          <p>No destination specified</p>
        )}
      </div>
    );
  }
}

const serverErrorRoute = {
  path: 'server_error',
  component: ServerError,
};

const noMatchRoute = {
  path: '*',
  component: NoMatch,
};
const routes = createRoute(siteEntry, '/', [serverErrorRoute, noMatchRoute]);

function renderToDocument(location) {
  // calling `match` is simply for side effects of
  // loading route/component code for the initial location
  // courtesy of https://github.com/ryanflorence/example-react-router-server-rendering-lazy-routes
  match({ routes, location }, (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      renderToDocument(redirectLocation);
    } else {
      resolveComponentsQueries(routes, renderProps.components).then((resolvedQueries) => {
        render(
          <QueryContext resolvedQueries={resolvedQueries}>
            <Router history={browserHistory}>{routes}</Router>
          </QueryContext>,
          document
        );
      });
    }
  });
}

// In browser, render immediately
if (typeof document !== 'undefined') {
  const { pathname, search, hash } = window.location;
  const location = `${pathname}${search}${hash}`;

  renderToDocument(location);
}

async function collectRoutePaths(prefix, route): Promise<Array<string>> {
  const routePath = urljoin(prefix, route.path);
  if (/\*|:|\(|\)/.test(routePath)) {
    return [];
  }
  if (!route.getChildRoutes) {
    return [routePath];
  }
  const childRoutes = await pify(route.getChildRoutes)(/* location: */ routePath);
  return await childRoutes.reduce(
    async (paths, childRoute) =>
      [...(await paths), ...(await collectRoutePaths(routePath, childRoute))],
    [routePath]
  );
}

export function renderPath(location) {
  return new Promise((resolve, reject) => {
    console.log(`matching ${location}`);
    match({ routes, location }, (error, redirectLocation, renderProps) => {
      console.log(`matched ${location}`);
      if (error) {
        reject(error);
      } else if (redirectLocation) {
        // Re-match using redirect path and render destination page
        renderPath(redirectLocation).then(resolve, reject);
      } else if (renderProps) {
        resolveComponentsQueries(routes, renderProps.components).then((resolvedQueries) => {
          try {
            resolve(
              `<!DOCTYPE html>${
                renderToString(
                  <QueryContext resolvedQueries={resolvedQueries}>
                    <RouterContext {...renderProps} />
                  </QueryContext>
                )
              }`
            );
          } catch (e) {
            // TODO: render a basic page for browser debugging?
            // 1. Render a bare html page at '/server_error?destination=<path>'
            //    with links to assets and an empty <body>
            // 2. After initial render, immediately navigate to `destination`
            // 3. User can then debug their error

            renderPath(`/server_error?destination=${location.pathname || location}`)
              .then(resolve, reject);

            // reject(e);
          }
        });
      } else {
        reject(new Error('TODO: handle top-level 404'));
      }
    });
  });
}

export async function renderAll() {
  const routePaths = await collectRoutePaths('/', routes);
  return new Map(await Promise.all(routePaths.map(async (routePath) =>
    [routePath, await renderPath(routePath)]
  )));
}
