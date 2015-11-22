const zipObj = require.requireActual('../zipObj')

describe('zipObj', () => {
  it('zips objects', () => {
    const keys = ['a', 'b']
    const values = ['foo', 'bar']

    expect(zipObj(keys, values)).toEqual({
      a: 'foo',
      b: 'bar'
    })
  })
})
