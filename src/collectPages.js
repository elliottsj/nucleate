/* @flow */

declare var __NUCLEATE_SRC_DIR__: string;

import path from 'path'
import { compose } from 'redux'
import { Component } from 'react'
import { map, zip } from 'wu'
import wrapHtmlComponent from './wrapHtmlComponent'
import page from './components/page'
import pathify from './components/pathify'

/**
 * Omit module paths which refer to the same module, keeping only
 * the extension-less paths
 * @param  {Array<String>} paths Module paths
 * @return {Array<String}        Paths with duplicates omitted
 */
function dedupe (paths: Array<string>): Array<string> {
  const omitExtension = p => p.slice(0, p.length - path.extname(p).length)

  return paths.filter(p => {
    const withoutP = paths.filter(q => q !== p)
    return !withoutP.includes(omitExtension(p))
  })
}

function collectLayouts (): Map<string, Component> {
  const req = require.context(__NUCLEATE_SRC_DIR__ + '/layouts', true)
  const paths: Array<string> = dedupe(req.keys())
  return paths.reduce(
    (layouts, pth) => layouts.set(pth, req(pth).default || req(pth)),
    new Map()
  )
}

function collectPagesContent (): Map<string, Component | string> {
  const req = require.context(__NUCLEATE_SRC_DIR__ + '/pages', true)
  const paths = dedupe(req.keys())
  return paths.reduce(
    (pages, pth) => pages.set(pth, req(pth).default || req(pth)),
    new Map()
  )
}

function collectPagesFrontmatter (): Map<string, Object> {
  const req = require.context('!!json!front-matter!' + __NUCLEATE_SRC_DIR__ + '/pages', true)
  const paths = dedupe(req.keys())
  return paths.reduce(
    (frontmatters, pth) => frontmatters.set(pth, req(pth).attributes),
    new Map()
  )
}

function makePage (pth, content, frontmatter, layouts) {
  let component
  if (typeof content !== 'string') {
    // Page is already a component
    component = compose(
      pathify(pth)
    )(content)
  } else {
    // Assume page is html; wrap in React component
    component = compose(
      pathify(pth),
      page(frontmatter),
      wrapHtmlComponent
    )({ layouts, html: content, frontmatter })
  }
  return component
}

function zipPages ({ layouts, pagesContent, pagesFrontmatter }) {
  const zipped = zip(pagesContent, pagesFrontmatter)
  const pages = map(
    ([[pth, content], [_, frontmatter]]) => [pth, makePage(pth, content, frontmatter, layouts)],
    zipped
  )
  return new Map(pages)
}

/**
 * Collect layouts and pages from the source directory.
 * @return {Object} The collection of pages, in the above shape
 */
export default function collectPages (): Map<string, Component> {
  const layouts = collectLayouts()
  const pagesContent = collectPagesContent()
  const pagesFrontmatter = collectPagesFrontmatter()
  return {
    layouts,
    pages: zipPages({ layouts, pagesContent, pagesFrontmatter })
  }
}
