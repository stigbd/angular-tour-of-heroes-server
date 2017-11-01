'use strict';

const express = require('express');
const app = express();
const jwt = require('express-jwt');
const cors = require('cors');
const bodyParser = require('body-parser');

let publicHeroes = require('./heroes').publicHeroes;
let secretHeroes = require('./heroes').secretHeroes;

const publicEndpoint = '/api/public';
const secretEndpoint = '/api/secret';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const authCheck = jwt({
  secret: new Buffer('AUTH0_SECRET', 'base64'),
  audience: 'AUTH0_CLIENT_ID'
});


// ===== Public Routes =====

// Get all public heroes
app.get(`${publicEndpoint}/heroes`, (req, res) => {
  res.json(publicHeroes);
});

// Get an individual public hero
app.get(`${publicEndpoint}/heroes/:id`, (req, res) => {
  const hero = publicHeroes.find(hero => hero.id == req.params.id);
  if (!hero) {
    res.json({ message: 'No hero found!' });
  }
  res.json(hero);
});

// Save a new secret hero
app.post(`${publicEndpoint}/heroes`, (req, res) => {
  const lastHero = publicHeroes[publicHeroes.length - 1].id;

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
  res.json({ message: 'Hero saved!' });
});

// Delete a public hero
app.delete(`${publicEndpoint}/heroes/:id`, (req, res) => {
  const hero = publicHeroes.find(hero => hero.id == req.params.id);
  const index = publicHeroes.indexOf(hero);
  publicHeroes.splice(index, 1);
  res.json({ message: 'Hero deleted' });
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
    res.json({ message: 'No hero found!' });
  }

  res.json(hero);
});

// Save a new secret hero
app.post(`${secretEndpoint}/heroes`, authCheck, (req, res) => {
  const lastHero = secretHeroes[secretHeroes.length - 1].id;

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
  res.json({ message: 'Hero saved!' });
});

// Delete a secret hero
app.delete(`${secretEndpoint}/heroes/:id`, authCheck, (req, res) => {
  const hero = secretHeroes.find(hero => hero.id == req.params.id);
  const index = secretHeroes.indexOf(hero);
  secretHeroes.splice(index, 1);
  res.json({ message: 'Hero deleted' });
});

app.listen(3001);
console.log('Listening on localhost:3001');
