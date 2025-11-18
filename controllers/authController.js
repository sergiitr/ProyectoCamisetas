const { urlencoded } = require('body-parser')
const bcrypt = require('bcrypt')
const db = require('../db')

exports.loginForm = (req, res) => {
    res.render('auth/login')
}

exports.registerForm = (req, res) => {
    res.render('auth/register')
}

exports.register = (req, res) => {
    const {username, password, telefono, direccion, email} = req.body

    let hashedPass = bcrypt.hashSync(password, 10)

    const sql = 'INSERT INTO `usuario` (`username`, `password`, `email`, `telefono`, `direccion`, `activo`, `tipo`) \
        VALUES (?, ?, ?, ?, ?, 0, "CLIENTE")';
    
    db.query(sql, [username, hashedPass, email, telefono, direccion], 
        (error, respuesta) => {
            if (error) {
                console.log(error)
                let mensaje = 'Imposible dar de alta: '+error.sqlMessage
                res.render('error', {mensaje})
            } else {
                res.redirect('index')
            }
    })
}

exports.register = (req, res) => {
    const {username, password, telefono, direccion, email} = req.body

    let hashedPass = bcrypt.hashSync(password, 10)

    const sql = 'INSERT INTO `usuario` (`username`, `password`, `email`, `telefono`, `direccion`, `activo`, `tipo`) \
        VALUES (?, ?, ?, ?, ?, 0, "CLIENTE")';
    
    db.query(sql, [username, hashedPass, email, telefono, direccion], 
        (error, respuesta) => {
            if (error) {
                console.log(error)
                let mensaje = 'Imposible dar de alta: '+error.sqlMessage
                res.render('error', {mensaje})
            } else {
                // CORREGIDO: Redirigir al usuario al formulario de login para que inicie sesión.
                res.redirect('/auth/login') 
            }
    })
}