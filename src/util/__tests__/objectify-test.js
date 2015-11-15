jest.dontMock('../assocPath')
const objectify = require.requireActual('../objectify')

describe('objectify', () => {
  it('converts a flat map to a nested object by path separator', () => {
    function HomePage () {}
    function PostsIndex () {}
    function Welcome () {}
    const pages = new Map([
      ['./Home', HomePage],
      ['./posts/index', PostsIndex],
      ['./posts/welcome.md', Welcome]
    ])
    expect(objectify(pages)).toEqual({
      Home: HomePage,
      posts: {
        index: PostsIndex,
        'welcome.md': Welcome
      }
    })
  })
})
