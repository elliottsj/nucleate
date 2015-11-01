import path from 'path'
import React from 'react'

function getLayout ({ layouts, frontmatter }) {
  const layoutName = frontmatter.layout || 'Default'
  const layoutPath = Object.keys(layouts).find(p => path.basename(p) === layoutName)
  return layouts[layoutPath]
}

export default function wrapHtmlComponent ({ layouts, html, frontmatter }) {
  const Layout = getLayout({ layouts, frontmatter })
  return function HtmlFragment () {
    return (
      <Layout>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </Layout>
    )
  }
}
