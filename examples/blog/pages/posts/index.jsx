import React, { Component, PropTypes } from 'react';
import {
  createRoutesFromContext,
  getRoutes,
  Link,
} from 'nucleate';

export const getChildRoutes = (location, callback) => {
  require.ensure([], (require) => {
    const childRoutes = createRoutesFromContext(require.context('.'));
    callback(null, childRoutes);
  });
};

export class component extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  render() {
    const { children } = this.props;

    const posts = getRoutes(this.routes, {
      prefix: '/posts',
      index: false,
    });

    return (
      <div className="home">
        <ul className="post-list">
          {posts.map(post => (
            <li key={post.path}>
              <span className="post-meta">
                {post.date}
              </span>
              <Link className="post-link" to={post.path}>{post.title}</Link>
            </li>
          ))}
        </ul>
        {children}
      </div>
    );
  }
}
