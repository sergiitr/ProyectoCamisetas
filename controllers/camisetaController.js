const { urlencoded } = require('body-parser')
const db = require('../db')

exports.camisetas = (req, res) => {
    let query = 'SELECT * FROM camiseta'

    db.query(query, (error, resultado)=>{
        if (error) {
            res.render('error', {
                mensaje: 'Imposible acceder a las camisetas'})
        } else {
            res.render('camiseta/list', {camisetas: resultado})
        }
    })
}

exports.camiseta = (req, res) => {
    const { id } = req.params;
    if (isNaN(id)){
        res.render(
            'error',
            {mensaje:'CAMISETA GETONE PARAMETROS INCORRECTOS'})
    }
    let query = 'SELECT * FROM camiseta where id=?'

    db.query(query, id, (error, resultado)=>{
        if (error) {
            res.render('error', {
                mensaje: 'Imposible acceder a la camiseta'})
        } else {
            res.render('camiseta/list', {camisetas: resultado})
        }
    })
}

exports.camisetaAddForm = (req, res) => {
    res.render('camiseta/add')
}

exports.camisetaAdd = (req, res) => {
    const {talla, sexo, color, marca, 
        stock, precio, activo } = req.body
    
    let disponible = activo=='on'?1:0;
        
    let sql = 'INSERT INTO `camiseta`' +
        '(talla, sexo, color, marca, stock, precio, activo)' +
        ' VALUES(?,?,?,?,?,?,?)'

    db.query(sql, [talla, sexo, color, marca, 
        stock, precio, disponible], (error, resultado)=>{
        if (error) {
            console.log(error)
            res.render('error', {
                mensaje: 'Imposible añadir la camiseta'})
        } else {
            res.redirect('/admin/camiseta')
        }
    })

    
}

exports.camisetaUpdateForm = (req, res) => {
    const { id } = req.params;
    if (isNaN(id)){
        res.render(
            'error',
            {mensaje:'CAMISETA GETONE PARAMETROS INCORRECTOS'})
    }
    let query = 'SELECT * FROM camiseta where id=?'

    db.query(query, id, (error, resultado)=>{
        if (error) {
            res.render('error', {
                mensaje: 'Imposible acceder a la camiseta'})
        } else {
            datos = resultado[0]
            console.log(datos)
            res.render('camiseta/edit', {datos})
        }
    })
}

exports.camisetaDeleteForm = (req, res) => {
    const { id } = req.params;
    if (isNaN(id)){
        res.render(
            'error',
            {mensaje:'CAMISETA GETONE PARAMETROS INCORRECTOS'})
    }
    let query = 'SELECT * FROM camiseta where id=?'

    db.query(query, id, (error, resultado)=>{
        if (error) {
            res.render('error', {
                mensaje: 'Imposible acceder a la camiseta'})
        } else {
            datos = resultado[0]
            console.log(datos)
            res.render('camiseta/del', {datos})
        }
    })
}

exports.camisetaUpdate = (req, res) => {
    // El id viene en la ruta
    const { id } = req.params;
    // En el cuerpo del formulario vienen los datos
    const { talla, sexo, color, 
        marca, stock, precio, activo} = req.body
    
    let disponible = activo=='on'?1:0;

    let sql = "UPDATE `camiseta` SET \
        `talla`  = ?,\
        `sexo`   = ?,\
        `color`  = ?,\
        `marca`  = ?,\
        `stock`  = ?,\
        `precio` = ?,\
        `activo` = ?\
        WHERE `id` = ?"

    db.query(sql, [talla, sexo, color, 
        marca, stock, precio, disponible, id], (error, resultado)=>{
        if (error) {
            console.log(error)
            res.render('error', {
                mensaje: 'Imposible actualizar la camiseta'})
        } else {
            res.redirect('/admin/camiseta')
        }
    })
}


exports.camisetaDelete = (req, res) => {
    const { id } = req.params;
    if (isNaN(id)){
        res.render(
            'error',
            {mensaje:'CAMISETA DELETE PARAMETROS INCORRECTOS'})
    }
    let query = 'DELETE FROM camiseta where id=?'
    db.query(query, id, (error, resultado)=>{
        if (error) {
            res.render('error', {
                mensaje: 'Imposible borrar la camiseta'})
        } 
    })

    res.redirect('/admin/camiseta')

}

