// controllers/blogs.js
const blogsRouter = require('express').Router()
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const User = require('../models/user')
const { userExtractor } = require('../utils/middleware')

// GET: listar todos los blogs con info del usuario creador
blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog
      .find({})
      .populate('user', { username: 1, name: 1 })

    response.json(blogs)
  } catch (error) {
    next(error)
  }
})

// POST: crear blog SOLO si hay user extraído del token (4.22)
blogsRouter.post('/', userExtractor, async (request, response, next) => {
  const body = request.body

  try {
    const user = request.user  // viene de userExtractor

    // Por si acaso
    if (!user) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes, // mongoose pone 0 si viene undefined
      user: user._id,
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    const populatedBlog = await savedBlog.populate('user', { username: 1, name: 1 })

    response.status(201).json(populatedBlog)
  } catch (error) {
    next(error)
  }
})

// DELETE: solo el creador puede borrar (4.21 + 4.22 usando userExtractor)
blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  try {
    const user = request.user

    if (!user) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const id = request.params.id

    // 1) Validar formato del id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.status(400).json({ error: 'malformatted id' })
    }

    // 2) Buscar el blog
    const blog = await Blog.findById(id)

    if (!blog) {
      // no hay nada que borrar
      return response.status(204).end()
    }

    // 3) Comprobar que el usuario creador coincida
    if (blog.user && blog.user.toString() !== user._id.toString()) {
      return response
        .status(401)
        .json({ error: 'only the creator can delete a blog' })
    }

    // 4) Borrar
    await blog.deleteOne()

    return response.status(204).end()
  } catch (error) {
    next(error)
  }
})

// PUT: actualizar likes, etc.
blogsRouter.put('/:id', async (request, response, next) => {
  const { title, author, url, likes } = request.body

  const blog = {
    title,
    author,
    url,
    likes,
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      blog,
      { new: true, runValidators: true, context: 'query' }
    )

    response.json(updatedBlog)
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter
