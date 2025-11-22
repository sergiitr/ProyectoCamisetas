const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const db = require('../db'); 
const bcrypt = require('bcrypt');

// Rutas para mostrar los formularios
router.get('/login', authController.loginForm);
router.get('/register', authController.registerForm);

// Ruta para procesar el registro
router.post('/register', authController.register);

// Ruta para procesar el login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Buscamos al usuario en la base de datos
    const sql = 'SELECT * FROM usuario WHERE username = ?';
    
    db.query(sql, [username], (error, resultados) => {
        if (error) {
            console.log(error);
            return res.render('error', { mensaje: 'Error en base de datos' });
        }

        // Si no encuentra el usuario
        if (resultados.length == 0) 
            return res.render('auth/login', { error: 'El usuario no existe' }); // Se usa return para detener la ejecución

        const usuario = resultados[0];
        // Comparamos contraseña
        const contrasenaCorrecta = bcrypt.compareSync(password, usuario.password);

        if (contrasenaCorrecta) {
            // IMPORTANTE: Guardamos el nombre y el TIPO en la sesión
            req.session.usuario = {
                username: usuario.username,
                tipo: usuario.tipo // Clave para control de acceso (ADMIN/CLIENTE)
            };
            console.log("Login correcto. Usuario: " + req.session.usuario.username);
            
            // Redirigimos
            return res.redirect('/indexRegistrado');
        } else
            return res.render('auth/login', { error: 'Contraseña incorrecta' });
    });
});

// NUEVA RUTA: Logout
router.get('/logout', (req, res) => {
    // Destruye la sesión
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            return res.render('error', { mensaje: 'Error al cerrar sesión' });
        }
        // Redirige al inicio
        res.redirect('/');
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            // Si hay un error, redirigimos pero mostramos un error genérico
            return res.render('error', { mensaje: 'Error al cerrar sesión' });
        }
        // Redirige a la URL que renderizará la vista logout.pug (usaremos una nueva ruta en app.js)
        res.redirect('/logout-success'); 
    });
});


module.exports = router;
