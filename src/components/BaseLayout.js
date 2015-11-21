import React, { Component, PropTypes } from 'react'

export default class BaseLayout extends Component {
  static propTypes = {
    children: PropTypes.node,
    title: PropTypes.string
  }

  render () {
    const { children, title } = this.props
    return (
      <html>
        <head>
          <title>{title || 'Default Title'}</title>
          <script async src='/bundle.js'></script>
        </head>
        <body>
          {children}
        </body>
      </html>
    )
  }
}
