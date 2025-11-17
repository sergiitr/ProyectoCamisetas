
const express = require('express')
const router = express.Router()
const camisetaController = require('../controllers/camisetaController')


router.get('/', camisetaController.camisetas)

router.get('/add', camisetaController.camisetaAddForm)
router.post('/add', camisetaController.camisetaAdd)
router.get('/edit/:id', camisetaController.camisetaUpdateForm)
router.post('/edit/:id', camisetaController.camisetaUpdate)
router.get('/del/:id', camisetaController.camisetaDeleteForm)
router.post('/del/:id', camisetaController.camisetaDelete)

// ESTA RUTA ES EMBIGUA CON LA DE ANTES, POR ESO VA DESPUÉS
router.get('/:id', camisetaController.camiseta)



module.exports = router;