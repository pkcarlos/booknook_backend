require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')

const Book = require('./models/book')

app.use(express.static('dist'))
app.use((express.json())) // need to use this as middleware because express doesn't parse json automatically
app.use(cors())

app.get('/api/books', (request, response) => {
  Book.find({}).then(books => {
    response.json(books)
  })
})

app.get('/api/books/:id', (request, response) => {
  Book.findById(request.params.id).then(book => {
    if (book) {
      response.json(book)
    } else (
      response.status(404).end()
    )
  })
  .catch(error => next(error))
})

app.delete('/api/books/:id', (request, response) => {
  Book.findByIdAndDelete(request.params.id).then(book => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

app.post('/api/books', (request, response, next) => {
  const body = request.body

  const duplicate = (book) => {
    const books = Book.find({}).then(books => {
      console.log(books)
      return books.filter(b => b.title === book.title && b.author === b.author).length > 0
    })
  }

  const newBook = new Book({
    title: body.title,
    author: body.author,
    genre: body.genre || '',
    favorite: false
  })
  
  if (duplicate(newBook)) {
    response.status(404)
      .send({ error: 'book title and author already exist' })
      .end()
  } else {
    newBook.save()
    .then(savedBook => {
      response.json(savedBook)
    })
    .catch(error => next(error))
  }
})

app.put('/api/books/:id', (request, response) => {
  const body = request.body
  const book = { ...body, favorite: body.favorite }

  Book.findByIdAndUpdate(request.params.id, book, { new: true }).then(updatedBook => {
    response.json(updatedBook)
  })
  .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name == 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})