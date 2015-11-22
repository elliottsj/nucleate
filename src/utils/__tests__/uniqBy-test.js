const uniqBy = require.requireActual('../uniqBy')

describe('uniqPath', () => {
  it('returns the first occurence of each item based on the return value of applying the function to each item', () => {
    const list = [
      {
        a: 'foo',
        b: 'bar'
      },
      {
        a: 'baz',
        b: 'qux'
      },
      {
        a: 'foo',
        b: 'qux'
      }
    ]

    const uniqByA = uniqBy(x => x.a)
    expect([...uniqByA(list)]).toEqual([
      {
        a: 'foo',
        b: 'bar'
      },
      {
        a: 'baz',
        b: 'qux'
      }
    ])
  })
})
