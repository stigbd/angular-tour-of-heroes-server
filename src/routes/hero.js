var express = require('express')
var heroController = require('../controllers/heroController')
const publicEndpoint = '/api/public'

var router = express.Router()

router.route(`${publicEndpoint}/heroes`).get(heroController.getHeroes)
router.route(`${publicEndpoint}/heroes/:id`).get(heroController.getHeroById)
router.route(`${publicEndpoint}/heroes`).post(heroController.saveHero)
router.route(`${publicEndpoint}/heroes/:id`).put(heroController.updateHero)
router.route(`${publicEndpoint}/heroes/:id`).delete(heroController.deleteHero)

module.exports = router
