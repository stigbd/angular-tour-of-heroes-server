let Hero = require('../models/hero')
let publicHeroes = require('../data/heroes').publicHeroes

module.exports = {
  loadHeroes: function () {
    console.log('Loading default heroes')
    for (var hero of publicHeroes) {
      console.log(hero)
      var newHero = new Hero(hero)

      // ---- save logic start
      newHero
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
