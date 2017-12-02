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
  describe('POST /hero', () => {
    it('should return status code 204 and a location header')
  })
})
