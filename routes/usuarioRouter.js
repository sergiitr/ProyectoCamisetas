const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Ruta base para el listado (list.pug)
router.get('/list',usuarioController.usuarioListado)

// Rutas de CRUD (fijas)

//Editar
router.get('/edit/:id', usuarioController.usuarioEditarForm)
router.post('/edit/:id', usuarioController.usuarioEditar)

//borrar
router.get('/del/:id', usuarioController.usuarioDeleteForm)
router.post('/del/:id', usuarioController.usuarioDelete)

module.exports = router;