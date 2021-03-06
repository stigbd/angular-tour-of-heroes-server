var SecretHero = require('../models/secrethero')

module.exports = {

/*
{$or:[{firstName:{$regex: req.body.customerName, $options: 'i'}},{lastName:{$regex: req.body.customerName, $options: 'i'}}]}
*/
  getSecretHeroes: function (req, res) {
    var secretHeroArray = []
    SecretHero.find({$or: [{name: new RegExp(req.query.name, 'm')}, {codeName: new RegExp(req.query.name, 'm')}]}, function (err, secretHeroes) {
      if (err) {
        return res.sendStatus(500)
      }
      secretHeroes.forEach(function (secretHero) {
        var payload = {
          id: secretHero.id,
          name: secretHero.name,
          codeName: secretHero.codeName
        }
        secretHeroArray.push(payload)
      })
      res.send(secretHeroArray)
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
      name: req.body.name,
      codeName: req.body.codeName
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
      var payload = {
        id: secretHero.id,
        name: secretHero.name
      }
      res.send(payload)
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
      secretHero.codeName = req.body.codeName || secretHero.codeName
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
