const db = require('../db');

// --------------------------------------------------------
// Inicializar carrito en sesión
// --------------------------------------------------------
function initcarrito(req) {
    if (!req.session.carrito) {
        req.session.carrito = {
            total: 0.00,
            lineasPedido: []
        };
    }
    return req.session.carrito;
}

// --------------------------------------------------------
// Recalcular total del carrito
// --------------------------------------------------------
function updatecarritoTotal(carrito) {
    carrito.total = parseFloat(
        carrito.lineasPedido.reduce((acc, linea) => acc + (linea.cantidad * linea.precio_venta), 0).toFixed(2)
    );
}

// --------------------------------------------------------
// Comprobar si está logueado
// --------------------------------------------------------
exports.isClient = (req, res, next) => {
    if (!req.session.usuario) return res.redirect('/auth/login');
    next();
};

// --------------------------------------------------------
// LIST — Mostrar carrito
// --------------------------------------------------------
exports.list = async (req, res) => {
    const carrito = initcarrito(req);

    if (carrito.lineasPedido.length === 0) {
        return res.render('carrito/list', { pedido: carrito, lineasPedido: [] });
    }

    const lineasCompletas = await Promise.all(
        carrito.lineasPedido.map(async (linea) => {
            const query = 'SELECT talla, color, marca FROM camiseta WHERE id = ?';
            return new Promise(resolve => {
                db.query(query, [linea.id_producto], (error, resultado) => {
                    const detalles = resultado?.[0] || {
                        talla: 'N/A',
                        color: 'N/A',
                        marca: 'Producto eliminado'
                    };
                    resolve({ ...linea, camiseta: { ...detalles, id: linea.id_producto } });
                });
            });
        })
    );

    res.render('carrito/list', { pedido: carrito, lineasPedido: lineasCompletas });
};

// --------------------------------------------------------
// ADD FORM — Añadir producto (GET)
// --------------------------------------------------------
exports.addForm = (req, res) => {
    const id = parseInt(req.params.id);
    const carrito = initcarrito(req);

    const yaExiste = carrito.lineasPedido.find(lp => lp.id_producto === id);
    if (yaExiste) return res.redirect(`/carrito/edit/camiseta/${id}`);

    const query = `SELECT id, talla, sexo, color, marca, stock, precio 
                   FROM camiseta WHERE id = ? AND activo = 1`;

    db.query(query, [id], (error, resultado) => {
        if (error || resultado.length === 0) return res.redirect('/camisetas');
        res.render('carrito/add', { camiseta: resultado[0] });
    });
};

// --------------------------------------------------------
// ADD (POST) — Insertar/Actualizar línea del carrito
// --------------------------------------------------------
exports.add = (req, res) => {
    const id = parseInt(req.params.id);
    const cantidad = parseInt(req.body.cantidad);
    const carrito = initcarrito(req);

    if (!cantidad || cantidad < 1) return res.redirect('/carrito/list');

    const query = `SELECT precio, stock, talla, color, marca 
                   FROM camiseta WHERE id = ? AND activo = 1`;

    db.query(query, [id], (error, resultado) => {
        if (error || resultado.length === 0) return res.redirect('/carrito/list');

        const { precio, stock, talla, color, marca } = resultado[0];
        if (cantidad > stock) return res.redirect(`/carrito/edit/camiseta/${id}`);

        const idx = carrito.lineasPedido.findIndex(lp => lp.id_producto === id);
        if (idx !== -1) {
            carrito.lineasPedido[idx].cantidad = cantidad;
        } else {
            carrito.lineasPedido.push({
                id_producto: id,
                cantidad,
                precio_venta: precio,
                camiseta: { id, talla, color, marca, precio }
            });
        }

        updatecarritoTotal(carrito);
        res.redirect('/carrito/list');
    });
};

// --------------------------------------------------------
// EDIT FORM — Formulario editar cantidad (GET)
// --------------------------------------------------------
exports.editForm = (req, res) => {
    const id = parseInt(req.params.id);
    const carrito = initcarrito(req);

    const linea = carrito.lineasPedido.find(lp => lp.id_producto === id);
    if (!linea) return res.redirect(`/carrito/add/camiseta/${id}`);

    const query = `SELECT id, talla, sexo, color, marca, stock, precio 
                   FROM camiseta WHERE id = ? AND activo = 1`;

    db.query(query, [id], (error, resultado) => {
        if (error || resultado.length === 0) return res.redirect('/carrito/list');

        res.render('carrito/edit', {
            camiseta: resultado[0],
            cantidadActual: linea.cantidad
        });
    });
};

// --------------------------------------------------------
// EDIT (POST) — Actualizar cantidad del carrito
// --------------------------------------------------------
exports.edit = (req, res) => {
    const id = parseInt(req.params.id);
    const cantidad = parseInt(req.body.cantidad);
    const carrito = initcarrito(req);

    const idx = carrito.lineasPedido.findIndex(lp => lp.id_producto === id);
    if (idx === -1 || !cantidad || cantidad < 1) return res.redirect('/carrito/list');

    // Actualizar cantidad
    carrito.lineasPedido[idx].cantidad = cantidad;
    updatecarritoTotal(carrito);
    res.redirect('/carrito/list');
};

// --------------------------------------------------------
// DEL FORM — Confirmación de borrado (GET)
// --------------------------------------------------------
exports.delForm = (req, res) => {
    const id = parseInt(req.params.id);
    const carrito = initcarrito(req);

    const linea = carrito.lineasPedido.find(lp => lp.id_producto === id);
    if (!linea) return res.redirect('/carrito/list');

    const query = 'SELECT talla, color, marca FROM camiseta WHERE id = ?';

    db.query(query, [id], (error, resultado) => {
        const camiseta = resultado?.[0] || {
            id,
            talla: 'N/A',
            color: 'N/A',
            marca: 'Producto eliminado'
        };

        res.render('carrito/del', {
            camiseta,
            cantidadActual: linea.cantidad,
            precioVenta: linea.precio_venta
        });
    });
};

// --------------------------------------------------------
// DEL (POST) — Eliminar línea del carrito
// --------------------------------------------------------
exports.del = (req, res) => {
    const id = parseInt(req.params.id);
    const carrito = initcarrito(req);

    carrito.lineasPedido = carrito.lineasPedido.filter(lp => lp.id_producto !== id);
    updatecarritoTotal(carrito);
    res.redirect('/carrito/list');
};
