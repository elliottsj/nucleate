import pipe from 'lodash/fp/pipe';
import filter from 'lodash/fp/filter';
import sortBy from 'lodash/fp/sortBy';
import React, { Component, PropTypes } from 'react';
import {
  Link,
  query,
  withQuery,
} from 'nucleate';

const filterPosts = pipe(
  filter(post => post.fullPath !== '/posts'),
  sortBy(post => new Date(post.meta.date)),
);

class PostsIndex extends Component {
  static propTypes = {
    posts: PropTypes.array.isRequired,
    routes: PropTypes.array.isRequired,
  };

  render() {
    const { posts } = this.props;

    return (
      <div className="posts">
        {filterPosts(posts).map(post => (
          <div key={post.path} className="post">
            <h1 className="post-title">
              <Link to={post.fullPath}>{post.meta.title}</Link>
            </h1>
            <span className="post-date">{post.meta.date}</span>
          </div>
        ))}
      </div>
    );
  }
}

export const component = withQuery({
  posts: query('/posts'),
})(PostsIndex);
