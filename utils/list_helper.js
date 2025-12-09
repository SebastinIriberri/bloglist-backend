// utils/list_helper.js

// 4.3 – función dummy
const dummy = (blogs) => {
  return 1
}

// 4.4 – total de likes
const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0)
}

// 4.5 – blog favorito
const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  const fav = blogs.reduce((prev, curr) =>
    curr.likes > prev.likes ? curr : prev
  )

  return {
    title: fav.title,
    author: fav.author,
    likes: fav.likes,
  }
}

// 4.6 – autor con más blogs
const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const counts = {}

  blogs.forEach((blog) => {
    counts[blog.author] = (counts[blog.author] || 0) + 1
  })

  let topAuthor = null
  let maxBlogs = 0

  Object.entries(counts).forEach(([author, blogsCount]) => {
    if (blogsCount > maxBlogs) {
      maxBlogs = blogsCount
      topAuthor = author
    }
  })

  return {
    author: topAuthor,
    blogs: maxBlogs,
  }
}

// 4.7 – autor con más likes acumulados
const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const likesByAuthor = {}

  blogs.forEach((blog) => {
    likesByAuthor[blog.author] =
      (likesByAuthor[blog.author] || 0) + (blog.likes || 0)
  })

  let topAuthor = null
  let maxLikes = 0

  Object.entries(likesByAuthor).forEach(([author, likes]) => {
    if (likes > maxLikes) {
      maxLikes = likes
      topAuthor = author
    }
  })

  return {
    author: topAuthor,
    likes: maxLikes,
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
