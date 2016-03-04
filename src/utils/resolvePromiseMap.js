import { map } from 'wu';

export default function resolvePromiseMap(promiseMap) {
  const promisePairs = map(
    ([key, promise]) => promise.then(value => [key, value]),
    promiseMap
  );
  return Promise.all(promisePairs).then(
    pairs => new Map(pairs)
  );
}
