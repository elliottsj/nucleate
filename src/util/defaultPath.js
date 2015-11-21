import path from 'path'

/**
 * Get the default router path for the given JS module path.
 * Module paths ending in '/index' are stripped to just the base directory.
 *
 * Examples:
 * defaultPath('./somedir/hello') === '/somedir/hello'
 * defaultPath('./anotherdir/index') === '/anotherdir'
 *
 * @param  {String} pth  The path to a JS module, relative to the nucleate src dir
 * @return {String}      The absolute router path
 */
export default function defaultPath (pth: string): string {
  const lowerPth = pth.toLowerCase()
  return path.basename(lowerPth) === 'index'
    ? path.dirname(lowerPth.slice(1))
    : lowerPth.slice(1)
}
