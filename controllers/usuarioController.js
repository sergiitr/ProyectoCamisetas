const bcrypt = require('bcrypt');
const db = require('../db');


//Mostar lalista de usuarios
exports.usuarioListado = (req, res) => {
    // Consulta para obtener todos los usuarios (omitiendo la contraseña)
    let query = 'SELECT id, username, email, telefono, direccion, activo, tipo FROM usuario';

    db.query(query, (error, resultado) => {
        if (error) {
            console.log(error);
            res.render('error', {
                mensaje: 'Imposible acceder a la lista de usuarios: ' + error.message
            });
        } else     
            res.render('usuarios/list', { usuarios: resultado });
        
    });
}

//Este metodo debe llevarnos al formulario de confirmacion de borrado
exports.usuarioDeleteForm = (req, res) => {
    const { id } = req.params;
    if (isNaN(id))
        res.render( 'error', {mensaje:'USUARIO GETONE PARAMETROS INCORRECTOS'} )
    
    let query = 'SELECT * FROM usuario where id=?'

    db.query(query, id, (error, resultado)=>{
        if (error)
            res.render('error', { mensaje: 'Imposible acceder al usuario' })
        else {
            datos = resultado[0]
            console.log(datos)
            res.render('usuarios/del', {datos})
        }
    })
}

//Metodo que otta el usuario
exports.usuarioDelete = (req, res) =>{
   const { id } = req.params;
    if (isNaN(id))
        return res.render( 'error', {mensaje:'USUARIO DELETE PARAMETROS INCORRECTOS'} )
    
    let query = 'DELETE FROM usuario where id=?'
    db.query(query, id, (error, resultado)=>{
        if (error) {
            console.log(error)
            res.render('error', { mensaje: 'Imposible borrar la camiseta' })
        } else
            res.redirect('/admin/usuario/list')
    })
}

//metodo para ir a editar usuario
exports.usuarioEditarForm = (req, res) => {
    const { id } = req.params
    if (isNaN(id))
        return res.render( 'error', {mensaje:'USUARIO GETONE PARAMETROS INCORRECTOS'} )
    
    let query = "SELECT * FROM usuario WHERE id = ?"

    db.query(query, id, (error, resultado)=>{
        if (error) {
            console.log(error)
            res.render('error', { mensaje: 'Imposible editar el usuario' })
        } else{
            datos = resultado[0]
            console.log(datos)
            res.render(`usuarios/edit`, {datos})
        }
    })
}

//Metodo para confirmar la edicion
exports.usuarioEditar = (req, res) => {
    const { id } = req.params;

    const { username, password, email, tlfn, direccion, activo, tipo } = req.body;

    // Convertir checkbox
    const disponible = activo === 'on' ? 1 : 0;

    // Construir SQL dinámico (por si NO se cambia la contraseña)
    let sql = `
        UPDATE usuario SET 
            username = ?, 
            email = ?, 
            telefono = ?, 
            direccion = ?, 
            activo = ?, 
            tipo = ?
    `;
    
    const params = [username, email, tlfn, direccion, disponible, tipo];

    // si la contraseña está cambiada
    if (password && password.trim() !== "") {
        const hashedPass = bcrypt.hashSync(password, 10);
        sql += `, password = ?`;
        params.push(hashedPass);
    }

    // WHERE final
    sql += ` WHERE id = ?`;
    params.push(id);

    //Mostramos como se queda el sql
    console.log(sql)

    //Ejecucion del comando
    db.query(sql, params, (error, resultado) => {
        if (error) {
            console.log(error);
            return res.render('error', { mensaje: 'Imposible actualizar el usuario' });
        }
        res.redirect('/admin/usuario/list');
    });
}



