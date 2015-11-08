import React from 'react'
import { Route, IndexRoute } from 'react-router'
import invariant from 'invariant'

export default function createRoutes ({ pages }) {
  const Index = pages['./index']
  invariant(!!Index, 'index.js must be defined in your source directory')

  // return (
  //   <Route path='/'>
  //     <IndexRoute component={Index} />
  //     {Object.keys(pages).filter(pth => pth !== './index').map(pth => {
  //       const component = pages[pth]
  //       return (
  //         <Route
  //           key={pth}
  //           path={/*component.path*/ pth.slice(1)}
  //           component={component}
  //         />
  //       )
  //     })}
  //   </Route>
  // )
  return [
    <Route key={'./index'} path='/' component={Index} />,
    ...Object.keys(pages).filter(pth => pth !== './index').map(pth => {
      const component = pages[pth]
      return (
        <Route
          key={pth}
          path={component.permalink}
          component={component}
        />
      )
    })
  ]
}
