'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
mongoose.Promise = global.Promise

module.exports = mongoose.model('SecretHero', new Schema({
  name: {
    type: String,
    index: true,
    unique: true
  },
  codeName: {
    type: String
  }
}))
