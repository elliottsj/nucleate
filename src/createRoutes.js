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
        path={component.permalink}
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
