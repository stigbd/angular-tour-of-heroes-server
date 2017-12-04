let Hero = require('../models/hero')
let publicHeroes = require('../data/heroes').publicHeroes

module.exports = {
  loadHeroes: function () {
    for (var hero of publicHeroes) {
      var newHero = new Hero(hero)

      // ---- save logic start
      newHero
        .save()
        .then(saved => console.log('Heroes saved', saved))
        .catch(err => {
          if (err.code === 11000) {
            return true // ignore this
          }
          console.error('err while saving', err)
        })
      // ---- save logic end
    }
  }
}
