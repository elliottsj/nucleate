import React, { PropTypes } from 'react';

export default function Page({ children, title }) {
  return (
    <div className="page">
      <h1>{title}</h1>
      {children}
    </div>
  );
}

Page.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string.isRequired,
};
