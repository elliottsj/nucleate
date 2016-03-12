import React from 'react';

export default function assets() {
  return [
    <link key="bundleCSS" rel="stylesheet" href="/assets/client.bundle.css" />,
    <script key="bundleJS" defer src="/assets/client.bundle.js"></script>,
  ];
}
