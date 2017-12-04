var SecretHero = require('../models/secrethero')

module.exports = {

  getSecretHeroes: function (req, res) {
    var secretHeroMap = {}
    SecretHero.find({name: new RegExp(req.query.name, 'm')}, function (err, secretHeroes) {
      if (err) {
        return res.sendStatus(500)
      }
      secretHeroes.forEach(function (secretHero) {
        var payload = {
          name: secretHero.name,
          codeName: secretHero.codeName
        }
        secretHeroMap[secretHero._id] = payload
      })
      res.send(secretHeroMap)
    })
  },
  getSecretHeroById: function (req, res) {
    var id = req.params.id
    SecretHero.findById(id, function (err, secretHero) {
      if (err) {
        console.error(err)
        return res.sendStatus(500)
      }
      if (!secretHero) {
        return res.sendStatus(404)
      }
      var payload = {
        id: secretHero.id,
        name: secretHero.name,
        codeName: secretHero.codeName
      }
      res.send(payload)
    })
  },

  saveSecretHero: function (req, res) {
    let secretHero = new SecretHero({
      name: req.body.name
    })
    secretHero.save(function (err) {
      if (err && err.name === 'MongoError' && err.message.includes('E11000')) {
        err.name = 'DuplicationError'
        err.message = 'SecretHero already exists'
        return res.status(400).json({errorName: err.name, errorMessage: err.message})
      }
      if (err && err.name === 'ValidationError') {
        return res.status(400).json({errorName: err.name, errorMessage: err.message})
      }
      if (err) {
        console.log(err)
        return res.status(500).json({error: true})
      }
      res.status(201).location('/secretHeroes/' + secretHero.id).send()
    })
  },

  updateSecretHero: function (req, res) {
    var id = req.params.id
    SecretHero.findById(id, function (err, secretHero) {
      if (err) {
        console.error(err)
        return res.sendStatus(500)
      }
      if (!secretHero) {
        return res.sendStatus(404)
      }
      secretHero.name = req.body.name || secretHero.name
      secretHero.save(function (err) {
        if (err) {
          console.error(err)
          return res.sendStatus(500)
        }
      })
      res.sendStatus(204)
    })
  },

  deleteSecretHero: function (req, res) {
    var id = req.params.id
    SecretHero.findByIdAndRemove(id, function (err, secretHero) {
      if (err) {
        return res.sendStatus(500)
      }
      if (!secretHero) {
        return res.sendStatus(404)
      }
      res.sendStatus(204)
    })
  }
}
