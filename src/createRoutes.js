/* @flow */

import { find } from 'wu'
import path from 'path'
import React, { Component } from 'react'
import { Route } from 'react-router'

import BaseLayout from './components/BaseLayout'

function getBaseLayout (layouts) {
  const layout = find(([pth]) => path.basename(pth) === 'Base', layouts)
  if (layout) {
    return layout[1]
  } else {
    BaseLayout
  }
}

function defaultPath (pth: string): string {
  const lowerPth = pth.toLowerCase()
  return path.basename(lowerPth) === 'index'
    ? path.dirname(lowerPth.slice(1))
    : lowerPth.slice(1)
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
      {[...pages].map(([pth, component]) =>
        <Route
          key={pth}
          path={component.permalink || defaultPath(pth)}
          component={component}
        />
      )}
    </Route>
  )
}
