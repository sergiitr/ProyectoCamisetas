const express = require('express')
const router = express.Router()
const camisetaController = require('../controllers/camisetaController')

// Ruta base usuario
router.get('/', camisetaController.camisetas)

// Ruta administrador
router.get('/Ges', camisetaController.camisetas)

// Rutas de CRUD 
router.get('/add', camisetaController.camisetaAddForm)
router.post('/add', camisetaController.camisetaAdd)

router.get('/edit/:id', camisetaController.camisetaUpdateForm)
router.post('/edit/:id', camisetaController.camisetaUpdate)

router.get('/del/:id', camisetaController.camisetaDeleteForm)
router.post('/del/:id', camisetaController.camisetaDelete)

// RUTA PARA OBTENER UNA SOLA CAMISETA (DEBE IR LA ÚLTIMA)
router.get('/:id', camisetaController.camiseta)

module.exports = router;
