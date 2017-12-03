'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
mongoose.Promise = global.Promise

module.exports = mongoose.model('Hero', new Schema({
  name: {
    type: String,
    index: true,
    unique: true
  }
}))
