import React, { Component, PropTypes } from 'react';
import {
  query,
  queryChildRoutes,
  Link,
} from 'nucleate';

class PostsIndex extends Component {
  static propTypes = {
    children: PropTypes.node,
    posts: PropTypes.array.isRequired,
    routes: PropTypes.array.isRequired,
  };

  render() {
    const { children, posts } = this.props;

    return (
      <div className="home">
        <ul className="post-list">
          {posts.map(post => (
            <li key={post.path}>
              <span className="post-meta">
                {post.meta.date}
              </span>
              <Link className="post-link" to={post.fullpath}>{post.meta.title}</Link>
            </li>
          ))}
        </ul>
        {children}
      </div>
    );
  }
}

export const component = query({
  posts: queryChildRoutes('/posts'),
})(PostsIndex);
