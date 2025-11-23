const express = require('express');
const router = express.Router();
const pedido = require('../controllers/pedidoController');

// Mostrar resumen y botón final
router.get('/checkout', (req, res) => {
    res.render('pedido/checkout'); // <<--- RUTA CORRECTA
});

// Confirmación final → crea el pedido en la BD
router.post('/confirmar', pedido.confirmar);

// Listado de mis pedidos
router.get('/list', pedido.list);

// Ver un pedido concreto
router.get('/:id', pedido.detalle);

module.exports = router;
