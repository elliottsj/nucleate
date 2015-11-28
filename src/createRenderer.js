import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import ReactDOMServer from 'react-dom/server'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { ReduxRouter } from 'redux-router'
import { match } from 'redux-router/server'
import { createLocation } from 'history'

import zipObj from './utils/zipObj'
import applyNucleate from './applyNucleate'
import collectPages from './collectPages'
import createRoutes from './createRoutes'

export default function createRenderer ({ renderSite = site => site } = {}) {
  const {
    layouts,
    pages
  }: {
    layouts: Map<string, Component>,
    pages: Map<string, Component>
  } = collectPages()

  const { paths, routes } = createRoutes({ layouts, pages })

  // Client render
  if (typeof document !== 'undefined') {
    const store = applyNucleate({ browser: true, layouts, pages, routes })(createStore)()
    ReactDOM.render(
      renderSite(
        <Provider store={store}>
          <ReduxRouter>
            {routes}
          </ReduxRouter>
        </Provider>
      ),
      document
    )
  }

  // Static render
  return function render (locals) {
    function renderPath (pth) {
      return new Promise((resolve, reject) => {
        const store = applyNucleate({ browser: false, layouts, pages, routes })(createStore)()
        const rematch = loc => match(loc, (error, redirectLocation, routerState) => {
          if (error) {
            reject(error)
            return
          }
          if (redirectLocation) {
            store.dispatch(rematch(redirectLocation))
            return
          }
          const html = ReactDOMServer.renderToString(
            renderSite(
              <Provider store={store}>
                <ReduxRouter {...routerState} />
              </Provider>
            )
          )
          resolve('<!DOCTYPE html>' + html)
        })
        store.dispatch(rematch(createLocation(pth)))
      })
    }

    return Promise.all(paths.map(renderPath)).then(renderedPages =>
      zipObj(paths, renderedPages)
    )
  }
}
