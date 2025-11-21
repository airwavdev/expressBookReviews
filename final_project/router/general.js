const express = require('express')
const axios = require('axios')
let books = require('./booksdb.js')
let isValid = require('./auth_users.js').isValid
let users = require('./auth_users.js').users
const public_users = express.Router()

// ------------------------
// Register a new user
// ------------------------
public_users.post('/register', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' })
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: 'Username already exists' })
  }

  users.push({ username: username, password: password })
  return res.status(201).json({ message: 'User registered successfully' })
})

// ------------------------
// Task 1: Get all books
// ------------------------
public_users.get('/', (req, res) => {
  return res.send(JSON.stringify(books, null, 4))
})

// ------------------------
// Task 2: Get book by ISBN
// ------------------------
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn
  if (books[isbn]) {
    return res.send(books[isbn])
  } else {
    return res
      .status(404)
      .json({ message: 'Book not found for the given ISBN' })
  }
})

// ------------------------
// Task 3: Get book by author
// ------------------------
public_users.get('/author/:author', (req, res) => {
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

// ------------------------
// Task 4: Get book by title
// ------------------------
public_users.get('/title/:title', (req, res) => {
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

// ------------------------
// Get book reviews
// ------------------------
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn
  if (books[isbn]) {
    return res.send(books[isbn].reviews)
  } else {
    return res
      .status(404)
      .json({ message: 'Book not found for the given ISBN' })
  }
})

// ------------------------
// Tasks 10-13: Using Promises (with Axios)
// ------------------------

// Task 10: Get all books (Promise)
public_users.get('/promises/books', (req, res) => {
  axios
    .get('http://localhost:5000/')
    .then(response => res.json(response.data))
    .catch(err =>
      res
        .status(500)
        .json({ message: 'Error fetching books', error: err.message })
    )
})

// Task 11: Get book by ISBN (Promise)
public_users.get('/promises/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn
  axios
    .get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => res.json(response.data))
    .catch(err =>
      res
        .status(500)
        .json({ message: 'Error fetching ISBN', error: err.message })
    )
})

// Task 12: Get book by author (Promise)
public_users.get('/promises/author/:author', (req, res) => {
  const author = req.params.author
  axios
    .get(`http://localhost:5000/author/${author}`)
    .then(response => res.json(response.data))
    .catch(err =>
      res
        .status(500)
        .json({ message: 'Error fetching author', error: err.message })
    )
})

// Task 13: Get book by title (Promise)
public_users.get('/promises/title/:title', (req, res) => {
  const title = req.params.title
  axios
    .get(`http://localhost:5000/title/${title}`)
    .then(response => res.json(response.data))
    .catch(err =>
      res
        .status(500)
        .json({ message: 'Error fetching title', error: err.message })
    )
})

module.exports.general = public_users
