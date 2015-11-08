import React from 'react'
import ReactDOM from 'react-dom'
import ReactDOMServer from 'react-dom/server'
import { Provider } from 'react-redux'
import { ReduxRouter } from 'redux-router'
import { match } from 'redux-router/server'
// import { createLocation } from 'history'

import collectPages from './collectPages'
import createRoutes from './createRoutes'
import createStore from './createStore'

export default function createRenderer () {
  const { pages } = collectPages()
  const routes = createRoutes({ pages })

  // Client render
  if (typeof document !== 'undefined') {
    const store = createStore({ browser: true, routes })
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
        const store = createStore({ browser: false, routes })
        debugger
        store.dispatch(match(pth, (error, redirectLocation, renderProps) => {
          debugger
          if (error) {
            reject(error)
            return
          }
          const html = ReactDOMServer.renderToString(
            <Provider store={store}>
              <ReduxRouter {...renderProps} />
            </Provider>
          )
          resolve(html)
        }))
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
