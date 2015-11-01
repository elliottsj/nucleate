import React from 'react'
import { Route } from 'react-router'
import invariant from 'invariant'

export default function createRoutes ({ pages }) {
  const Index = pages['./index']
  invariant(!!Index, 'index.js must be defined in your source directory')

  return [
    <Route key={'./index'} path='/' component={Index} />,
    ...Object.keys(pages).filter(pth => pth !== './index').map(pth => {
      const component = pages[pth]
      return (
        <Route
          key={pth}
          path={/*component.path*/ pth.slice(1)}
          component={component}
        />
      )
    })
  ]
}
