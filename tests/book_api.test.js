const { test, after, beforeEach } = require('node:test')
const Book = require('../models/book')
const helper = require('./test_helper')

const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')

const api = supertest(app)


beforeEach(async () => {
  await Book.deleteMany({})
  let bookObject = new Book(helper.initialBooks[0])
  await bookObject.save()
  bookObject = new Book(helper.initialBooks[1])
  await bookObject.save()
})

test('books are returned as json', async () => {
  await api
    .get('/api/books')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two books', async () => {
  const response = await api.get('/api/books')

  assert.strictEqual(response.body.length, helper.initialBooks.length)
})

test('the first book is The Maid', async () => {
  const response = await api.get('/api/books')

  const books = response.body.map(b => b.title)
  assert(books.includes('The Maid'))
})

test('a valid book can be added', async () => {
  const newBook = {
    title: "A Court of Thorns and Roses",
    author: "Sarah J. Maas",
    genre: "Sci-Fi/Fantasy",
    favorite: false
  }

  await api
    .post('/api/books')
    .send(newBook)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
  const booksAtEnd = await helper.booksInDb()
  
  const titles = booksAtEnd.map(b => b.title)
  
  assert.strictEqual(booksAtEnd.length, helper.initialBooks.length + 1)
  assert(titles.includes('A Court of Thorns and Roses'))
})

test('book with no author is not added', async () => {
  const newBook = {
    title: "The God in the WOods"
  }

  await api
    .post('/api/books')
    .send(newBook)
    .expect(400)
  
  const booksAtEnd = await helper.booksInDb()

  assert.strictEqual(booksAtEnd.length, helper.initialBooks.length)
})

test('book with no title is not added', async() => {
  const newBook = {
    author: "Liz Moore"
  }

  await api
    .post('/api/books')
    .send(newBook)
    .expect(400)
  
  const booksAtEnd = await helper.booksInDb()

  assert.strictEqual(booksAtEnd.length, helper.initialBooks.length)
})

test('book can be deleted', async() => {
  const booksAtStart = await helper.booksInDb()
  const bookToDelete = booksAtStart[0]

  await api
    .delete(`/api/books/${bookToDelete.id}`)
    .expect(204)
  
  const booksAtEnd = await helper.booksInDb()

  assert(!booksAtEnd.includes(bookToDelete))
  assert.strictEqual(booksAtEnd.length, helper.initialBooks.length - 1)
})

test('specific book can be viewed', async() => {
  const booksAtStart = await helper.booksInDb()
  const bookToView = booksAtStart[0]

  const result = await api
    .get(`/api/books/${bookToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  
  assert.deepStrictEqual(result.body, bookToView)
})

test('favorite property can be toggled', async() => {
  const booksAtStart = await helper.booksInDb()
  const bookToToggle = booksAtStart[0]
  const originalFavoriteStatus = bookToToggle.favorite

  const result = await api
    .put(`/api/books/${bookToToggle.id}`)
    .send({ favorite: !originalFavoriteStatus })
    .expect(200)

  assert.strictEqual(result.body.favorite, !originalFavoriteStatus)
})

after(async () => {
  await mongoose.connection.close()
})
