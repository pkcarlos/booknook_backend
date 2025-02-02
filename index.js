const express = require('express')
const app = express()
const cors = require('cors')

app.use((express.json())) // need to use this as middleware because express doesn't parse json automatically
app.use(cors())

let books = [
  {
    "id": "1",
    "title": "The Covenant of Water",
    "author": "Abraham Verghese",
    "genre": "Fiction",
    "favorite": false
  },
  {
    "id": "2",
    "title": "The God in the Woods",
    "author": "Liz Moore",
    "genre": "Mystery",
    "favorite": false
  },
  {
    "id": "3",
    "title": "The Silmarillion",
    "author": "J.R.R. Tolkien",
    "genre": "Sci-Fi/Fantasy",
    "favorite": true
  },
  {
    "id": "6",
    "title": "The Assassin's Blade",
    "author": "Sarah J. Maas",
    "genre": "Sci-Fi/Fantasy",
    "favorite": false
  },
  {
    "id": "7",
    "title": "A Little Life",
    "author": "Hanya Yanagihara",
    "genre": "Fiction"
  },
  {
    "id": "8",
    "title": "Babel",
    "author": "R.F. Kuang",
    "genre": "Sci-Fi/Fantasy"
  },
  {
    "id": "9",
    "title": "The GOldfish",
    "author": "Donna Tart",
    "genre": "Fiction"
  }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

app.get('/info', (request, response) => {
  response.send(`<p>BookNook has info for ${books.length} books.</p>`)
})

app.get('/api/books', (request, response) => {
  response.json(books)
})

app.get('/api/books/:id', (request, response) => {
  const id = request.params.id
  const book = books.find(book => book.id === id)
  
  if (book) {
    response.json(book)
  } else (
    response.status(404).end()
  )
})

app.delete('/api/books/:id', (request, response) => {
  const id = request.params.id
  books = books.filter(book => book.id !== id)

  response.status(204).end()
})

app.post('/api/books', (request, response) => {
  const generateId = () => {
    const maxId = books.length > 0 
    ? Math.max(...books.map(b => Number(b.id)))
    : 0

    return String(maxId + 1)
  }
  const book = request.body
  const duplicate = (book) => {
    return books.filter(b => b.title === book.title && b.author === b.author).length > 0
  }

  if (!book.title || !book.author) {
    response.status(404)
      .send({ error: 'title and author must be included' })
      .end()
  } else if (duplicate(book)) {
    response.status(404)
      .send({ error: 'book title and author already exist' })
      .end()
  } else {
    book.id = generateId()
    books = books.concat(book)
    response.json(book)
  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})