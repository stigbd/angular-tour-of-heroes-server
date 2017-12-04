'use strict'

const express = require('express')
const app = express()
const jwt = require('express-jwt')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
require('dotenv').config()
let mongoose = require('mongoose')

let publicHeroes = require('./data/heroes').publicHeroes
let secretHeroes = require('./data/heroes').secretHeroes
let Hero = require('./models/hero')
let SecretHero = require('./models/secrethero')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(morgan('combined'))

var promiseLib = global.Promise

// Set up mongodb connection
let uri
var db = process.env.DATABASE
if (process.env.NODE_ENV === 'test') {
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
    if (process.env.NODE_ENV !== 'test') {
      console.log('Loading default heroes')
      for (var hero of publicHeroes) {
        console.log(hero)
        var newHero = new Hero(hero)

        // ---- save logic start
        newHero
          .save()
          .then(saved => console.log('saved', saved))
          .catch(err => {
            if (err.code === 11000) {
              return console.log('Object already saved')
            }
            console.error('err while saving', err)
          })
        // ---- save logic end
      }
      for (var secretHero of secretHeroes) {
        var newSecretHero = new SecretHero(secretHero)

        // ---- save logic start
        newSecretHero
          .save()
          .then(saved => console.log('saved', saved))
          .catch(err => {
            if (err.code === 11000) {
              return console.log('Object already saved')
            }
            console.error('err while saving', err)
          })
        // ---- save logic end
      }
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
    console.err(err)
  }
  next(err)
})

app.listen(process.env.PORT)
console.log('Listening on ' + process.env.HOST + ':' + process.env.PORT)
