const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');

// Middleware de sesión
router.use(carritoController.isClient);

// LIST
router.get('/carrito', carritoController.list);

// ADD
router.get('/carrito/add/camiseta/:id', carritoController.addForm);
router.post('/carrito/add/camiseta/:id', carritoController.add);

// EDIT
router.get('/carrito/edit/camiseta/:id', carritoController.editForm);
router.post('/carrito/edit/camiseta/:id', carritoController.edit);

// DELETE
router.get('/carrito/del/camiseta/:id', carritoController.delForm);
router.post('/carrito/del/camiseta/:id', carritoController.del);

module.exports = router;
