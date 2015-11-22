import { curryable } from 'wu'

const uniqBy = curryable(function * uniqBy (fn, iterable) {
  const seen = new Set()
  for (let x of iterable) {
    const uniqVal = fn(x)
    if (!seen.has(uniqVal)) {
      yield x
      seen.add(uniqVal)
    }
  }
})

export default uniqBy
