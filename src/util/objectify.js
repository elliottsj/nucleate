import { reduce } from 'wu'
import assocPath from './assocPath'

const splitPath = pth => pth.split('/').slice(1)
export default reduce(
  (obj, [pth, component]) => assocPath(splitPath(pth), component, obj),
  {}
)
