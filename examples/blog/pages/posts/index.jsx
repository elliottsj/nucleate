import React, { Component, PropTypes } from 'react';
import {
  query,
  queryChildRoutes,
  Link,
} from 'nucleate';

class PostsIndex extends Component {
  static propTypes = {
    posts: PropTypes.array.isRequired,
    routes: PropTypes.array.isRequired,
  };

  render() {
    const { posts } = this.props;

    return (
      <div className="posts">
        {posts.map(post => (
          <div key={post.path} className="post">
            <h1 className="post-title">
              <Link to={post.fullpath}>{post.meta.title}</Link>
            </h1>
            <span className="post-date">{post.meta.date}</span>
          </div>
        ))}
      </div>
    );
  }
}

export const component = query({
  posts: queryChildRoutes('/posts'),
})(PostsIndex);
