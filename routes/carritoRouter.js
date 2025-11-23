const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');

// Middleware de sesión
router.use(carritoController.isClient);

// LIST
router.get('/list', carritoController.list);

// ADD
router.get('/add/camiseta/:id', carritoController.addForm);
router.post('/add/camiseta/:id', carritoController.add);

// EDIT
router.get('/edit/camiseta/:id', carritoController.editForm);
router.post('/edit/camiseta/:id', carritoController.edit);

// DELETE
router.get('/del/camiseta/:id', carritoController.delForm);
router.post('/del/camiseta/:id', carritoController.del);

module.exports = router;
