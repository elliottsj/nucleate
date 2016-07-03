// @flow

export function asCPSFunction1<R>(promise: Promise<R>): CPSFunction1<any, R> {
  return (arg0, callback) => {
    promise.then(
      result => callback(null, result),
      error => callback(error)
    );
  };
}
