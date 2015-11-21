import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import ReactDOMServer from 'react-dom/server'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { ReduxRouter } from 'redux-router'
import { match } from 'redux-router/server'

import applyNucleate from './applyNucleate'
import collectPages from './collectPages'
import createRoutes from './createRoutes'

export default function createRenderer () {
  const {
    layouts,
    pages
  }: {
    layouts: Map<string, Component>,
    pages: Map<string, Component>
  } = collectPages()

  const routes = createRoutes({ layouts, pages })

  // Client render
  if (typeof document !== 'undefined') {
    const store = applyNucleate({ browser: true, layouts, pages, routes })(createStore)()
    ReactDOM.render(
      <Provider store={store}>
        <ReduxRouter>
          {routes}
        </ReduxRouter>
      </Provider>,
      document
    )
  }

  // Static render
  return function render (locals) {
    function renderPath (pth) {
      return new Promise((resolve, reject) => {
        const store = applyNucleate({ browser: false, layouts, pages, routes })(createStore)()
        store.dispatch(match(pth, (error, redirectLocation, routerState) => {
          if (error) {
            reject(error)
            return
          }
          const html = ReactDOMServer.renderToString(
            <Provider store={store}>
              <ReduxRouter {...routerState} />
            </Provider>
          )
          resolve(html)
        }))
      })
    }

    return Promise.all(routes.props.children.map(
      route => {
        return renderPath(route.props.path)
      }
    )).then(renderedPages => {
      return renderedPages.reduce(
        (acc, html, i) => ({
          ...acc,
          [routes.props.children[i].props.path]: html
        }), {}
      )
    })
  }
}
