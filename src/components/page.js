import React from 'react'
import hoistStatics from 'hoist-non-react-statics'
import getDisplayName from '../utils/getDisplayName'

export default function (frontmatter) {
  return Page => {
    function NucleatePage (props) {
      return <Page {...frontmatter} {...props} />
    }

    hoistStatics(NucleatePage, Page)
    hoistStatics(NucleatePage, frontmatter)

    NucleatePage.displayName = `NucleatePage(${getDisplayName(Page)})`
    return NucleatePage
  }
}
