import invariant from 'invariant';
import path from 'path';
import React from 'react';
export { Link } from 'react-router';
export { default as Assets } from './components/Assets';
export { default as Children } from './components/Children';

function createHtmlComponent(html) {
  return function HtmlFragment() {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };
}

export function createRoute(mod) {
  return {
    ...mod,
    getComponent: mod.getComponent || ((location, callback) => {
      invariant(!!mod.content, 'A route must defined either `.getComponent` or `.content`');
      const component = createHtmlComponent(mod.content);
      callback(null, component);
    }),
  };
}

export function createRoutesFromContext(context) {
  return context.keys().map(moduleName => {
    const mod = context(moduleName);
    return {
      ...createRoute(mod),
      path: mod.path || path.basename(moduleName, path.extname(moduleName)),
    };
  });
}

export function getRoutes(routes, { prefix, index }) {
  return [
    {
      path: 'hi',
      date: '2016-01-01',
      title: 'Hi',
    },
  ];
}
