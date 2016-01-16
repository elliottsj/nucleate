import React from 'react'
import { render } from 'react-dom'
import { renderToString } from 'react-dom/server'
import { browserHistory, match, Route, Router, RouterContext } from 'react-router'

const siteRoot = require(__NUCLEATE_ROOT__)

function NoMatch () {
  return <div>404: No matching route</div>
}

const routes = (
  <Route path='/' component={siteRoot.component}>
    <Route path='*' component={NoMatch} />
  </Route>
)

export function renderAll () {
  throw new Error('renderAll is not yet implemented')
}

export function renderPath (path) {
  return new Promise((resolve, reject) => {
    console.log(`matching ${path}`)
    match({ routes, location: path }, (error, redirectLocation, renderProps) => {
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

// In browser, render immediately
if (typeof document !== 'undefined') {
  render(<Router history={browserHistory}>{routes}</Router>, document)
}
