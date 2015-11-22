import React from 'react'
import hoistStatics from 'hoist-non-react-statics'
import getDisplayName from '../utils/getDisplayName'
import defaultPath from '../utils/defaultPath'

export default function pathify (pth) {
  return NucleatePage => {
    function PathifiedPage (props) {
      return <NucleatePage {...props} />
    }

    hoistStatics(PathifiedPage, NucleatePage)

    PathifiedPage.displayName = `PathifiedPage(${getDisplayName(NucleatePage)})`
    PathifiedPage.path = PathifiedPage.permalink || defaultPath(pth)
    return PathifiedPage
  }
}
