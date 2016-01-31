import React, { Component, PropTypes } from 'react';

export default class Post extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  render() {
    const { children } = this.props;
    return (
      <div className="post">{children}</div>
    );
  }
}
