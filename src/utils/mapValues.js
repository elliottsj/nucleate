export default function mapValues(fn, obj) {
  return Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      [key]: fn(obj[key]),
    }),
    {}
  );
}
