jest.unmock('../asCPSFunction');

import {
  asCPSFunction1,
} from '../asCPSFunction';

describe('asCPSFunction1', () => {
  it('creates a unary CPS function given a promise', () => {
    const fn = asCPSFunction1(Promise.resolve('bar'));
    return new Promise((resolve) => {
      fn('foo', (error, result) => {
        expect(result).toBe('bar');
        resolve();
      });
    });
  });

  it('passes errors to the CPS continuation', () => {
    const fn = asCPSFunction1(Promise.reject('qux'));
    return new Promise((resolve) => {
      fn('baz', (error, result) => {
        expect(error).toBe('qux');
        expect(result).toBeUndefined();
        resolve();
      });
    });
  });
});
