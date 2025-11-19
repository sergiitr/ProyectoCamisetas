const bcrypt = require('bcrypt');
const db = require('../db');

// --------------------------------------
// Mostrar formularios
// --------------------------------------
exports.loginForm = (req, res) => {
    res.render('auth/login');
};

exports.registerForm = (req, res) => {
    res.render('auth/register');
};

// --------------------------------------
// Registro de usuario
// --------------------------------------
exports.register = (req, res) => {
    const { username, password, telefono, direccion, email } = req.body;
    const hashedPass = bcrypt.hashSync(password, 10);
    const sql = `INSERT INTO usuario (username, password, email, telefono, direccion, activo, tipo)VALUES (?, ?, ?, ?, ?, 0, "CLIENTE")`;

    db.query(sql, [username, hashedPass, email, telefono, direccion], (error) => {
        if (error) {
            console.log(error);
            res.render('error', { mensaje: 'Imposible dar de alta: ' + error.sqlMessage });
        } else 
            res.redirect('/auth/login'); // Correcto → volver al login
    });
};

// --------------------------------------
// LOGIN — Validar credenciales
// --------------------------------------
exports.login = (req, res) => {
    const { username, password } = req.body;
    const sql = `SELECT * FROM usuario WHERE username = ? AND activo = 1`;
    db.query(sql, [username], (error, resultados) => {
        if (error) {
            console.log(error);
            return res.render('error', { mensaje: 'Error en la base de datos' });
        }
        if (resultados.length === 0) 
            return res.render('auth/login', { mensaje: 'Usuario o contraseña incorrectos' });
        
        const user = resultados[0];

        // Comprobar contraseña
        if (!bcrypt.compareSync(password, user.password))
            return res.render('auth/login', { mensaje: 'Usuario o contraseña incorrectos' });
        
        // Guardar usuario en sesión
        req.session.usuario = {
            id: user.id,
            username: user.username,
            tipo: user.tipo
        };

        // Redirigir al panel de usuario
        res.redirect('/indexRegistrado');
    });
};

// --------------------------------------
// LOGOUT
// --------------------------------------
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/logout-success');
    });
};
