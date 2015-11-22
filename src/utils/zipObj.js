import { curryable, reduce, zip } from 'wu'

export default curryable((keys, values) => reduce((obj, [key, value]) => ({
  ...obj,
  [key]: value
}), {}, zip(keys, values)))
