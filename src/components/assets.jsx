/* global __webpack_chunks__ */

import React from 'react';

export default function assets() {
  return [
    <link key="bundleCSS" rel="stylesheet" href="/assets/main.bundle.css" />,
    <script key="commonsJS" defer src="/assets/commons.bundle.js"></script>,
    ...__webpack_chunks__.map(chunk => (
      <script key={`chunk${chunk.id}`} defer src={chunk.path}></script>
    )),
    <script key="bundleJS" defer src="/assets/main.bundle.js"></script>,
  ];
}
