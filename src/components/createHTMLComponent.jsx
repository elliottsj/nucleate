import React from 'react';
import renderHTML from '@elliottsj/react-render-html';
import { Link } from 'react-router';

import Children from './Children';

function replaceLinks() {
  return (next) => (node, key) => {
    const element = next(node, key);
    if (node.tagName === 'a' && /^~/.test(element.props.href)) {
      return <Link {...element.props} to={element.props.href.replace(/^~/, '')} />;
    }
    return element;
  };
}

export default function createHTMLComponent(Layout = Children, meta, html) {
  return function HTMLFragment() {
    return (
      <Layout {...meta}>
        {/* need wrapper div in case `Layout === Children` and renderHTML returns an array */}
        <div>
          {renderHTML(html, replaceLinks)}
        </div>
      </Layout>
    );
  };
}
