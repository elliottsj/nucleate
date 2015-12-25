import { find } from 'wu'
import path from 'path'
import React from 'react'

function getLayout ({ layouts, frontmatter }) {
  if (frontmatter.layout) {
    const layout = find(
      ([pth, _]) => path.basename(pth) === frontmatter.layout,
      layouts
    )
    if (!layout) {
      throw new Error(`No layout found with name: ${frontmatter.layout}`)
    }
    return layouts.get(/* path: */ layout[0])
  } else {
    // No layout configured; just render the children
    return ({ children }) => children
  }
}

export default function wrapHtmlComponent ({ layouts, html, frontmatter }) {
  const Layout = getLayout({ layouts, frontmatter })
  return function HtmlFragment () {
    return (
      <Layout {...frontmatter}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </Layout>
    )
  }
}
