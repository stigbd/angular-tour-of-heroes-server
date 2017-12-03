'use strict'

let mongoose = require('mongoose')
let Hero = require('../src/models/hero')
var chai = require('chai')
var chaiHttp = require('chai-http')

let should = chai.should()
require('dotenv').config()
chai.use(chaiHttp)
var dirtyChai = require('dirty-chai')
chai.use(dirtyChai)

let url = process.env.SCHEME + '://' + process.env.HOST + ':' + process.env.PORT

let promiseLib = global.Promise
let uri = 'mongodb://' +
process.env.DBHOST +
':' +
process.env.DBPORT +
'/' +
process.env.TEST_DATABASE

var options = {
  useMongoClient: true,
  promiseLibrary: promiseLib
}

before(function (done) {
  mongoose.connect(uri, options)
    .then(() => {
      console.log('Connected to the following db: ' + uri)
    })
    .catch(err => {
      console.error('Error while trying to connect with mongodb')
      throw err
    })
  console.log('Testing against server at ' + url)
  done()
})

after(function (done) {
  mongoose.connection.close(function (err) {
    if (err) {
      console.error(err)
    }
    done()
  })
})

describe('/hero', () => {
  describe('GET /hero', () => {
    let heroId1, heroId2
    before(function (done) {
      let hero1 = new Hero({
        id: 1,
        name: 'First Hero'
      })
      let hero2 = new Hero({
        id: 2,
        name: 'Second Hero'
      })

      hero1.save(function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        heroId1 = hero1.id
      })
      hero2.save(function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        heroId2 = hero2.id
        done()
      })
    })

    after(function (done) {
      Hero.remove({id: heroId1}, function (err) {
        if (err) {
          console.error(err)
          throw err
        }
      })
      Hero.remove({id: heroId2}, function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        done()
      })
    })

    it('should return status code 200 and a list of heroes when GET /hero', () => {
      return chai.request(url)
        .get('/api/public/heroes')
        .then(res => {
          res.should.have.status(200)
          res.should.be.json()
          res.body.should.be.an('object')
          Object.keys(res.body).length.should.equal(2)
        })
        .catch(err => {
          console.error(err)
          throw err // Re-throw the error if the test should fail when an error happens
        })
    })
    it('should return status code 200 and a list of heroes when GET /hero with query parameter', () => {
      return chai.request(url)
        .get('/api/public/heroes?name=First')
        .then(res => {
          res.should.have.status(200)
          res.should.be.json()
          res.body.should.be.an('object')
          Object.keys(res.body).length.should.equal(1)
        })
        .catch(err => {
          console.error(err)
          throw err // Re-throw the error if the test should fail when an error happens
        })
    })
  })
  describe('POST /api/public/heroes', () => {
    after(function (done) {
      Hero.findOneAndRemove({id: 100}, function (err) {
        if (err) {
          console.error(err)
        }
        done()
      })
    })

    let hero = new Hero({
      id: '100',
      name: 'New Hero'
    })
    it('should return status code 201 and a location header', () => {
      return chai.request(url)
        .post('/api/public/heroes')
        .send(hero)
        .then(res => {
          res.should.have.status(201)
          res.should.have.header('Location')
        })
        .catch(err => {
          // console.error(err)
          throw err // Re-throw the error if the test should fail when an error happens
        })
    })
    it('should return status code 400 when hero already exist', () => {
      return chai.request(url)
        .post('/api/public/heroes')
        .send(hero)
        .then(res => {
          res.should.have.status(400)
          res.should.be.json()
          res.body.should.have.property('errorName')
          res.body.errorName.should.equal('DuplicationError')
          res.body.should.have.property('errorMessage')
          res.body.errorMessage.should.include('Hero already exists')
        })
        .catch(err => {
          // console.error(err)
          throw err // Re-throw the error if the test should fail when an error happens
        })
    })
  })
  describe('GET /hero/:id', () => {
    let heroId
    before(function (done) {
      let hero = new Hero({
        id: 1,
        name: 'First Hero'
      })

      hero.save(function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        heroId = hero.id
        done()
      })
    })

    after(function (done) {
      Hero.remove({id: heroId}, function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        done()
      })
    })
    it('should return status code 200 and a hero as json when hero exist', () => {
      return chai.request(url)
        .get('/api/public/heroes/' + heroId)
        .then(res => {
          res.should.have.status(200)
          res.should.be.json()
        })
        .catch(err => {
          // console.error(err);
          throw err // Re-throw the error if the test should fail when an error happens
        })
    })
    it('should return status code 404 when hero is not found', () => {
      let nonExistingId = 0
      return chai.request(url)
        .get('/api/public/heroes/' + nonExistingId)
        .then(res => {
          res.should.have.status(404)
          res.should.not.be.json()
        })
        .catch(err => {
          // console.error(err);
          throw err // Re-throw the error if the test should fail when an error happens
        })
    })
  })
  describe('PUT /hero/:id', () => {
    let heroId = 2000

    let hero = new Hero({
      id: heroId,
      name: 'Update This Hero'
    })

    before(function (done) {
      hero.save(function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        done()
      })
    })
    after(function (done) {
      Hero.remove({id: heroId}, function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        done()
      })
    })
    it('should return status code 204 and the updated hero as json', () => {
      return chai.request(url)
        .put('/api/public/heroes/' + heroId)
        .send(hero)
        .then(res => {
          res.should.have.status(204)
          res.should.not.be.json()
        })
        .catch(err => {
          throw err // Re-throw the error if the test should fail when an error happens
        })
    })
    it('should return status code 404 when hero is not found', () => {
      let nonExistingId = 0
      return chai.request(url)
        .put('/api/public/heroes/' + nonExistingId)
        .send(hero)
        .then(res => {
          res.should.have.status(404)
          res.should.not.be.json()
        })
        .catch(err => {
          throw err // Re-throw the error if the test should fail when an error happens
        })
    })
  })
  describe('DELETE /hero/:id', () => {
    let heroId = 1000
    before(function (done) {
      let hero = new Hero({
        id: heroId,
        name: 'Delete This Hero'
      })

      hero.save(function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        done()
      })
    })
    it('should return status code 204 when hero exists', () => {
      return chai.request(url)
        .delete('/api/public/heroes/' + heroId)
        .then(res => {
          res.should.have.status(204)
          res.should.not.be.json()
        })
        .catch(err => {
          // console.error(err);
          throw err // Re-throw the error if the test should fail when an error happens
        })
    })
    it('should return status code 404 when hero is not found', () => {
      let nonExistingId = 0
      return chai.request(url)
        .delete('/api/public/heroes/' + nonExistingId)
        .then(res => {
          res.should.have.status(404)
          res.should.not.be.json()
        })
        .catch(err => {
          // console.error(err);
          throw err // Re-throw the error if the test should fail when an error happens
        })
    })
  })
})

describe('/secret-hero', () => {
  describe('GET /secret-hero', () => {
    it('should return status code 200 and a list of secret-heroes with a good jwt')
    it('should return status code 401 when bad jwt')
  })
  describe('POST /secret-hero', () => {
    it('should return status code 201 and a location header with a good jwt')
    it('should return status code 401 when bad jwt')
  })
  describe('GET /secret-hero/:id', () => {
    it('should return status code 200 and a secret hero as json with good jwt')
    it('should return status code 401 when bad jwt')
    it('should return status code 404 when secret-hero is not found')
  })
  describe('PUT /secret-hero/:id', () => {
    it('should return status code 200 and the updated secret-hero as json with good jwt')
    it('should return status code 401 when bad jwt')
    it('should return status code 404 when secret-hero is not found')
  })
  describe('DELETE /secret-hero/:id', () => {
    it('should return status code 204 when good jwt')
    it('should return status code 401 when bad jwt')
    it('should return status code 404 when secret-hero is not found')
  })
})
