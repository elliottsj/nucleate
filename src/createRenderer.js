import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import ReactDOMServer from 'react-dom/server'
import { Provider } from 'react-redux'
import { match, Router, RoutingContext } from 'react-router'
import { createHistory, createMemoryHistory, createLocation } from 'history'

import collectPages from './collectPages'
import createRoutes from './createRoutes'
import createStore from './createStore'

export default function createRenderer () {
  const {
    layouts,
    pages
  }: {
    layouts: Map<string, Component>,
    pages: Map<string, Component>
  } = collectPages()

  const routes = createRoutes(pages)

  // Client render
  if (typeof document !== 'undefined') {
    const history = createHistory()
    const store = createStore({ history, layouts, pages })
    ReactDOM.render(
      <Provider store={store}>
        <Router history={history}>
          {routes}
        </Router>
      </Provider>,
      document
    )
  }

  // Static render
  return function render (locals) {
    function renderPath (pth) {
      return new Promise((resolve, reject) => {
        match({ routes, location: createLocation(pth) }, (error, redirectLocation, renderProps) => {
          if (error) {
            reject(error)
            return
          }
          const history = createMemoryHistory()
          const store = createStore({ history, layouts, pages })
          const html = ReactDOMServer.renderToString(
            <Provider store={store}>
              <RoutingContext {...renderProps} />
            </Provider>
          )
          resolve(html)
        })
      })
    }

    return Promise.all(routes.map(
      route => {
        return renderPath(route.props.path)
      }
    )).then(renderedPages => {
      return renderedPages.reduce(
        (acc, html, i) => ({
          ...acc,
          [routes[i].props.path]: html
        }), {}
      )
    })
  }
}
