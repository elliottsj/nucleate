jest.unmock('../promises');

import {
  allValues,
  asCPSFunction1,
} from '../promises';

describe('allValues', () => {
  it('returns an object with resolved values of the given promises', () =>
    allValues({
      one: Promise.resolve('oneValue'),
      two: Promise.resolve('twoValue'),
    }).then((result) => {
      expect(result).toEqual({
        one: 'oneValue',
        two: 'twoValue',
      });
    })
  );

  it('rejects with a single key-value pair of the first rejected promise', () =>
    allValues({
      pass: Promise.resolve('passValue'),
      fail: Promise.reject('failValue'),
    }).then(() => {
      throw new Error('Unexpected promise fulfillment');
    }, (error) => {
      expect(error).toEqual({
        fail: 'failValue',
      });
    })
  );
});

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
