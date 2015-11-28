/* @flow */

import { find, unique } from 'wu'
import path from 'path'
import React, { Component } from 'react'
import { IndexRoute, Route, Redirect } from 'react-router'

import BaseLayout from './components/BaseLayout'
import uniqBy from './utils/uniqBy'

function getBaseLayout (layouts) {
  const layout = find(([pth]) => path.basename(pth) === 'Base', layouts)
  if (layout) {
    return layout[1]
  } else {
    BaseLayout
  }
}

function createRoute (component) {
  if (component.redirectPath) {
    return <Redirect key={component.path} from={component.path} to={component.redirectPath} />
  }
  if (component.path === '/') {
    return <IndexRoute key={component.path} component={component} />
  }
  return <Route key={component.path} path={component.path} component={component} />
}

export default function createRoutes ({
  layouts,
  pages
}: {
  layouts: Map<string, Component>,
  pages: Map<string, Component>
}): {
  paths: Array<string>,
  routes: Array<Route>
} {
  const Layout = getBaseLayout(layouts)
  const uniqPages = [...uniqBy(([_, component]) => component.path, pages)]

  const routes = (
    <Route path='/' component={Layout}>
      {uniqPages.map(([_, component]) => createRoute(component))}
    </Route>
  )

  return {
    paths: uniqPages.map(([_, component]) => component.path),
    routes
  }
}
