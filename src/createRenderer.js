import React from 'react'
import ReactDOM from 'react-dom'
import ReactDOMServer from 'react-dom/server'
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react'
import { Provider } from 'react-redux'
import { match } from 'react-router'
import { ReduxRouter } from 'redux-router'
import { createLocation } from 'history'

import collectPages from './collectPages'
import createRoutes from './createRoutes'
import createStore from './createStore'

export default function createRenderer () {
  const { pages } = collectPages()
  const routes = createRoutes({ pages })

  // Client render
  if (typeof document !== 'undefined') {
    const store = createStore({ browser: true })
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
        const store = createStore({ browser: false })
        match({ routes, location: createLocation(pth) }, (error, redirectLocation, renderProps) => {
          if (error) {
            reject(error)
            return
          }
          const html = ReactDOMServer.renderToString(
            <Provider store={store}>
              <ReduxRouter>
                {routes}
              </ReduxRouter>
            </Provider>
          )
          // <RoutingContext {...renderProps} />
          resolve(html)
        })
      })
    }

    const promises = routes.map(
      route => renderPath(route.props.path)
    )
    return Promise.all(promises).then(renderedPages => {
      return renderedPages.reduce(
        (acc, html, i) => ({
          ...acc,
          [routes[i].props.path]: html
        }), {}
      )
    })
  }
}
