// @flow
/* eslint-disable react/no-multi-comp */

import React, { Component } from 'react';
import { Link } from 'react-router';
import { shallow } from 'enzyme';
import {
  basenameWithoutExtension,
  createHTMLComponent,
  createRoute,
  createRoutesFromModules,
  includeRoute,
  includeRoutes,
} from '../routes';

describe('basenameWithoutExtension', () => {
  it('returns the basename of the given path, without the extension', () => {
    expect(basenameWithoutExtension('./path/to/index.jsx')).toBe('index');
    expect(basenameWithoutExtension('/path/to/hello.txt')).toBe('hello');
    expect(basenameWithoutExtension('foobar.json')).toBe('foobar');
    expect(basenameWithoutExtension('.js')).toBe('.js');
  });
});

describe('createHTMLComponent', () => {
  it('creates an \'HTMLFragment\' component which renders ReactElements', () => {
    const HTMLFragment = createHTMLComponent(undefined, {}, '<div>content</div>');
    expect(HTMLFragment.name).toBe('HTMLFragment');
    shallow(<HTMLFragment />);
  });

  it('creates a component which renders the given HTML as ReactElements', () => {
    const HTMLFragment = createHTMLComponent(undefined, {}, '<div>content</div>');
    const wrapper = shallow(<HTMLFragment />);
    expect(wrapper.contains(<div>content</div>)).toBe(true);
  });

  it('replaces <a> elements with react-router <Link> elements', () => {
    const html = (
      '<div>' +
        '<h1>hello</h1>' +
        '<p>' +
          'here is an external <a href="https://example.com" target="_blank">link</a>' +
          'and an internal <a href="~/posts" foo="bar">link</a>' +
        '</p>' +
      '</div>'
    );
    const HTMLFragment = createHTMLComponent(undefined, {}, html);
    const wrapper = shallow(<HTMLFragment />);
    expect(wrapper.contains(
      <div>
        <h1>hello</h1>
        <p>
          here is an external <a href="https://example.com" target="_blank">link</a>
          and an internal <Link href="~/posts" foo="bar" to="/posts">link</Link>
        </p>
      </div>
    )).toBe(true);
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
