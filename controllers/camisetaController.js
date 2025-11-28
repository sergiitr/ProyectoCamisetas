const fs = require('fs');
const path = require('path');
const db = require('../db');

exports.camisetas = (req, res) => {

    let query = 'SELECT * FROM camiseta';

    db.query(query, (error, resultado) => {
        if (error)
            return res.render('error', { mensaje: 'Imposible acceder a las camisetas' });

        // --------------------------------------------------------------------
        // LEER CARPETA DE IMÁGENES ALEATORIAS
        // --------------------------------------------------------------------
        const carpetaImagenes = path.join(__dirname, '../public/img/random_cam/');
        let imagenes = [];

        try {
            imagenes = fs.readdirSync(carpetaImagenes)
                .filter(f =>
                    f.toLowerCase().endsWith('.jpg') ||
                    f.toLowerCase().endsWith('.png') ||
                    f.toLowerCase().endsWith('.jpeg') ||
                    f.toLowerCase().endsWith('.webp')
                );
        } catch (e) {
            console.log("⚠️ Error leyendo carpeta de imágenes:", e);
        }

        // --------------------------------------------------------------------
        // ASIGNAR UNA IMAGEN ALEATORIA A CADA CAMISETA
        // --------------------------------------------------------------------
        resultado = resultado.map(c => {

            if (imagenes.length > 0) {
                const aleatoria = imagenes[Math.floor(Math.random() * imagenes.length)];
                c.imagenUrl = `/img/random_cam/${aleatoria}`;
            } else {
                c.imagenUrl = null;
            }

            return c;
        });

        res.render('camiseta/list', { camisetas: resultado });
    });
};

exports.camiseta = (req, res) => {
    const { id } = req.params;
    if (isNaN(id))
        return res.render('error', { mensaje: 'CAMISETA GETONE PARAMETROS INCORRECTOS' });

    let query = 'SELECT * FROM camiseta WHERE id=?';
    db.query(query, id, (error, resultado) => {
        if (error)
            return res.render('error', { mensaje: 'Imposible acceder a la camiseta' });

        if (req.session.usuario.tipo !== 'OPERADOR')
            res.render('camiseta/list', { camisetas: resultado });
        else
            res.redirect('camiseta/list', { camisetas: resultado });
    });
};

exports.camisetaAddForm = (req, res) => {
    res.render('camiseta/add');
};

exports.camisetaAdd = (req, res) => {
    const { talla, sexo, color, marca, stock, precio, activo } = req.body;
    let disponible = activo == 'on' ? 1 : 0;

    let sql = 'INSERT INTO camiseta (talla, sexo, color, marca, stock, precio, activo) VALUES (?, ?, ?, ?, ?, ?, ?)';

    db.query(sql, [talla, sexo, color, marca, stock, precio, disponible], (error) => {
        if (error) {
            console.log(error);
            return res.render('error', { mensaje: 'Imposible añadir la camiseta' });
        }
        res.redirect('/admin/camiseta');
    });
};

exports.camisetaUpdateForm = (req, res) => {
    const { id } = req.params;
    if (isNaN(id))
        return res.render('error', { mensaje: 'CAMISETA GETONE PARAMETROS INCORRECTOS' });

    let query = 'SELECT * FROM camiseta WHERE id=?';
    db.query(query, id, (error, resultado) => {
        if (error)
            return res.render('error', { mensaje: 'Imposible acceder a la camiseta' });

        res.render('camiseta/edit', { datos: resultado[0] });
    });
};

exports.camisetaDeleteForm = (req, res) => {
    const { id } = req.params;
    if (isNaN(id))
        return res.render('error', { mensaje: 'CAMISETA GETONE PARAMETROS INCORRECTOS' });

    let query = 'SELECT * FROM camiseta WHERE id=?';
    db.query(query, id, (error, resultado) => {
        if (error)
            return res.render('error', { mensaje: 'Imposible acceder a la camiseta' });

        res.render('camiseta/del', { datos: resultado[0] });
    });
};

exports.camisetaUpdate = (req, res) => {
    const { id } = req.params;
    const { talla, sexo, color, marca, stock, precio, activo } = req.body;
    let disponible = activo == 'on' ? 1 : 0;

    let sql = "UPDATE camiseta SET talla=?, sexo=?, color=?, marca=?, stock=?, precio=?, activo=? WHERE id=?";

    db.query(sql, [talla, sexo, color, marca, stock, precio, disponible, id], (error) => {
        if (error) {
            console.log(error);
            return res.render('error', { mensaje: 'Imposible actualizar la camiseta' });
        }
        res.redirect('/admin/camiseta');
    });
};

exports.camisetaDelete = (req, res) => {
    const { id } = req.params;
    if (isNaN(id))
        return res.render('error', { mensaje: 'CAMISETA DELETE PARAMETROS INCORRECTOS' });

    let query = 'DELETE FROM camiseta WHERE id=?';

    db.query(query, id, (error) => {
        if (error) {
            console.log(error);
            return res.render('error', { mensaje: 'Imposible borrar la camiseta' });
        }
        res.redirect('/admin/camiseta');
    });
};
