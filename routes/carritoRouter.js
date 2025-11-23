const express = require('express');
const router = express.Router();
const carrito = require('../controllers/carritoController');

// Redirige /carrito → /carrito/list
router.get('/', carrito.isClient, (req, res) => res.redirect('/carrito/list'));

// Listado
router.get('/list', carrito.isClient, carrito.list);

// Añadir
router.get('/add/camiseta/:id', carrito.isClient, carrito.addForm);
router.post('/add/camiseta/:id', carrito.isClient, carrito.add);

// Editar cantidad
router.get('/edit/camiseta/:id', carrito.isClient, carrito.editForm);
router.post('/edit/camiseta/:id', carrito.isClient, carrito.edit);

// Eliminar
router.get('/del/camiseta/:id', carrito.isClient, carrito.delForm);
router.post('/del/camiseta/:id', carrito.isClient, carrito.del);

module.exports = router;
