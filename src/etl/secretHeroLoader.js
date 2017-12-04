let SecretHero = require('../models/secrethero')
let secretHeroes = require('../data/heroes').secretHeroes

module.exports = {
  loadSecretHeroes: function () {
    for (var secretHero of secretHeroes) {
      var newSecretHero = new SecretHero(secretHero)

      // ---- save logic start
      newSecretHero
        .save()
        .then(saved => console.log('saved', saved))
        .catch(err => {
          if (err.code === 11000) {
            return console.log('Object already saved')
          }
          console.error('err while saving', err)
        })
      // ---- save logic end
    }
  }
}
