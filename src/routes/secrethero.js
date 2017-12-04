var express = require('express')
var secretHeroController = require('../controllers/secretHeroController')
const secretEndpoint = '/api/secret'

var router = express.Router()

router.route(`${secretEndpoint}/secretheroes`).get(secretHeroController.getSecretHeroes)
router.route(`${secretEndpoint}/secretheroes/:id`).get(secretHeroController.getSecretHeroById)
router.route(`${secretEndpoint}/secretheroes`).post(secretHeroController.saveSecretHero)
router.route(`${secretEndpoint}/secretheroes/:id`).put(secretHeroController.updateSecretHero)
router.route(`${secretEndpoint}/secretheroes/:id`).delete(secretHeroController.deleteSecretHero)

module.exports = router
