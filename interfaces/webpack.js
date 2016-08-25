declare module 'webpack' {
  declare interface Compiler {
    plugin(step: string, cb: () => void): void;
  }

  declare interface Context {
    (request: string): any;
    keys(): string[];
    resolve(request: string): number;
  }
}
