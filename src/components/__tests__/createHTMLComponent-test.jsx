import React from 'react';
import { Link } from 'react-router';
import { shallow } from 'enzyme';

import createHTMLComponent from '../createHTMLComponent';

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
          'here is an external <a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>' +
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
          here is an external <a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>
          and an internal <Link href="~/posts" foo="bar" to="/posts">link</Link>
        </p>
      </div>
    )).toBe(true);
  });
});
