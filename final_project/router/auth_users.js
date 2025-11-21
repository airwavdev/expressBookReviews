const express = require('express')
const jwt = require('jsonwebtoken')
let books = require('./booksdb.js')
const regd_users = express.Router()

// Shared users array (exported so general.js can add new users)
let users = []

/**
 * isValid(username) -> boolean
 * Returns true if username does NOT exist already (so it is valid to register).
 */
const isValid = username => {
  if (!username) return false
  return !users.find(u => u.username === username)
}

/**
 * authenticatedUser(username, password) -> boolean
 * Returns true if username/password match a registered user.
 */
const authenticatedUser = (username, password) => {
  if (!username || !password) return false
  const user = users.find(
    u => u.username === username && u.password === password
  )
  return !!user
}

// only registered users can login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body

  // input validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' })
  }

  // verify credentials
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password' })
  }

  // Create JWT and store in session.authorization
  const accessToken = jwt.sign({ username: username }, 'access', {
    expiresIn: 60 * 60
  })

  req.session.authorization = {
    accessToken: accessToken
  }

  return res
    .status(200)
    .json({ message: 'User successfully logged in', accessToken: accessToken })
})

// Add or modify a book review (authenticated route)
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn
  const review = req.query.review

  if (!isbn || !review) {
    return res.status(400).json({ message: 'ISBN and review are required' })
  }

  // req.user should be set by index.js auth middleware after verifying JWT
  if (!req.user || !req.user.username) {
    return res.status(401).json({ message: 'User not authenticated' })
  }

  const username = req.user.username

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' })
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {}
  }

  // Add or update the review for the current user
  books[isbn].reviews[username] = review

  return res
    .status(200)
    .json({ message: 'Review added/updated', reviews: books[isbn].reviews })
})

// Delete a book review posted by the logged-in user
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn

  if (!req.user || !req.user.username) {
    return res.status(401).json({ message: 'User not authenticated' })
  }

  const username = req.user.username

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' })
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: 'Review by this user not found' })
  }

  // Delete only the logged-in user's review
  delete books[isbn].reviews[username]

  return res
    .status(200)
    .json({ message: 'Review deleted', reviews: books[isbn].reviews })
})

module.exports.authenticated = regd_users
module.exports.isValid = isValid
module.exports.users = users
