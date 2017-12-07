'use strict'

var upperCase = require('upper-case')
const express = require('express')
const app = express()
const jwt = require('express-jwt')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
require('dotenv').config()
let mongoose = require('mongoose')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(morgan('combined'))

var promiseLib = global.Promise

// Set up mongodb connection
let uri
var db = process.env.DATABASE
if (upperCase(process.env.NODE_ENV) === 'TEST') {
  db = process.env.TEST_DATABASE
}
uri = 'mongodb://' + process.env.DBHOST + ':' + process.env.DBPORT + '/' + db

var options = {
  useMongoClient: true,
  promiseLibrary: promiseLib
}

mongoose.connect(uri, options)
  .then(() => {
    console.log('Connected to the following db: ' + uri)
    if (upperCase(process.env.NODE_ENV) !== 'TEST') {
      // ===== Load default data ====
      var heroLoader = require('./etl/heroLoader')
      heroLoader.loadHeroes()
      var secretHeroLoader = require('./etl/secretHeroLoader')
      secretHeroLoader.loadSecretHeroes()
    }
  })
  .catch(err => {
    console.error('Error while trying to connect with mongodb')
    throw err
  })

// ===== Public Routes =====

var hero = require('./routes/hero')
app.use('/', hero)

// ===== Private Routes =====

var authCheck = jwt({ secret: process.env.SECRET })

var secretHero = require('./routes/secrethero')
app.use('/', authCheck, secretHero)

// ===== Error handling  =====

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({'message': 'Invalid token'})
    console.error(err)
  }
  next(err)
})

app.listen(process.env.PORT)
console.log('Listening on ' + process.env.HOST + ':' + process.env.PORT)
