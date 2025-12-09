// utils/middleware.js
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  } else {
    request.token = null
  }
  next()
}

// 👇 NUEVO: userExtractor (4.22)
const userExtractor = async (request, response, next) => {
  const token = request.token

  if (!token) {
    // No hay token → que la ruta responda 401 si quiere,
    // o lo hacemos aquí. El curso suele devolver 401 aquí.
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)
    if (!user) {
      return response.status(401).json({ error: 'user not found' })
    }

    // Guardamos el usuario en la request
    request.user = user
    next()
  } catch (error) {
    next(error)
  }
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(error.name, error.message)
  }

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'invalid token' })
  }

  if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })
  }

  if (error.name === 'MongoServerError' && error.code === 11000) {
    return response.status(400).json({ error: 'username must be unique' })
  }

  return response.status(500).json({ error: 'something went wrong' })
}

module.exports = {
  tokenExtractor,
  userExtractor,      // 👈 exportamos el nuevo middleware
  unknownEndpoint,
  errorHandler,
}
