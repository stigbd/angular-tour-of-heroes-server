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

const publicEndpoint = '/api/public'
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
        var data = new Hero(hero)

        // ---- save logic start
        data
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
// ================================
var authCheck = jwt({ secret: process.env.SECRET })

// ===== Public Routes =====

// Get all public heroes
app.get(`${publicEndpoint}/heroes`, (req, res) => {
  console.log('req.query.name', req.query.name)
  var heroMap = {}
  Hero.find({name: new RegExp(req.query.name, 'm')}, function (err, heroes) {
    if (err) {
      return res.sendStatus(500)
    }
    console.log('heroes', heroes)
    heroes.forEach(function (hero) {
      var payload = {
        id: hero.id,
        name: hero.name
      }
      heroMap[hero._id] = payload
    })
    res.send(heroMap)
  })
})

// Get an individual public hero
app.get(`${publicEndpoint}/heroes/:id`, (req, res) => {
  var id = req.params.id
  Hero.findOne({id: id}, function (err, hero) {
    if (err) {
      console.error(err)
      return res.sendStatus(500)
    }
    if (!hero) {
      return res.sendStatus(404)
    }
    var payload = {
      id: hero.id,
      name: hero.name,
      email: hero.email,
      admin: hero.admin
    }
    res.send(payload)
  })
})

// Save a new public hero
app.post(`${publicEndpoint}/heroes`, (req, res) => {
  let lastHero = 0
  if (publicHeroes[publicHeroes.length - 1]) {
    lastHero = publicHeroes[publicHeroes.length - 1].id
  }

  const hero = {
    id: lastHero + 1,
    name: req.body.name
  }

  publicHeroes.push(hero)

  res.json(hero)
})

// Update a public hero
app.put(`${publicEndpoint}/heroes/:id`, (req, res) => {
  let hero = publicHeroes.find(hero => hero.id === req.params.id)
  hero.name = req.body.name
  res.sendStatus(204)
})

// Delete a public hero
app.delete(`${publicEndpoint}/heroes/:id`, (req, res) => {
  const hero = publicHeroes.find(hero => hero.id === req.params.id)
  if (!hero) {
    return res.sendStatus(404)
  }
  const index = publicHeroes.indexOf(hero)
  publicHeroes.splice(index, 1)
  res.sendStatus(204)
})

// ===== Private Routes =====

// Get all secret heroes
app.get(`${secretEndpoint}/heroes`, authCheck, (req, res) => {
  res.json(secretHeroes)
})

// Get an individual secret hero
app.get(`${secretEndpoint}/heroes/:id`, authCheck, (req, res) => {
  const hero = secretHeroes.find(hero => hero.id === req.params.id)

  if (!hero) {
    return res.sendStatus(404)
  }

  res.json(hero)
})

// Save a new secret hero
app.post(`${secretEndpoint}/heroes`, authCheck, (req, res) => {
  let lastHero = 0
  if (secretHeroes[secretHeroes.length - 1]) {
    lastHero = secretHeroes[secretHeroes.length - 1].id
  }
  const hero = {
    id: lastHero + 1,
    name: req.body.name
  }

  secretHeroes.push(hero)

  res.json(hero)
})

// Update a secret hero
app.put(`${secretEndpoint}/heroes/:id`, authCheck, (req, res) => {
  let hero = secretHeroes.find(hero => hero.id === req.params.id)
  hero.name = req.body.name
  res.sendStatus(204)
})

// Delete a secret hero
app.delete(`${secretEndpoint}/heroes/:id`, authCheck, (req, res) => {
  const hero = secretHeroes.find(hero => hero.id === req.params.id)
  if (!hero) {
    return res.sendStatus(404)
  }
  const index = secretHeroes.indexOf(hero)
  secretHeroes.splice(index, 1)
  res.sendStatus(204)
})

app.listen(process.env.PORT)
console.log('Listening on ' + process.env.HOST + ':' + process.env.PORT)
