import React, { Component, PropTypes } from 'react'
import { Assets, includePages } from 'nucleate'
/* Link, pages */

export const route = includePages({
  getChildRoutes (location, callback) {
    require.ensure([], (require) => {
      callback(null, require.context('./pages'))
    })
  }
})

export class component extends Component {
  static propTypes = {
    children: PropTypes.node
  };

  render () {
    // const posts = pages(require.context('./pages'))
    const { children } = this.props

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
            {children}
            <p className='rss-subscribe'>subscribe <a href='/feed.xml'>via RSS</a></p>
          </div>
        </body>
      </html>
    )
  }
}
