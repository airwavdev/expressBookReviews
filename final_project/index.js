const express = require('express')
const jwt = require('jsonwebtoken')
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated
const genl_routes = require('./router/general.js').general

const app = express()

app.use(express.json())

// Session middleware applied to /customer routes
app.use(
  '/customer',
  session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true
  })
)

// Authentication middleware for protected routes under /customer/auth/*
app.use('/customer/auth/*', function auth (req, res, next) {
  // Check that session contains an authorization object
  if (
    req.session &&
    req.session.authorization &&
    req.session.authorization.accessToken
  ) {
    const token = req.session.authorization.accessToken
    try {
      // Verify token synchronously; throws if invalid/expired
      const decoded = jwt.verify(token, 'access')
      // Attach decoded token (e.g., username) to request for downstream handlers
      req.user = decoded
      return next()
    } catch (err) {
      // Token invalid or expired
      return res
        .status(401)
        .json({ message: 'User not authenticated or token expired' })
    }
  } else {
    // No session / not logged in
    return res.status(403).json({ message: 'User not logged in' })
  }
})

const PORT = 5000

app.use('/customer', customer_routes)
app.use('/', genl_routes)

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
