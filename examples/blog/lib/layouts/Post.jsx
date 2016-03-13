import React, { Component, PropTypes } from 'react';

export default function Post({ children, date, title }) {
  return (
    <div className="post">
      <h1 className="post-title">{title}</h1>
      <span className="post-date">{date}</span>
      {children}
    </div>
  );
}

Post.propTypes = {
  children: PropTypes.node,
  date: PropTypes.string,
  title: PropTypes.string.isRequired,
};
