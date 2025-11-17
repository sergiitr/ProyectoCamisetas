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
        if (resultados.length == 0) {
            return res.render('auth/login', { error: 'El usuario no existe' });
        }

        const usuario = resultados[0];
        // Comparamos contraseña
        const contrasenaCorrecta = bcrypt.compareSync(password, usuario.password);

        if (contrasenaCorrecta) {
            // IMPORTANTE: Guardamos el nombre en la sesión
            req.session.usuario = usuario.username;
            console.log("Login correcto. Usuario: " + req.session.usuario);
            
            // Redirigimos a la página de bienvenida (con 'r')
            res.redirect('/indexRegistrado');
        } else {
            res.render('auth/login', { error: 'Contraseña incorrecta' });
        }
    });
});

module.exports = router;