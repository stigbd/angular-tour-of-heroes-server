'use strict'

let mongoose = require('mongoose')
let SecretHero = require('../src/models/secrethero')
var chai = require('chai')
var chaiHttp = require('chai-http')
var jwt = require('jsonwebtoken')

let should = chai.should()
require('dotenv').config()
chai.use(chaiHttp)
var dirtyChai = require('dirty-chai')
chai.use(dirtyChai)

let url = process.env.SCHEME + '://' + process.env.HOST + ':' + process.env.PORT
let token

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
  console.log('process.env.SECRET', process.env.SECRET)
  var userPayload = {
    name: 'user.name',
    email: 'user.email',
    admin: 'user.admin'
  }

  token = jwt.sign({userPayload}, process.env.SECRET)
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

describe('/secrethero', () => {
  describe('GET /secrethero', () => {
    let secretHeroId1, secretHeroId2
    before(function (done) {
      let secretHero1 = new SecretHero({
        name: 'First SecretHero'
      })
      let secretHero2 = new SecretHero({
        name: 'Second SecretHero'
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
      SecretHero.findByIdAndRemove(secretHeroId1, function (err) {
        if (err) {
          console.error(err)
          throw err
        }
      })
      SecretHero.findByIdAndRemove(secretHeroId2, function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        done()
      })
    })

    it('should return status code 200 and a list of secretHeroes when GET /secrethero', () => {
      return chai.request(url)
        .get('/api/secret/secretheroes')
        .set('Authorization', 'Bearer ' + token)
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
    it('should return status code 200 and a list of secretHeroes when GET /secrethero with query parameter', () => {
      return chai.request(url)
        .get('/api/secret/secretheroes?name=First')
        .set('Authorization', 'Bearer ' + token)
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

  describe('POST /api/secret/secretheroes', () => {
    let secretHeroId
    after(function (done) {
      SecretHero.findByIdAndRemove(secretHeroId, function (err) {
        if (err) {
          console.error(err)
        }
        done()
      })
    })

    let secretHero = new SecretHero({
      name: 'New SecretHero'
    })
    it('should return status code 201 and a location header', () => {
      return chai.request(url)
        .post('/api/secret/secretheroes')
        .set('Authorization', 'Bearer ' + token)
        .send(secretHero)
        .then(res => {
          res.should.have.status(201)
          res.should.have.header('Location')
          let locationArray = res.header.location.split('/')
          secretHeroId = locationArray[locationArray.length - 1]
        })
        .catch(err => {
          // console.error(err)
          throw err // Re-throw the error if the test should fail when an error happens
        })
    })
    it('should return status code 400 when secretHero already exist', () => {
      return chai.request(url)
        .post('/api/secret/secretheroes')
        .set('Authorization', 'Bearer ' + token)
        .send(secretHero)
        .then(res => {
          res.should.have.status(400)
          res.should.be.json()
          res.body.should.have.property('errorName')
          res.body.errorName.should.equal('DuplicationError')
          res.body.should.have.property('errorMessage')
          res.body.errorMessage.should.include('SecretHero already exists')
        })
        .catch(err => {
          // console.error(err)
          throw err // Re-throw the error if the test should fail when an error happens
        })
    })
  })
  describe('GET /secrethero/:id', () => {
    let secretHeroId
    before(function (done) {
      let secretHero = new SecretHero({
        name: 'First SecretHero'
      })

      secretHero.save(function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        secretHeroId = secretHero.id
        done()
      })
    })

    after(function (done) {
      SecretHero.findByIdAndRemove(secretHeroId, function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        done()
      })
    })
    it('should return status code 200 and a secretHero as json when secretHero exist', () => {
      return chai.request(url)
        .get('/api/secret/secretheroes/' + secretHeroId)
        .set('Authorization', 'Bearer ' + token)
        .then(res => {
          res.should.have.status(200)
          res.should.be.json()
        })
        .catch(err => {
          // console.error(err);
          throw err // Re-throw the error if the test should fail when an error happens
        })
    })
    it('should return status code 404 when secretHero is not found', () => {
      var id = require('mongoose').Types.ObjectId()
      return chai.request(url)
        .get('/api/secret/secretheroes/' + id)
        .set('Authorization', 'Bearer ' + token)
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
  describe('PUT /secrethero/:id', () => {
    let secretHeroId
    let secretHero = new SecretHero({
      name: 'Update This SecretHero'
    })

    before(function (done) {
      secretHero.save(function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        secretHeroId = secretHero.id
        done()
      })
    })
    after(function (done) {
      SecretHero.findByIdAndRemove(secretHeroId, function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        done()
      })
    })
    it('should return status code 204 and the updated secretHero as json', () => {
      return chai.request(url)
        .put('/api/secret/secretheroes/' + secretHeroId)
        .set('Authorization', 'Bearer ' + token)
        .send(secretHero)
        .then(res => {
          res.should.have.status(204)
          res.should.not.be.json()
        })
        .catch(err => {
          throw err // Re-throw the error if the test should fail when an error happens
        })
    })
    it('should return status code 404 when secretHero is not found', () => {
      var id = require('mongoose').Types.ObjectId()
      return chai.request(url)
        .put('/api/secret/secretheroes/' + id)
        .set('Authorization', 'Bearer ' + token)
        .send(secretHero)
        .then(res => {
          res.should.have.status(404)
          res.should.not.be.json()
        })
        .catch(err => {
          throw err // Re-throw the error if the test should fail when an error happens
        })
    })
  })
  describe('DELETE /secrethero/:id', () => {
    let secretHeroId
    before(function (done) {
      let secretHero = new SecretHero({
        name: 'Delete This SecretHero'
      })

      secretHero.save(function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        secretHeroId = secretHero.id
        done()
      })
    })
    after(function (done) {
      SecretHero.findByIdAndRemove(secretHeroId, function (err) {
        if (err) {
          console.error(err)
          throw err
        }
        done()
      })
    })
    it('should return status code 204 when secretHero exists', () => {
      return chai.request(url)
        .delete('/api/secret/secretheroes/' + secretHeroId)
        .set('Authorization', 'Bearer ' + token)
        .then(res => {
          res.should.have.status(204)
          res.should.not.be.json()
        })
        .catch(err => {
          // console.error(err);
          throw err // Re-throw the error if the test should fail when an error happens
        })
    })
    it('should return status code 404 when secretHero is not found', () => {
      var id = require('mongoose').Types.ObjectId()
      return chai.request(url)
        .delete('/api/secret/secretheroes/' + id)
        .set('Authorization', 'Bearer ' + token)
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
