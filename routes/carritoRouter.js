const express = require('express');
const router = express.Router();
const carrito = require('../controllers/carritoController');

// Listado
router.get('/list', carrito.isClient, carrito.list);

// Añadir
router.get('/add/camiseta/:id', carrito.isClient, carrito.addForm);
router.post('/add/camiseta/:id', carrito.isClient, carrito.add);

// Editar cantidad
router.get('/edit/camiseta/:id', carrito.isClient, carrito.editForm);
router.post('/edit/camiseta/:id', carrito.isClient, carrito.edit);  // ← FALTABA ESTA

// Eliminar
router.get('/del/camiseta/:id', carrito.isClient, carrito.delForm);
router.post('/del/camiseta/:id', carrito.isClient, carrito.del);

module.exports = router;
