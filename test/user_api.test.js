const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})

  const user = new User({
    username: 'root',
    name: 'Super User',
    passwordHash: '$2b$10$examplehash', // puede ser cualquier string
  })

  await user.save()
})

test('creation fails with status 400 if username already taken', async () => {
  const usersAtStart = await User.find({})

  const newUser = {
    username: 'root',
    name: 'Another Root',
    password: 'salainen',
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  expect(result.body.error).toContain('username must be unique')

  const usersAtEnd = await User.find({})
  expect(usersAtEnd).toHaveLength(usersAtStart.length)
})

test('creation fails with status 400 if username is too short', async () => {
  const newUser = {
    username: 'ab', // solo 2 caracteres
    name: 'Short Name',
    password: 'validPass',
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  expect(result.body.error).toContain('username') // o 'must be at least 3'

  const users = await User.find({})
  expect(users).toHaveLength(1) // solo el root
})

test('creation fails with status 400 if password is too short', async () => {
  const newUser = {
    username: 'validuser',
    name: 'Valid Name',
    password: '12', // 2 chars
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  expect(result.body.error).toContain('password must be at least 3 characters long')

  const users = await User.find({})
  expect(users).toHaveLength(1)
})

afterAll(async () => {
  await mongoose.connection.close()
})
