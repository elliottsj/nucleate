import React, { Component } from 'react'
import { Assets } from 'nucleate'
// import { includePages, pages, Link } from 'nucleate'

// export const route = includePages(require.context('./pages'))

export class component extends Component {
  render () {
    // const posts = pages(require.context('./pages'))
    return (
      <html>
        <head>
          <title>Blog</title>
          {Assets()}
        </head>
        <body>
          <div className='home'>
            <ul className='post-list'>
              <li key={'/post1'}>
                <span className='post-meta'>
                  2016-01-20
                </span>
                {/* <Link className='post-link' to='/post1'>Post 1 Title</Link> */}
              </li>
            </ul>

            <p className='rss-subscribe'>subscribe <a href='/feed.xml'>via RSS</a></p>
          </div>
        </body>
      </html>
    )
  }
}
