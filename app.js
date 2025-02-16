const config = require('./utils/config')
const express = require('express')
require('express-async-errors') // eliminate try/catch blocks
const app = express()
const cors = require('cors')
const notesRouter = require('./controllers/books')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const booksRouter = require('./controllers/books')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch(error => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors()) 
app.use(express.static('dist'))
app.use((express.json())) // need to use this as middleware because express doesn't parse json automatically
app.use(middleware.requestLogger)

app.use('/api/books', booksRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app