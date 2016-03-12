import 'lib/css/poole.css';
import 'lib/css/hyde.css';

import React, { Component, PropTypes } from 'react';
import {
  assets,
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
          {assets()}
        </head>
        <body>
          {children}
        </body>
      </html>
    );
  }
};
