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
        name: 'First Hero'
      })
      let hero2 = new Hero({
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
      Hero.findByIdAndRemove(heroId1, function (err) {
        if (err) {
          console.error(err)
          throw err
        }
      })
      Hero.findByIdAndRemove(heroId2, function (err) {
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
          res.body.should.be.an('array')
          res.body.length.should.equal(2)
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
          res.body.should.be.an('array')
          res.body.length.should.equal(1)
        })
        .catch(err => {
          console.error(err)
          throw err // Re-throw the error if the test should fail when an error happens
        })
    })
  })

  describe('POST /api/public/heroes', () => {
    let heroId
    after(function (done) {
      Hero.findByIdAndRemove(heroId, function (err) {
        if (err) {
          console.error(err)
        }
        done()
      })
    })

    let hero = new Hero({
      name: 'New Hero'
    })
    it('should return status code 200 and the new hero', () => {
      return chai.request(url)
        .post('/api/public/heroes')
        .send(hero)
        .then(res => {
          res.should.have.status(200)
          res.should.be.json()
          res.body.should.have.property('id')
          heroId = res.body.id
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
      Hero.findByIdAndRemove(heroId, function (err) {
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
      var id = require('mongoose').Types.ObjectId()
      return chai.request(url)
        .get('/api/public/heroes/' + id)
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
    let heroId
    let hero = new Hero({
      name: 'Update This Hero'
    })

    before(function (done) {
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
      Hero.findByIdAndRemove(heroId, function (err) {
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
      var id = require('mongoose').Types.ObjectId()
      return chai.request(url)
        .put('/api/public/heroes/' + id)
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
    let heroId
    before(function (done) {
      let hero = new Hero({
        name: 'Delete This Hero'
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
      var id = require('mongoose').Types.ObjectId()
      return chai.request(url)
        .delete('/api/public/heroes/' + id)
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
