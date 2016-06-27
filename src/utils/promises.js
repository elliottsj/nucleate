/* @flow */

import fromPairs from 'lodash/fp/fromPairs';
import map from 'lodash/fp/map';
import pipe from 'lodash/fp/pipe';
import toPairs from 'lodash/fp/toPairs';

const toPromisePairs = pipe(
  toPairs,
  map(
    ([key, promise]) => promise
      .then(value => [key, value])
      .catch(error => Promise.reject([key, error]))
  )
);

/**
 * Given an object with promise values, return a new promise which resolves with an object
 * containing the resolved values of the given promises, else rejects with an object containing
 * a single key-value pair containing the reason of the first promise that rejects.
 */
export function allValues<R>(
  obj: { [key: string]: Promise<R> }
): Promise<{ [key: string]: R }> {
  return Promise.all(toPromisePairs(obj))
    .then(fromPairs)
    .catch(([key, error]) => Promise.reject({ [key]: error }));
}

export function asCPSFunction1<R>(promise: Promise<R>): CPSFunction1<any, R> {
  return (arg0, callback) => {
    promise.then(
      result => callback(null, result),
      error => callback(error)
    );
  };
}
