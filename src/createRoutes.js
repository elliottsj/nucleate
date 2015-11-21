/* @flow */

import { find } from 'wu'
import path from 'path'
import React, { Component } from 'react'
import { IndexRoute, Route } from 'react-router'

import BaseLayout from './components/BaseLayout'

function getBaseLayout (layouts) {
  const layout = find(([pth]) => path.basename(pth) === 'Base', layouts)
  if (layout) {
    return layout[1]
  } else {
    BaseLayout
  }
}

/**
 * Get the default router path for the given JS module path.
 * Module paths ending in '/index' are stripped to just the base directory.
 *
 * Examples:
 * defaultPath('./somedir/hello') === '/somedir/hello'
 * defaultPath('./anotherdir/index') === '/anotherdir'
 *
 * @param  {String} pth  The path to a JS module, relative to the nucleate src dir
 * @return {String}      The absolute router path
 */
function defaultPath (pth: string): string {
  const lowerPth = pth.toLowerCase()
  return path.basename(lowerPth) === 'index'
    ? path.dirname(lowerPth.slice(1))
    : lowerPth.slice(1)
}

function createRoute ([pth, component]) {
  return pth === './index'
    ? (
      <IndexRoute
        key={pth}
        component={component}
      />
    )
    : (
      <Route
        key={pth}
        path={component.permalink || defaultPath(pth)}
        component={component}
      />
    )
}

export default function createRoutes ({
  layouts,
  pages
}: {
  layouts: Map<string, Component>,
  pages: Map<string, Component>
}): Array<Route> {
  const Layout = getBaseLayout(layouts)
  return (
    <Route path='/' component={Layout}>
      {[...pages].map(createRoute)}
    </Route>
  )
}
