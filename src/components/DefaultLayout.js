import React, { Component, PropTypes } from 'react'

// @connect(state => ({
//   bundlePath: state.nucleate.bundlePath
// }))
export default class DefaultLayout extends Component {
  static propTypes = {
    children: PropTypes.node,
    title: PropTypes.string.isRequired
  }

  render () {
    const { children, title } = this.props
    return (
      <html>
        <head>
          <title>{title}</title>
          <script async src='/bundle.js'></script>
        </head>
        <body>
          {children}
        </body>
      </html>
    )
  }
}
