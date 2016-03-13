export default function awaitValues(obj) {
  const promisePairs = Object.keys(obj).map(
    key => [key, obj[key]]
  ).map(
    ([key, promise]) => promise.then(value => [key, value])
  );
  return Promise.all(promisePairs).then(
    pairs => pairs.reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value }),
      {}
    )
  );
}
