declare module 'pify' {
  declare interface PifyOptions {
    multiArgs?: boolean,
    include?: string | RegExp,
    exclude?: string | RegExp,
    excludeMain?: boolean,
  }

  declare function exports<A, T>(
    input: CPSFunction1<A, T>,
    options: ?PifyOptions,
  ): (arg: A) => Promise<T>;
}
