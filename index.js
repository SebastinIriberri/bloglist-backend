const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

// temporal, solo para ver que funciona
const blogs = [
  {
    id: 1,
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  }
]

app.get('/api/blogs', (req, res) => res.json(blogs))

const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
