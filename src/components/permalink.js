import React from 'react'
import hoistStatics from 'hoist-non-react-statics'
import getDisplayName from '../util/getDisplayName'
import defaultPath from '../util/defaultPath'

export default function (pth) {
  return NucleatePage => {
    function PermalinkedPage (props) {
      return <NucleatePage {...props} />
    }

    hoistStatics(PermalinkedPage, NucleatePage)

    PermalinkedPage.displayName = `PermalinkedPage(${getDisplayName(NucleatePage)})`
    PermalinkedPage.permalink = PermalinkedPage.permalink || defaultPath(pth)
    return PermalinkedPage
  }
}
