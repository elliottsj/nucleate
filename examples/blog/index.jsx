import React, { Component, PropTypes } from 'react';
import {
  Assets,
  includeRoute,
  includeRoutes,
} from 'nucleate';

export const getIndexRoute = includeRoute(require('route!./pages/'));
export const getChildRoutes = includeRoutes(require.context('route!./pages/', false));

export const component = class Index extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  render() {
    const { children } = this.props;

    return (
      <html>
        <head>
          <title>Blog</title>
          {
            Assets() // eslint-disable-line new-cap
          }
        </head>
        <body>
          {children}
        </body>
      </html>
    );
  }
};
