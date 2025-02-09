const booksRouter = require('express').Router()
const Book = require('../models/book')

booksRouter.get('/', (request, response) => {
  Book.find({}).then(books => {
    response.json(books)
  })
})

booksRouter.get('/:id', (request, response) => {
  Book.findById(request.params.id).then(book => {
    if (book) {
      response.json(book)
    } else (
      response.status(404).end()
    )
  })
  .catch(error => next(error))
})

booksRouter.delete('/:id', (request, response) => {
  Book.findByIdAndDelete(request.params.id).then(book => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

booksRouter.post('/', (request, response, next) => {
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

booksRouter.put('/:id', (request, response) => {
  const body = request.body
  const book = { ...body, favorite: body.favorite }

  Book.findByIdAndUpdate(request.params.id, book, { new: true }).then(updatedBook => {
    response.json(updatedBook)
  })
  .catch(error => next(error))
})

module.exports = booksRouter