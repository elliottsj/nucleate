/* @flow */

import path from 'path'
import React, { Component } from 'react'
import { Route } from 'react-router'

function defaultPath (pth: string): string {
  const lowerPth = pth.toLowerCase()
  return path.basename(lowerPth) === 'index'
    ? path.dirname(lowerPth.slice(1))
    : lowerPth.slice(1)
}

export default function createRoutes (pages: Map<string, Component>): Array<Route> {
  return [...pages].map(([pth, component]) =>
    <Route
      key={pth}
      path={component.permalink || defaultPath(pth)}
      component={component}
    />
  )
}
