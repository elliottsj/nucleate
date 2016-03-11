import 'babel-polyfill';

import React from 'react';
import { render } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { browserHistory, match, Router, RouterContext } from 'react-router';

import { resolveComponentsQueries } from './query';
import QueryContext from './components/QueryContext';

const siteEntry = require(__SITE_ENTRY__);

function NoMatch() {
  return <div>404: No matching route</div>;
}

const noMatchRoute = {
  path: '*',
  component: NoMatch,
};
const routes = {
  ...siteEntry,
  path: '/',
  getChildRoutes: (location, callback) => {
    siteEntry.getChildRoutes(location, (err, childRoutes) => {
      callback(err, [...childRoutes, noMatchRoute]);
    });
  },
};

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

export function renderAll() {
  throw new Error('renderAll is not yet implemented');
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
          debugger
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
            reject(e);
          }
        });
      } else {
        reject(new Error('TODO: handle top-level 404'));
      }
    });
  });
}
