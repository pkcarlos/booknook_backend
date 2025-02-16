const booksRouter = require('express').Router()
const Book = require('../models/book')

booksRouter.get('/', async (request, response) => {
  const books = await Book.find({})
  response.status(200).json(books)
})

booksRouter.get('/:id', async (request, response, next) => {
  const book = await Book.findById(request.params.id)

  if (book) {
    response.status(200).json(book)
  } else (
    response.status(404).end()
  )
})

booksRouter.delete('/:id', async (request, response, next) => {
  await Book.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

booksRouter.post('/', async (request, response, next) => {
  const body = request.body

  const duplicate = async (book) => {
    const duplicate = await Book.findOne({ title: { $regex: new RegExp(`^${book.title}$`, 'i') }, author: book.author })
    return duplicate
  }

  const newBook = new Book({
    title: body.title,
    author: body.author,
    genre: body.genre || '',
    favorite: false
  })
  
  if (await duplicate(newBook)) {
    response.status(400)
      .send({ error: 'book title and author already exist' })
      .end()
  } else {
    const savedBook = await newBook.save()
    response.status(201).json(savedBook)
  }
})

// add test for toggling favorite
booksRouter.put('/:id', async (request, response) => {
  const body = request.body
  const book = { ...body, favorite: body.favorite }

  const updatedBook = await Book.findByIdAndUpdate(request.params.id, book, { new: true })
  response.status(200).json(updatedBook)
})

module.exports = booksRouter