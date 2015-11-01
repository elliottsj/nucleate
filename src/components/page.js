import React from 'react'

function getDisplayName (WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

export default function (frontmatter) {
  return Page => {
    function NucleatedPage (props) {
      return <Page {...frontmatter} {...props} />
    }
    NucleatedPage.displayName = `NucleatedPage(${getDisplayName(Page)})`
    NucleatedPage.title = frontmatter.title
    NucleatedPage.description = frontmatter.description
    NucleatedPage.permalink = frontmatter.permalink
    return NucleatedPage
  }
}
