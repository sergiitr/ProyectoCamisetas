const express = require('express');
const router = express.Router();
const db = require('../db');

// Añadir al carrito
router.get('/add/:id', (req, res) => {
    const id = req.params.id;

    db.query('SELECT * FROM camiseta WHERE id = ?', [id], (err, resultado) => {
        if (err || resultado.length === 0) {
            return res.render('error', { mensaje: 'Camiseta no encontrada' });
        }

        const camiseta = resultado[0];
//quitar luego

        // Buscar si ya existe en el carrito
        let item = req.session.carrito.find(p => p.id == id);

        if (item) {
            item.cantidad++;
        } else {
            req.session.carrito.push({
                id: camiseta.id,
                nombre: camiseta.nombre,
                precio: camiseta.precio,
                cantidad: 1
            });
        }

        res.redirect('/carrito/ver');
    });
});

// Ver carrito
router.get('/ver', (req, res) => {
    res.render('carrito/ver', { carrito: req.session.carrito });
});

// Vaciar carrito
router.get('/vaciar', (req, res) => {
    req.session.carrito = [];
    res.redirect('/carrito/ver');
});

module.exports = router;
