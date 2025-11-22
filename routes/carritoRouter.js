const express = require('express');
const router = express.Router();
const db = require('../db'); 


function initcarrito(req) {
    if (!req.session.carrito) {
        req.session.carrito = {
            total: 0.00,
            lineasPedido: []
        };
    }
    return req.session.carrito;
}

// Actualiza el total del carrito
function updatecarritoTotal(carrito) {
    carrito.total = parseFloat(carrito.lineasPedido.reduce((acc, linea) => {
        return acc + (linea.cantidad * linea.precio_venta);
    }, 0.00).toFixed(2));
}

// Middleware para asegurar que el usuario está logeado
function isClient(req, res, next) {
    if (!req.session.usuario)
        return res.redirect('/auth/login');
    
    next();
}


// --------------------------------------------------------------------------
// --- RUTAS DEL carrito (CRUD) ---
// --------------------------------------------------------------------------

// CRUD: LIST - Muestra el contenido del carrito
// GET: /carrito/list
router.get('/list', isClient, async (req, res) => {
    const carrito = initcarrito(req);
    const productoIds = carrito.lineasPedido.map(lp => lp.id_producto);
    
    if (productoIds.length === 0)
        return res.render('carrito/list', { pedido: carrito, lineasPedido: [] });
    

    const lineasCompletas = await Promise.all(carrito.lineasPedido.map(async (linea) => {
        const query = 'SELECT talla, color, marca FROM camiseta WHERE id = ?';
        return new Promise((resolve) => {
             db.query(query, [linea.id_producto], (error, resultado) => {
                const camisetaDetalles = resultado && resultado.length > 0 ? resultado[0] : { talla: 'N/A', color: 'N/A', marca: 'Producto Eliminado' };
                resolve({ 
                    ...linea, 
                    camiseta: { ...camisetaDetalles, id: linea.id_producto } 
                });
             });
        });
    }));

    res.render('carrito/list', {
        pedido: carrito,
        lineasPedido: lineasCompletas
    });
});


// CRUD: ADD - Muestra el formulario para añadir un producto (desde el catálogo)
// GET: /carrito/add/camiseta/:id
router.get('/add/camiseta/:id', isClient, (req, res) => {
    const camisetaId = parseInt(req.params.id);
    const carrito = initcarrito(req);
    const lineaExistente = carrito.lineasPedido.find(lp => lp.id_producto === camisetaId);

    if (lineaExistente)
        return res.redirect(`/carrito/edit/camiseta/${camisetaId}`); // Si la camiseta ya está en el carrito, volvemos a la vista de edición.

    const query = 'SELECT id, talla, sexo, color, marca, stock, precio FROM camiseta WHERE id = ? AND activo = 1';
    db.query(query, [camisetaId], (error, resultado) => {
        if (error || resultado.length === 0) {
            console.error(error || `Camiseta ID ${camisetaId} no encontrada o inactiva.`);
            return res.redirect('/camisetas'); 
        }

        res.render('carrito/add', { camiseta: resultado[0] });
    });
});


// CRUD: EDIT - Muestra el formulario para editar la cantidad (desde el listado del carrito)
// GET: /carrito/edit/camiseta/:id
router.get('/edit/camiseta/:id', isClient, (req, res) => {
    const camisetaId = parseInt(req.params.id);
    const carrito = initcarrito(req);
    const linea = carrito.lineasPedido.find(lp => lp.id_producto === camisetaId);

    if (!linea)
        return res.redirect(`/carrito/add/camiseta/${camisetaId}`);

    const query = 'SELECT id, talla, sexo, color, marca, stock, precio FROM camiseta WHERE id = ? AND activo = 1';
    db.query(query, [camisetaId], (error, resultado) => {
        if (error || resultado.length === 0) {
            console.error(error || `Camiseta ID ${camisetaId} no encontrada o inactiva.`);
            return res.redirect('/carrito/list');
        }

        res.render('carrito/edit', {
            camiseta: resultado[0],
            cantidadActual: linea.cantidad
        });
    });
});


// CRUD: ADD/EDIT Logic - Realmente añade/modifica la cantidad en el carrito
// POST: /carrito/add/camiseta/:id
router.post('/add/camiseta/:id', isClient, (req, res) => {
    const camisetaId = parseInt(req.params.id);
    const cantidad = parseInt(req.body.cantidad);
    const carrito = initcarrito(req);

    if (!cantidad || cantidad < 1)
        return res.redirect('/carrito/list');

    const query = 'SELECT precio, stock, talla, color, marca FROM camiseta WHERE id = ? AND activo = 1';
    db.query(query, [camisetaId], (error, resultado) => {
        if (error || resultado.length === 0)
            return res.redirect('/carrito/list');
        
        const { precio, stock, talla, color, marca } = resultado[0];

        if (cantidad > stock) {
            console.warn(`Intento de añadir ${cantidad} pero solo hay ${stock}`);
            return res.redirect(`/carrito/edit/camiseta/${camisetaId}`);
        }

        const lineaIndex = carrito.lineasPedido.findIndex(lp => lp.id_producto === camisetaId);

        if (lineaIndex !== -1)
            carrito.lineasPedido[lineaIndex].cantidad = cantidad;
        else {
            carrito.lineasPedido.push({
                id_producto: camisetaId,
                cantidad: cantidad,
                precio_venta: precio, 
                camiseta: { id: camisetaId, precio: precio, talla, color, marca } 
            });
        }
        
        updatecarritoTotal(carrito);
        res.redirect('/carrito/list');
    });
});


// CRUD: DEL - Muestra el formulario de confirmación para eliminar
// GET: /carrito/del/camiseta/:id
router.get('/del/camiseta/:id', isClient, (req, res) => {
    const camisetaId = parseInt(req.params.id);
    const carrito = initcarrito(req);
    const linea = carrito.lineasPedido.find(lp => lp.id_producto === camisetaId);

    if (!linea)
        return res.redirect('/carrito/list');
    
    // Necesitamos el resto de datos de la camiseta para la vista de confirmación
    const query = 'SELECT talla, color, marca FROM camiseta WHERE id = ?';
    db.query(query, [camisetaId], (error, resultado) => {
        if (error || resultado.length === 0) {
            // Usamos datos de la línea de pedido si no encontramos en la DB
             return res.render('carrito/del', {
                camiseta: { id: camisetaId, marca: 'Desconocida', color: 'N/A', talla: 'N/A' },
                cantidadActual: linea.cantidad,
                precioVenta: linea.precio_venta
            });
        }
        
        res.render('carrito/del', {
            camiseta: { ...resultado[0], id: camisetaId },
            cantidadActual: linea.cantidad,
            precioVenta: linea.precio_venta
        });
    });
});

// CRUD: DELETE Logic - Realmente elimina la línea de pedido del carrito
// POST: /carrito/del/camiseta/:id
router.post('/del/camiseta/:id', isClient, (req, res) => {
    const camisetaId = parseInt(req.params.id);
    const carrito = initcarrito(req);
    
    carrito.lineasPedido = carrito.lineasPedido.filter(lp => lp.id_producto !== camisetaId);

    updatecarritoTotal(carrito);
    res.redirect('/carrito/list'); 
});


module.exports = router;
