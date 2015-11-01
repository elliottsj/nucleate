/* global __NUCLEATE_SRC_DIR__ */

import path from 'path'
import invariant from 'invariant'
import wrapHtmlComponent from './wrapHtmlComponent'

/**
 * Omit module paths which refer to the same module, keeping only
 * the extension-less paths
 * @param  {Array<String>} paths Module paths
 * @return {Array<String}        Paths with duplicates omitted
 */
function dedupe (paths) {
  const omitExtension = p => p.slice(0, p.length - path.extname(p).length)

  return paths.filter(p => {
    const withoutP = paths.filter(q => q !== p)
    return !withoutP.includes(omitExtension(p))
  })
}

function collectLayouts () {
  const req = require.context(__NUCLEATE_SRC_DIR__ + '/layouts', true)
  return dedupe(req.keys())
    .reduce((acc, p) => ({
      ...acc,
      [p]: req(p)
    }), {})
}

function collectPagesContent () {
  const req = require.context(__NUCLEATE_SRC_DIR__, true)
  return dedupe(req.keys())
    .filter(p => !p.startsWith('./layouts'))
    .reduce((acc, p) => ({
      ...acc,
      [p]: req(p)
    }), {})
}

function collectPagesFrontmatter () {
  const req = require.context('!!json!front-matter!' + __NUCLEATE_SRC_DIR__, true)
  return dedupe(req.keys())
    .filter(p => !p.startsWith('./layouts'))
    .reduce((acc, p) => ({
      ...acc,
      [p]: req(p).attributes
    }), {})
}

function zipPages ({ layouts, pagesContent, pagesFrontmatter }) {
  const contentPaths = Object.keys(pagesContent)
  const frontmatterPaths = Object.keys(pagesFrontmatter)
  invariant(contentPaths.length === frontmatterPaths.length, 'Amount of collected page content and frontmatter must be equivalent')

  return contentPaths
    .map(p => {
      const content = pagesContent[p]
      const frontmatter = pagesFrontmatter[p]

      if (typeof content !== 'string') {
        // Page is already a component
        return { [p]: content }
      }

      // Assume page is html; wrap in React component
      return {
        [p]: wrapHtmlComponent({ layouts, html: content, frontmatter })
      }
    })
    .reduce((acc, page) => ({
      ...acc,
      ...page
    }), {})
}

/**
 * Collect layouts and pages from the source directory.
 * @return {Object} The collection of pages, in the above shape
 */
export default function collectPages () {
  const layouts = collectLayouts()
  const pagesContent = collectPagesContent()
  const pagesFrontmatter = collectPagesFrontmatter()
  return {
    layouts,
    pages: zipPages({ layouts, pagesContent, pagesFrontmatter })
  }
}
