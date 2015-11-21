import React from 'react'
import hoistStatics from 'hoist-non-react-statics'
import getDisplayName from '../util/getDisplayName'

export default function (frontmatter) {
  return Page => {
    function NucleatePage (props) {
      return <Page {...frontmatter} {...props} />
    }

    hoistStatics(NucleatePage, Page)

    NucleatePage.displayName = `NucleatePage(${getDisplayName(Page)})`
    NucleatePage.title = frontmatter.title
    NucleatePage.description = frontmatter.description
    NucleatePage.permalink = frontmatter.permalink
    return NucleatePage
  }
}
