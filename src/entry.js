import React from 'react';
import { render } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { browserHistory, match, Route, Router, RouterContext } from 'react-router';

const siteEntry = require(__NUCLEATE_ROOT__)

function NoMatch() {
  return <div>404: No matching route</div>;
}

const noMatchRoute = {
  path: '*',
  component: NoMatch,
};
const rootRoute = {
  ...siteEntry,
  path: '/',
  getChildRoutes: (location, callback) => {
    siteEntry.getChildRoutes(location, (err, childRoutes) => {
      callback(err, [...childRoutes, noMatchRoute]);
    });
  },
};

// In browser, render immediately
if (typeof document !== 'undefined') {
  const { pathname, search, hash } = window.location;
  const location = `${pathname}${search}${hash}`;

  // calling `match` is simply for side effects of
  // loading route/component code for the initial location
  // courtesy of https://github.com/rackt/example-react-router-server-rendering-lazy-routes
  match({ routes: rootRoute, location }, () => {
    render(
      <Router history={browserHistory}>{rootRoute}</Router>,
      document
    );
  });
}

export function renderAll() {
  throw new Error('renderAll is not yet implemented')
}

export function renderPath(path) {
  return new Promise((resolve, reject) => {
    console.log(`matching ${path}`)
    match({ routes: rootRoute, location: path }, (error, redirectLocation, renderProps) => {
      console.log(`matched ${path}`)
      if (error) {
        reject(error)
      } else if (redirectLocation) {
        reject(new Error(
          `TODO: re-match using redirect path (${redirectLocation.pathname})` +
          ` and render destination page`
        ))
      } else if (renderProps) {
        try {
          resolve(`<!DOCTYPE html>${renderToString(<RouterContext {...renderProps} />)}`)
        } catch (e) {
          // TODO: render a basic page for browser debugging?
          reject(e)
        }
      } else {
        reject(new Error('TODO: handle top-level 404'))
      }
    })
  })
}
