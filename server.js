'use strict';

const express = require('express');
const app = express();
const jwt = require('express-jwt');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const dotenv = require('dotenv').config();

let publicHeroes = require('./heroes').publicHeroes;
let secretHeroes = require('./heroes').secretHeroes;

const publicEndpoint = '/api/public';
const secretEndpoint = '/api/secret';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('combined'))

var authCheck = jwt({ secret: process.env.SECRET});

// ===== Public Routes =====

// Get all public heroes
app.get(`${publicEndpoint}/heroes`, (req, res) => {
  if (!req.query.name) {
    return res.json(publicHeroes)
  }
  var results = [];
  var searchField = "name";
  var searchVal = req.query.name;
  for (var i=0 ; i < publicHeroes.length ; i++) {
      if (publicHeroes[i].name.startsWith(searchVal)) {
        results.push(publicHeroes[i]);
      }
  }
  res.json(results)
});

// Get an individual public hero
app.get(`${publicEndpoint}/heroes/:id`, (req, res) => {
  const hero = publicHeroes.find(hero => hero.id == req.params.id);
  if (!hero) {
    return res.sendStatus(404);
  }
  res.json(hero);
});

// Save a new public hero
app.post(`${publicEndpoint}/heroes`, (req, res) => {
  let lastHero = 0;
  if (publicHeroes[publicHeroes.length - 1]) {
    lastHero = publicHeroes[publicHeroes.length - 1].id;
  }

  const hero = {
    id: lastHero + 1,
    name: req.body.name
  }

  publicHeroes.push(hero);

  res.json(hero);
});

// Update a public hero
app.put(`${publicEndpoint}/heroes/:id`, (req, res) => {
  let hero = publicHeroes.find(hero => hero.id == req.params.id);
  hero.name = req.body.name;
  res.sendStatus(204);
});

// Delete a public hero
app.delete(`${publicEndpoint}/heroes/:id`, (req, res) => {
  const hero = publicHeroes.find(hero => hero.id == req.params.id);
  if(!hero) {
    return res.sendStatus(404);
  }
  const index = publicHeroes.indexOf(hero);
  publicHeroes.splice(index, 1);
  res.sendStatus(204);
});

// ===== Private Routes =====

// Get all secret heroes
app.get(`${secretEndpoint}/heroes`, authCheck, (req, res) => {
  res.json(secretHeroes);
});

// Get an individual secret hero
app.get(`${secretEndpoint}/heroes/:id`, authCheck, (req, res) => {
  const hero = secretHeroes.find(hero => hero.id == req.params.id);

  if (!hero) {
    return res.sendStatus(404);
  }

  res.json(hero);
});

// Save a new secret hero
app.post(`${secretEndpoint}/heroes`, authCheck, (req, res) => {
  let lastHero = 0;
  if (secretHeroes[secretHeroes.length - 1]) {
    lastHero = secretHeroes[secretHeroes.length - 1].id;
  }
  const hero = {
    id: lastHero + 1,
    name: req.body.name
  }

  secretHeroes.push(hero);

  res.json(hero);
});

// Update a secret hero
app.put(`${secretEndpoint}/heroes/:id`, authCheck, (req, res) => {
  let hero = secretHeroes.find(hero => hero.id == req.params.id);
  hero.name = req.body.name;
  res.sendStatus(204);
});

// Delete a secret hero
app.delete(`${secretEndpoint}/heroes/:id`, authCheck, (req, res) => {
  const hero = secretHeroes.find(hero => hero.id == req.params.id);
  if(!hero) {
    return res.sendStatus(404);
  }
  const index = secretHeroes.indexOf(hero);
  secretHeroes.splice(index, 1);
  res.sendStatus(204);
});

app.listen(3002);
console.log('Listening on localhost:3002');
