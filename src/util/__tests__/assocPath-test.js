const assocPath = require.requireActual('../assocPath')

describe('assocPath', () => {
  it('returns the same object if an empty path is provided', () => {
    const obj = { foo: 'foo' }
    expect(assocPath([], 'bar', obj)).toBe(obj)
  })

  it('assigns a path of length 1', () => {
    const obj = { foo: 'foo' }
    expect(assocPath(['bar'], 'bar', obj)).toEqual({
      foo: 'foo',
      bar: 'bar'
    })
  })

  it('assigns a path of arbitrary length', () => {
    const obj = { foo: 'foo' }
    expect(assocPath(['bar', 'baz'], 'baz', obj)).toEqual({
      foo: 'foo',
      bar: {
        baz: 'baz'
      }
    })
  })

  it('merges into existing objects', () => {
    const obj = { foo: { qux: 'qux' } }
    expect(assocPath(['foo', 'baz'], 'baz', obj)).toEqual({
      foo: {
        qux: 'qux',
        baz: 'baz'
      }
    })
  })
})
