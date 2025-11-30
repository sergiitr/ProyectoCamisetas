// controllers/pedidoController.js
const db = require('../db');

// Inicializar carrito en sesión
function initcarrito(req) {
    if (!req.session.carrito) {
        req.session.carrito = {
            total: 0.00,
            lineasPedido: []
        };
    }
    return req.session.carrito;
}

module.exports = {
    checkout: async (req, res) => {
        if (!req.session.usuario)
            return res.redirect('/auth/login');
        const carrito = initcarrito(req);
        if (carrito.lineasPedido.length === 0) {
            return res.render('pedido/checkout', {
                pedido: carrito,
                lineasPedido: []
            });
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
        
        res.render('pedido/checkout', {
            pedido: carrito, 
            lineasPedido: lineasCompletas 
        });
    },


    confirmar: (req, res) => {
        if (!req.session.usuario) return res.redirect('/auth/login');

        const carrito = req.session.carrito;

        if (!carrito || !carrito.lineasPedido || carrito.lineasPedido.length === 0)
            return res.render("error", { mensaje: "El carrito está vacío" });

        const cliente = req.session.usuario.id;
        const total = carrito.total;

        const qPedido = `INSERT INTO pedido (cliente, total, estado) VALUES (?, ?, 'procesando')`;

        db.query(qPedido, [cliente, total], (err, resultado) => {
            if (err)
                return res.render("error", { mensaje: err.message });
            const pedidoId = resultado.insertId;
            // Convertir tus lineasPedido al formato para la tabla
            const lineas = carrito.lineasPedido.map(item => [
                pedidoId,
                item.id_producto,
                item.precio_venta,
                item.cantidad
            ]);

            const qLineas = ` INSERT INTO linea_pedido (pedido, producto, precio_venta, cantidad) VALUES ? `;

            db.query(qLineas, [lineas], (err2) => {
                if (err2) return res.render("error", { mensaje: err2.message });

                lineas.forEach(l => {
                    db.query(
                        "UPDATE camiseta SET stock = stock - ? WHERE id = ?",
                        [l[3], l[1]]
                    );
                });
                req.session.carrito = { lineasPedido: [], total: 0 };
                res.redirect(`/pedido/${pedidoId}`);
            });
        });
    },


    list: (req, res) => {
        const cliente = req.session.usuario.id;

        const q = `SELECT id, fecha, estado, total FROM pedido WHERE cliente = ? ORDER BY fecha DESC `;

        db.query(q, [cliente], (err, pedidos) => {
            if (err)
                return res.render("error", { mensaje: err.message });

            res.render("pedido/list", { pedidos });
        });
    },


    detalle: (req, res) => {
        const id = req.params.id;

        const qPedido = "SELECT * FROM pedido WHERE id = ?";
        const qLineas = ` SELECT lp.*, c.marca, c.color, c.talla FROM linea_pedido lp JOIN camiseta c ON lp.producto = c.id WHERE lp.pedido = ? `;

        db.query(qPedido, [id], (err, pedido) => {
            if (err || !pedido.length) 
                return res.render("error", { mensaje: "Pedido no encontrado" });

            db.query(qLineas, [id], (err2, lineas) => {
                if (err2) return res.render("error", { mensaje: err2.message });

                res.render("pedido/detalle", { pedido: pedido[0], lineas });
            });
        });
    }

};
