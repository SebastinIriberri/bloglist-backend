// models/user.js
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'username is required'],
    unique: true,
    minlength: [3, 'username must be at least 3 characters long'],
  },
  name: String,
  passwordHash: {
    type: String,
    required: [true, 'passwordHash is required'],
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash  // nunca mandamos el hash al front
  },
})

// 👇 AQUÍ es donde se define UNA SOLA VEZ el modelo
module.exports = mongoose.model('User', userSchema)
