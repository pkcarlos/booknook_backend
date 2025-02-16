const Book = require('../models/book')

const initialBooks = [
  {
    title: "The Maid",
    author: "Nita Prose",
    genre: "Mystery",
    favorite: false
  },
  {
    title: "Mistborn",
    author: "Brian Sanderson",
    genre: "Sci-Fi/Fantasy",
    favorite: true
  },
]

const booksInDb = async () => {
  const books = await Book.find({})
  return books.map(b => b.toJSON())
}

module.exports = {
  initialBooks,
  booksInDb
}