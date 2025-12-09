// app.js
require('dotenv').config() 
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')

const app = express()

// Conexión a Mongo
const url = process.env.MONGODB_URI
console.log('MONGODB_URI:', url)

mongoose.set('strictQuery', false)
mongoose
  .connect(url)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch(error => {
    console.log('Error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())

// 👇 (en nada metemos aquí el extractor de token)
app.use(middleware.tokenExtractor)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)



module.exports = app
