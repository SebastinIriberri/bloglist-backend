// test/blog_api.test.js
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

let authToken = null

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  // 1. Creamos un usuario de prueba
  const newUser = {
    username: 'testuser',
    name: 'Test User',
    password: 'sekret',
  }

  await api.post('/api/users').send(newUser)

  // 2. Hacemos login para obtener el token
  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'sekret' })

  authToken = loginResponse.body.token

  // 3. Obtenemos el user desde la BD para asociarlo a los blogs iniciales
  const usersInDb = await User.find({})
  const user = usersInDb[0]

  // 4. Insertamos blogs iniciales con ese user como creador
  const blogsWithUser = helper.initialBlogs.map(blog => ({
    ...blog,
    user: user._id,
  }))

  await Blog.insertMany(blogsWithUser)
})

describe('when there are initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('unique identifier property of blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    const blog = response.body[0]

    expect(blog.id).toBeDefined()
    expect(blog._id).not.toBeDefined()
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })
})

describe('addition of a new blog', () => {
  test('a valid blog can be added when token is provided', async () => {
    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'Sebas',
      url: 'http://example.com/async',
      likes: 5,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).toContain('async/await simplifies making async calls')
  })

  test('fails with status code 401 if token is not provided', async () => {
    const newBlog = {
      title: 'Blog without token',
      author: 'No Auth',
      url: 'http://example.com/no-token',
      likes: 1,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('if likes property is missing, it defaults to 0', async () => {
    const newBlog = {
      title: 'Blog without likes',
      author: 'Nobody',
      url: 'http://example.com/nolikes',
      // likes no está
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    const saved = blogsAtEnd.find(b => b.title === 'Blog without likes')

    expect(saved.likes).toBe(0)
  })

  test('blog without title or url is not added', async () => {
    const newBlog = {
      author: 'Bad Blog',
      likes: 1,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('updating a blog', () => {
  test('succeeds in updating likes of a blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = {
      ...blogToUpdate,
      likes: blogToUpdate.likes + 10,
    }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toBe(blogToUpdate.likes + 10)
  })
})

test('fails with status code 401 if token is not provided when deleting', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(401)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

afterAll(async () => {
  await mongoose.connection.close()
})
