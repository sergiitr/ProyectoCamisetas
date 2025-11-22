const db = require("../db");

// ------------------------------------
// VER CARRITO
// ------------------------------------
exports.ver = (req, res) => {
    const carrito = req.session.carrito;

    let total = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);

    res.render("carrito/list", { carrito, total });
};

// ------------------------------------
// AÑADIR PRODUCTO
// ------------------------------------
exports.agregar = (req, res) => {
    const id = req.body.id;

    db.query("SELECT * FROM camiseta WHERE id = ? AND activo = 1", [id], (err, results) => {
        if (err || results.length === 0)
            return res.render("error", { mensaje: "Producto no encontrado" });

        const producto = results[0];

        const existente = req.session.carrito.find(item => item.id == id);

        if (existente) {
            existente.cantidad++;
        } else {
            req.session.carrito.push({
                id: producto.id,
                color: producto.color,
                talla: producto.talla,
                marca: producto.marca,
                precio: producto.precio,
                cantidad: 1
            });
        }

        res.redirect("/carrito");
    });
};

// ------------------------------------
// ELIMINAR UNA UNIDAD
// ------------------------------------
exports.eliminarUno = (req, res) => {
    const id = req.params.id;

    const item = req.session.carrito.find(p => p.id == id);
    if (item) {
        item.cantidad--;
        if (item.cantidad <= 0) {
            req.session.carrito = req.session.carrito.filter(p => p.id != id);
        }
    }

    res.redirect("/carrito");
};

// ------------------------------------
// ELIMINAR PRODUCTO COMPLETO
// ------------------------------------
exports.eliminarTodo = (req, res) => {
    const id = req.params.id;
    req.session.carrito = req.session.carrito.filter(p => p.id != id);
    res.redirect("/carrito");
};

// ------------------------------------
// FINALIZAR COMPRA (PEDIDO EN SESIÓN)
// ------------------------------------
exports.finalizar = (req, res) => {

    if (req.session.carrito.length === 0)
        return res.redirect("/carrito");

    const pedido = {
        id: Date.now(),
        fecha: new Date().toLocaleString(),
        total: req.session.carrito.reduce((t, p) => t + p.precio * p.cantidad, 0),
        productos: [...req.session.carrito]
    };

    if (!req.session.pedidos) req.session.pedidos = [];
    req.session.pedidos.push(pedido);

    req.session.carrito = [];

    res.render("carrito/confirmacion", { pedido });
};
