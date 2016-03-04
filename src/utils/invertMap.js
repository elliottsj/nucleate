import { map } from 'wu';

export default function invertMap(iterable) {
  return new Map(
    map(([key, value]) => [value, key], iterable)
  );
}
