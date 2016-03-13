import React from 'react';
import { Link } from 'nucleate';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="container sidebar-sticky">
        <div className="sidebar-about">
          <h1>
            <Link to="/">Blog Example</Link>
          </h1>
          <p className="lead">An example blog built with Nucleate</p>
        </div>

        <nav className="sidebar-nav">
          <Link className="sidebar-nav-item" activeClassName="active" to="/">Home</Link>
          <Link className="sidebar-nav-item" activeClassName="active" to="/about">About</Link>
        </nav>

        <p>
          Theme based on <a href="http://hyde.getpoole.com/">Hyde</a> by <a href="https://twitter.com/mdo">@mdo</a>
        </p>
      </div>
    </div>
  );
}
