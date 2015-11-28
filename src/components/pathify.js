import React from 'react'
import hoistStatics from 'hoist-non-react-statics'
import getDisplayName from '../utils/getDisplayName'
import defaultPath from '../utils/defaultPath'

export default function pathify (pth) {
  return Page => {
    function PathifiedPage (props) {
      return <Page {...props} />
    }

    hoistStatics(PathifiedPage, Page)

    PathifiedPage.displayName = `PathifiedPage(${getDisplayName(Page)})`
    PathifiedPage.path = PathifiedPage.permalink || defaultPath(pth)
    return PathifiedPage
  }
}
