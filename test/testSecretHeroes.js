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

describe('/secret-hero', () => {
  describe('GET /secret-hero', () => {
    let secretHeroId1, secretHeroId2
    before(function (done) {
      let secretHero1 = new Hero({
        name: 'First Hero'
      })
      let secretHero2 = new Hero({
        name: 'Second Hero'
      })

      secretHero1.save(function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        secretHeroId1 = secretHero1.id
      })
      secretHero2.save(function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        secretHeroId2 = secretHero2.id
        done()
      })
    })

    after(function (done) {
      Hero.findByIdAndRemove(secretHeroId1, function (err) {
        if (err) {
          console.error(err)
          throw err
        }
      })
      Hero.findByIdAndRemove(secretHeroId2, function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        done()
      })
    })
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
