const express = require('express')
let books = require('./booksdb.js')
let isValid = require('./auth_users.js').isValid
let users = require('./auth_users.js').users
const public_users = express.Router()

// Register a new user (public endpoint)
public_users.post('/register', (req, res) => {
  const { username, password } = req.body

  // validate input
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' })
  }

  // check if username is already taken
  if (!isValid(username)) {
    return res.status(400).json({ message: 'Username already exists' })
  }

  // add user to shared users array
  users.push({ username: username, password: password })

  return res.status(201).json({ message: 'User registered successfully' })
})

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Send all books as nicely formatted JSON
  return res.send(JSON.stringify(books, null, 4))
})

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn

  // The books keys in booksdb.js are numeric keys 1..10 - treat isbn as string/number
  if (books[isbn]) {
    return res.send(books[isbn])
  } else {
    return res
      .status(404)
      .json({ message: 'Book not found for the given ISBN' })
  }
})

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author
  const keys = Object.keys(books)
  const matched = []

  keys.forEach(key => {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      matched.push(books[key])
    }
  })

  if (matched.length > 0) {
    return res.send(matched)
  } else {
    return res
      .status(404)
      .json({ message: 'No books found for the given author' })
  }
})

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title
  const keys = Object.keys(books)
  const matched = []

  keys.forEach(key => {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      matched.push(books[key])
    }
  })

  if (matched.length > 0) {
    return res.send(matched)
  } else {
    return res
      .status(404)
      .json({ message: 'No books found for the given title' })
  }
})

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn
  if (books[isbn]) {
    return res.send(books[isbn].reviews)
  } else {
    return res
      .status(404)
      .json({ message: 'Book not found for the given ISBN' })
  }
})

module.exports.general = public_users
