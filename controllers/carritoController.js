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
exports.list = (req, res) => {
    const usuarioId = req.session.usuario.id;

    const query = `
        SELECT lp.id_producto, lp.cantidad, lp.precio, c.talla, c.color, c.marca
        FROM linea_pedido lp
        JOIN camiseta c ON c.id = lp.id_producto
        WHERE lp.id_usuario = ?
    `;

    db.query(query, [usuarioId], (err, lineas) => {
        if (err) return res.render('error', { mensaje: 'No se pudo cargar el carrito' });

        const total = lineas.reduce((acc, l) => acc + l.cantidad * l.precio, 0);

        // Actualizamos la sesión para reflejar los cambios
        const carrito = initcarrito(req);
        carrito.lineasPedido = lineas.map(l => ({
            id_producto: l.id_producto,
            cantidad: l.cantidad,
            precio_venta: l.precio,
            camiseta: { id: l.id_producto, talla: l.talla, color: l.color, marca: l.marca, precio: l.precio }
        }));
        carrito.total = total;

        res.render('carrito/list', { pedido: carrito, lineasPedido: carrito.lineasPedido });
    });
};

// --------------------------------------------------------
// ADD FORM — Añadir producto (GET)
// --------------------------------------------------------
exports.addForm = (req, res) => {
    const id = parseInt(req.params.id);

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
    const usuarioId = req.session.usuario.id;

    if (!cantidad || cantidad < 1) return res.redirect('/carrito/list');

    const queryCamiseta = `SELECT precio, stock, talla, color, marca 
                            FROM camiseta WHERE id = ? AND activo = 1`;

    db.query(queryCamiseta, [id], (error, resultado) => {
        if (error || resultado.length === 0) return res.redirect('/carrito/list');

        const { precio, stock, talla, color, marca } = resultado[0];
        if (cantidad > stock) return res.redirect(`/carrito/edit/camiseta/${id}`);

        const queryInsert = `
            INSERT INTO linea_pedido (id_usuario, id_producto, cantidad, precio)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)
        `;

        db.query(queryInsert, [usuarioId, id, cantidad, precio], (err) => {
            if (err) {
                console.log(err);
                return res.redirect('/carrito/list');
            }

            // Actualizamos la sesión
            const carrito = initcarrito(req);
            const idx = carrito.lineasPedido.findIndex(lp => lp.id_producto === id);
            if (idx !== -1) {
                carrito.lineasPedido[idx].cantidad += cantidad;
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
    });
};

// --------------------------------------------------------
// EDIT FORM — Formulario editar cantidad (GET)
// --------------------------------------------------------
exports.editForm = (req, res) => {
    const id = parseInt(req.params.id);
    const usuarioId = req.session.usuario.id;

    const query = `SELECT lp.cantidad, c.id AS id_producto, c.talla, c.sexo, c.color, c.marca, c.stock, c.precio
                   FROM linea_pedido lp
                   JOIN camiseta c ON c.id = lp.id_producto
                   WHERE lp.id_usuario = ? AND lp.id_producto = ?`;

    db.query(query, [usuarioId, id], (err, resultado) => {
        if (err || resultado.length === 0) return res.redirect('/carrito/list');
        const linea = resultado[0];
        res.render('carrito/edit', {
            camiseta: linea,
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
    const usuarioId = req.session.usuario.id;

    if (!cantidad || cantidad < 1) return res.redirect('/carrito/list');

    const queryUpdate = `UPDATE linea_pedido SET cantidad = ? WHERE id_usuario = ? AND id_producto = ?`;

    db.query(queryUpdate, [cantidad, usuarioId, id], (err) => {
        if (err) console.log(err);

        // Actualizar la sesión también
        const carrito = initcarrito(req);
        const idx = carrito.lineasPedido.findIndex(lp => lp.id_producto === id);
        if (idx !== -1) carrito.lineasPedido[idx].cantidad = cantidad;
        updatecarritoTotal(carrito);

        res.redirect('/carrito/list');
    });
};

// --------------------------------------------------------
// DEL FORM — Confirmación de borrado (GET)
// --------------------------------------------------------
exports.delForm = (req, res) => {
    const id = parseInt(req.params.id);
    const usuarioId = req.session.usuario.id;

    const query = `SELECT lp.cantidad, c.id AS id_producto, c.talla, c.color, c.marca
                   FROM linea_pedido lp
                   JOIN camiseta c ON c.id = lp.id_producto
                   WHERE lp.id_usuario = ? AND lp.id_producto = ?`;

    db.query(query, [usuarioId, id], (err, resultado) => {
        if (err || resultado.length === 0) return res.redirect('/carrito/list');
        const linea = resultado[0];
        res.render('carrito/del', {
            camiseta: linea,
            cantidadActual: linea.cantidad,
            precioVenta: linea.precio
        });
    });
};

// --------------------------------------------------------
// DEL (POST) — Eliminar línea del carrito
// --------------------------------------------------------
exports.del = (req, res) => {
    const id = parseInt(req.params.id);
    const usuarioId = req.session.usuario.id;

    const queryDelete = `DELETE FROM linea_pedido WHERE id_usuario = ? AND id_producto = ?`;

    db.query(queryDelete, [usuarioId, id], (err) => {
        if (err) console.log(err);

        // Actualizar sesión
        const carrito = initcarrito(req);
        carrito.lineasPedido = carrito.lineasPedido.filter(lp => lp.id_producto !== id);
        updatecarritoTotal(carrito);

        res.redirect('/carrito/list');
    });
};
