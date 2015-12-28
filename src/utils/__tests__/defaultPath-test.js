jest.dontMock('../compose')
const defaultPath = require.requireActual('../defaultPath')

describe('defaultPath', () => {
  it('strips the leading "."', () => {
    expect(defaultPath('./somedir/hello')).toBe('/somedir/hello')
  })

  it('strips the trailing "/index"', () => {
    expect(defaultPath('./anotherdir/index')).toBe('/anotherdir')
  })

  it('strips the file extension', () => {
    expect(defaultPath('./anotherdir/foo.md')).toBe('/anotherdir/foo')
  })

  it('strips only the last file extension', () => {
    expect(defaultPath('./anotherdir/foo.md.html')).toBe('/anotherdir/foo.md')
  })
})
