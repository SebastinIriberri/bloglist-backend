const listHelper = require('../utils/list_helper')

const listWithOneBlog = [
  {
    _id: '1',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0,
  },
]

const blogs = [
  {
    _id: '1',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0,
  },
  {
    _id: '2',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0,
  },
  {
    _id: '3',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0,
  },
  {
    _id: '4',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0,
  },
  {
    _id: '5',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0,
  },
  {
    _id: '6',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0,
  },
]

test('dummy returns one', () => {
  const result = listHelper.dummy([])

  expect(result).toBe(1)
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])

    expect(result).toBe(0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)

    expect(result).toBe(7)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(blogs)

    // 7 + 5 + 12 + 10 + 0 + 2 = 36
    expect(result).toBe(36)
  })
})

describe('favorite blog', () => {
  test('of empty list is null', () => {
    const result = listHelper.favoriteBlog([])

    expect(result).toBeNull()
  })

  test('of a bigger list is the one with most likes', () => {
    const result = listHelper.favoriteBlog(blogs)

    expect(result).toEqual({
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12,
    })
  })
})

describe('most blogs', () => {
  test('of empty list is null', () => {
    const result = listHelper.mostBlogs([])

    expect(result).toBeNull()
  })

  test('author with most blogs', () => {
    const result = listHelper.mostBlogs(blogs)

    expect(result).toEqual({
      author: 'Robert C. Martin',
      blogs: 3,
    })
  })
})

describe('most likes', () => {
  test('of empty list is null', () => {
    const result = listHelper.mostLikes([])

    expect(result).toBeNull()
  })

  test('author with most likes', () => {
    const result = listHelper.mostLikes(blogs)

    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 17, // 5 + 12
    })
  })
})

