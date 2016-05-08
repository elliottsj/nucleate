type CPSCallback<T> = (error: ?Error, value: T) => void;
/* eslint-disable no-unused-vars */
type CPSFunction<A, T> = (arg: A, callback: CPSCallback<T>) => void;
/* eslint-enable */

declare module 'pify' {
  declare interface PifyOptions {
    multiArgs?: boolean,
    include?: string | RegExp,
    exclude?: string | RegExp,
    excludeMain?: boolean,
  }

  declare function exports<A, T>(
    input: CPSFunction<A, T>,
    options: ?PifyOptions,
  ): (arg: A) => Promise<T>;
}
