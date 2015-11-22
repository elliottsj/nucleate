import { find } from 'wu'
import path from 'path'
import React from 'react'
import DefaultLayout from './components/DefaultLayout'

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
