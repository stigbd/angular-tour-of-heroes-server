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

const secretEndpoint = '/api/secret'

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

// Get all secret heroes
app.get(`${secretEndpoint}/secretheroes`, authCheck, (req, res) => {
  var secretHeroMap = {}
  SecretHero.find({name: new RegExp(req.query.name, 'm')}, function (err, secretHeroes) {
    if (err) {
      return res.sendStatus(500)
    }
    secretHeroes.forEach(function (secretHero) {
      var payload = {
        name: secretHero.name
      }
      secretHeroMap[secretHero._id] = payload
    })
    res.send(secretHeroMap)
  })
})

// Get an individual secret hero
app.get(`${secretEndpoint}/secretheroes/:id`, authCheck, (req, res) => {
  var id = req.params.id
  SecretHero.findById(id, function (err, secretHero) {
    if (err) {
      console.error(err)
      return res.sendStatus(500)
    }
    if (!secretHero) {
      return res.sendStatus(404)
    }
    var payload = {
      id: secretHero.id,
      name: secretHero.name
    }
    res.send(payload)
  })
})

// Save a new secret hero
app.post(`${secretEndpoint}/secretheroes`, authCheck, (req, res) => {
  let secretHero = new SecretHero({
    name: req.body.name
  })
  secretHero.save(function (err) {
    if (err && err.name === 'MongoError' && err.message.includes('E11000')) {
      err.name = 'DuplicationError'
      err.message = 'SecretHero already exists'
      return res.status(400).json({errorName: err.name, errorMessage: err.message})
    }
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({errorName: err.name, errorMessage: err.message})
    }
    if (err) {
      console.log(err)
      return res.status(500).json({error: true})
    }
    res.status(201).location('/secretHeroes/' + secretHero.id).send()
  })
})

// Update a secret hero
app.put(`${secretEndpoint}/secretheroes/:id`, authCheck, (req, res) => {
  var id = req.params.id
  SecretHero.findById(id, function (err, secretHero) {
    if (err) {
      console.error(err)
      return res.sendStatus(500)
    }
    if (!secretHero) {
      return res.sendStatus(404)
    }
    secretHero.name = req.body.name || secretHero.name
    secretHero.save(function (err) {
      if (err) {
        console.error(err)
        return res.sendStatus(500)
      }
    })
    res.sendStatus(204)
  })
})

// Delete a secret hero
app.delete(`${secretEndpoint}/secretheroes/:id`, authCheck, (req, res) => {
  var id = req.params.id
  SecretHero.findByIdAndRemove(id, function (err, secretHero) {
    if (err) {
      return res.sendStatus(500)
    }
    if (!secretHero) {
      return res.sendStatus(404)
    }
    res.sendStatus(204)
  })
})

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({'message': 'Invalid token'})
    console.err(err)
  }
  next(err)
})

app.listen(process.env.PORT)
console.log('Listening on ' + process.env.HOST + ':' + process.env.PORT)
