import path from 'path'
import React from 'react'
import DefaultLayout from './components/DefaultLayout'

function getLayout ({ layouts, frontmatter }) {
  if (frontmatter.layout) {
    const layoutPath = Object.keys(layouts).find(
      pth => path.basename(pth) === frontmatter.layout
    )
    return layouts[layoutPath]
  } else {
    // TODO: get default layout from user config
    return DefaultLayout
  }
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
