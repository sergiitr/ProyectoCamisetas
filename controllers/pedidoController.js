// controllers/pedidoController.js
const db = require('../db');

module.exports = {

    checkout: (req, res) => {
        if (!req.session.usuario) return res.redirect('/auth/login');

        const carrito = req.session.carrito || { lineasPedido: [], total: 0 };

        res.render('pedido/checkout', {
            total: carrito.total,
            lineas: carrito.lineasPedido
        });
    },


    confirmar: (req, res) => {
        if (!req.session.usuario) return res.redirect('/auth/login');

        const carrito = req.session.carrito;

        if (!carrito || !carrito.lineasPedido || carrito.lineasPedido.length === 0)
            return res.render("error", { mensaje: "El carrito está vacío" });

        const cliente = req.session.usuario.id;
        const total = carrito.total;

        // Crear pedido
        const qPedido = `
            INSERT INTO pedido (cliente, total, estado)
            VALUES (?, ?, 'procesando')
        `;

        db.query(qPedido, [cliente, total], (err, resultado) => {
            if (err) return res.render("error", { mensaje: err.message });

            const pedidoId = resultado.insertId;

            // Convertir tus lineasPedido al formato para la tabla
            const lineas = carrito.lineasPedido.map(item => [
                pedidoId,
                item.id_producto,
                item.precio_venta,
                item.cantidad
            ]);

            const qLineas = `
                INSERT INTO linea_pedido (pedido, producto, precio_venta, cantidad)
                VALUES ?
            `;

            db.query(qLineas, [lineas], (err2) => {
                if (err2) return res.render("error", { mensaje: err2.message });

                // Restar stock
                lineas.forEach(l => {
                    db.query(
                        "UPDATE camiseta SET stock = stock - ? WHERE id = ?",
                        [l[3], l[1]]
                    );
                });

                // Vaciar carrito
                req.session.carrito = { lineasPedido: [], total: 0 };

                res.redirect(`/pedido/${pedidoId}`);
            });
        });
    },


    list: (req, res) => {
        const cliente = req.session.usuario.id;

        const q = `
            SELECT id, fecha, estado, total
            FROM pedido
            WHERE cliente = ?
            ORDER BY fecha DESC
        `;

        db.query(q, [cliente], (err, pedidos) => {
            if (err) return res.render("error", { mensaje: err.message });

            res.render("pedido/list", { pedidos });
        });
    },


    detalle: (req, res) => {
        const id = req.params.id;

        const qPedido = "SELECT * FROM pedido WHERE id = ?";
        const qLineas = `
            SELECT lp.*, c.marca, c.color, c.talla
            FROM linea_pedido lp
            JOIN camiseta c ON lp.producto = c.id
            WHERE lp.pedido = ?
        `;

        db.query(qPedido, [id], (err, pedido) => {
            if (err || !pedido.length) 
                return res.render("error", { mensaje: "Pedido no encontrado" });

            db.query(qLineas, [id], (err2, lineas) => {
                if (err2) return res.render("error", { mensaje: err2.message });

                res.render("pedido/detalle", {
                    pedido: pedido[0],
                    lineas
                });
            });
        });
    }

};
