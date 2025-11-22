const express = require('express');
const router = express.Router();

// Middleware para inicializar lista de pedidos
router.use((req, res, next) => {
    if (!req.session.pedidos) {
        req.session.pedidos = [];
    }
    next();
});

// Confirmar pedido
router.get('/confirmar', (req, res) => {
    const carrito = req.session.carrito;

    if (!carrito || carrito.length === 0) {
        return res.render('error', { mensaje: 'El carrito está vacío, no se puede generar pedido.' });
    }

    // Crear pedido básico
    const pedido = {
        id: req.session.pedidos.length + 1,
        fecha: new Date().toLocaleString(),
        items: carrito.map(p => ({ ...p })), // copia
        total: carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0)
    };

    // Guardar pedido en sesión
    req.session.pedidos.push(pedido);

    // Vaciar carrito
    req.session.carrito = [];

    // Mostrar confirmación
    res.render('pedido/confirmado', { pedido });
});

// Ver todos los pedidos del usuario
router.get('/mis-pedidos', (req, res) => {
    res.render('pedido/lista', { pedidos: req.session.pedidos });
});

module.exports = router;
