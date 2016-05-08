/* @flow */

import fromPairs from 'lodash/fp/fromPairs';
import toPairs from 'lodash/fp/toPairs';

/**
 * Given an object with promise values, return a new promise which resolves with an object
 * containing the resolved values of the given promises, else rejects with an object containing
 * a single key-value pair containing the reason of the first promise that rejects.
 */
export default function awaitValues(
  obj: { [key: string]: Promise<any> }
): Promise<{ [key: string]: any }> {
  const promisePairs = toPairs(obj).map(
    ([key, promise]) => promise.then(value => [key, value])
  );
  return Promise.all(promisePairs)
    .then(fromPairs)
    .catch(([key, reason]) => Promise.reject({ [key]: reason }));
}
