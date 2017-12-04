var Hero = require('../models/hero')

module.exports = {

  getHeroes: function (req, res) {
    var heroMap = {}
    Hero.find({name: new RegExp(req.query.name, 'm')}, function (err, heroes) {
      if (err) {
        return res.sendStatus(500)
      }
      heroes.forEach(function (hero) {
        var payload = {
          name: hero.name
        }
        heroMap[hero._id] = payload
      })
      res.send(heroMap)
    })
  },

  getHeroById: function (req, res) {
    var id = req.params.id
    Hero.findById(id, function (err, hero) {
      if (err) {
        console.error(err)
        return res.sendStatus(500)
      }
      if (!hero) {
        return res.sendStatus(404)
      }
      var payload = {
        id: hero.id,
        name: hero.name
      }
      res.send(payload)
    })
  },

  saveHero: function (req, res) {
    let hero = new Hero({
      name: req.body.name
    })
    hero.save(function (err) {
      if (err && err.name === 'MongoError' && err.message.includes('E11000')) {
        err.name = 'DuplicationError'
        err.message = 'Hero already exists'
        return res.status(400).json({errorName: err.name, errorMessage: err.message})
      }
      if (err && err.name === 'ValidationError') {
        return res.status(400).json({errorName: err.name, errorMessage: err.message})
      }
      if (err) {
        console.log(err)
        return res.status(500).json({error: true})
      }
      res.status(201).location('/heroes/' + hero.id).send()
    })
  },

  updateHero: function (req, res) {
    var id = req.params.id
    Hero.findById(id, function (err, hero) {
      if (err) {
        console.error(err)
        return res.sendStatus(500)
      }
      if (!hero) {
        return res.sendStatus(404)
      }
      hero.name = req.body.name || hero.name
      hero.save(function (err) {
        if (err) {
          console.error(err)
          return res.sendStatus(500)
        }
      })
      res.sendStatus(204)
    })
  },

  deleteHero: function (req, res) {
    var id = req.params.id
    Hero.findByIdAndRemove(id, function (err, hero) {
      if (err) {
        return res.sendStatus(500)
      }
      if (!hero) {
        return res.sendStatus(404)
      }
      res.sendStatus(204)
    })
  }
}
