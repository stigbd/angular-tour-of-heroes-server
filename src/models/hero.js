'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
mongoose.Promise = global.Promise

module.exports = mongoose.model('Hero', new Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String
  }
}))
