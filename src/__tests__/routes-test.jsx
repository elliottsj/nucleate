// @flow
/* eslint-disable react/no-multi-comp */

import React, { Component } from 'react';
import { shallow } from 'enzyme';
import {
  createRoute,
  createRoutesFromModules,
  getRoutePath,
  includeRoute,
  includeRoutes,
} from '../routes';

describe('getRoutePath', () => {
  it('returns the correct route path given a module path', () => {
    expect(getRoutePath('./about.md')).toBe('about');
    expect(getRoutePath('./posts')).toBe('posts');
    expect(getRoutePath('./posts.jsx')).toBe('posts');
    expect(getRoutePath('./2014-07-26-hello.md')).toBe('2014-07-26-hello');
    expect(
      getRoutePath('./2014/01/09/public-key-authentication-on-cdf.md')
    ).toBe(
      '2014/01/09/public-key-authentication-on-cdf'
    );
  });
});

describe('createRoute', () => {
  it('creates a PlainRoute from the enumerable properties of the given route module', () => {
    class HelloPage extends Component { // eslint-disable-line react/prefer-stateless-function
      render() {
        return <div>hello</div>;
      }
    }
    function getChildRoutes() {}
    const routeModule = Object.create(Object.prototype, {
      __esModule: {
        value: true,
      },
      meta: {
        configurable: true,
        enumerable: true,
        value: {
          title: 'Hello',
        },
        writable: true,
      },
      component: {
        configurable: true,
        enumerable: true,
        value: HelloPage,
        writable: true,
      },
      getChildRoutes: {
        configurable: true,
        enumerable: true,
        value: getChildRoutes,
        writable: true,
      },
    });
    const route = createRoute(routeModule);
    expect(route.hasOwnProperty('__esModule')).toBe(false);
    expect(route.hasOwnProperty('path')).toBe(false);
    expect(route).toEqual({
      meta: { title: 'Hello' },
      component: HelloPage,
      getChildRoutes,
    });
  });

  it('sets an empty \'meta\' object property by default', () => {
    class HelloPage extends Component { // eslint-disable-line react/prefer-stateless-function
      render() {
        return <div>hello</div>;
      }
    }
    function getChildRoutes() {}
    const route = createRoute({
      component: HelloPage,
      getChildRoutes,
    });
    expect(route).toEqual({
      meta: {},
      component: HelloPage,
      getChildRoutes,
    });
  });

  it('uses \'.path\' from the module, if defined', () => {
    class HelloPage extends Component { // eslint-disable-line react/prefer-stateless-function
      render() {
        return <div>hello</div>;
      }
    }
    function getChildRoutes() {}
    const route = createRoute({
      path: 'test',
      component: HelloPage,
      getChildRoutes,
    }, 'second');
    expect(route).toEqual({
      meta: {},
      path: 'test',
      component: HelloPage,
      getChildRoutes,
    });
  });

  it('uses \'.path\' from the second argument, if not defined in the module', () => {
    class HelloPage extends Component { // eslint-disable-line react/prefer-stateless-function
      render() {
        return <div>hello</div>;
      }
    }
    function getChildRoutes() {}
    const route = createRoute({
      component: HelloPage,
      getChildRoutes,
    }, 'second');
    expect(route).toEqual({
      meta: {},
      path: 'second',
      component: HelloPage,
      getChildRoutes,
    });
  });

  it('creates a component from \'.html\', if \'.component\' is not defined on the module', () => {
    function getChildRoutes() {}
    const route = createRoute({
      html: '<div>content</div>',
      getChildRoutes,
    });
    expect(route).toEqual({
      html: '<div>content</div>',
      meta: {},
      component: jasmine.any(Function),
      getChildRoutes,
    });
    const HTMLFragment = route.component;
    expect(shallow(<HTMLFragment />).html()).toBe('<div><div>content</div></div>');
  });
});

describe('createRoutesFromModules', () => {});

describe('includeRoute', () => {});

describe('includeRoutes', () => {});
