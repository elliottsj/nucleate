import path from 'path'
import comp from './comp'

function toLowerCase (str) {
  return str.toLowerCase()
}

function trimLeft1 (str) {
  return str.slice(1)
}

function stripIndex (pth) {
  return path.basename(pth) === 'index'
    ? path.dirname(pth)
    : pth
}

function stripExtension (pth) {
  const dirname = path.dirname(pth)
  const basename = path.basename(pth, path.extname(pth))
  return path.join(dirname, basename)
}

/**
 * Get the default router path for the given JS module path.
 * The last file extension is stripped.
 * Module paths ending in '/index' are stripped to just the base directory.
 *
 * Examples:
 * defaultPath('./somedir/hello') === '/somedir/hello'
 * defaultPath('./anotherdir/index') === '/anotherdir'
 * defaultPath('./anotherdir/foo.md') === '/anotherdir/foo'
 * defaultPath('./anotherdir/foo.md.html') === '/anotherdir/foo.md'
 *
 * @param  {String} pth  The path to a JS module, relative to the nucleate src dir
 * @return {String}      The absolute router path
 */
export default comp(
  stripExtension,
  stripIndex,
  trimLeft1,
  toLowerCase
)
