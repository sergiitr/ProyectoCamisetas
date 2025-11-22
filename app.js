// Cargamos módulos
const express = require('express');
const session = require('express-session'); // Necesario para el login
const bodyParser = require('body-parser');
const path = require('path');
const camisetaRouter = require('./routes/camisetaRouter');
const authRouter = require('./routes/authRouter');
const db = require('./db'); // Necesitas acceder a la base de datos

const app = express();

// Cargo el .ENV
require('dotenv').config({ path: './stack-camisetas/.env' });
const port = process.env.APP_PORT;

// Configuración de Pug
app.set('view engine', 'pug');

// Configuración de la Sesión (Básico para que funcione el login)
app.use(session({
    secret: 'clave_secreta_proyecto', 
    resave: false,
    saveUninitialized: false,
}));

// Middleware para BodyParser (para manejar datos de formularios)
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de log
app.use((req, res, next) =>{
    console.log("Petición recibida en: " + req.url);
    next();
});

// --- MIDDLEWARE GLOBAL DE SESIÓN ---
// Pasa la información de la sesión a TODAS las vistas (archivos .pug)
app.use((req, res, next) => {
    if (req.session.usuario) {
        // Pasa el nombre de usuario
        res.locals.user = req.session.usuario.username; 
        // Pasa un flag si es administrador
        res.locals.isAdmin = req.session.usuario.tipo === 'OPERADOR'; 
        console.log("Usuario en sesión: " + res.locals.user + " | isAdmin: " + res.locals.isAdmin);         
    } else {
        res.locals.user = null;
        res.locals.isAdmin = false;
        console.log("No hay usuario en sesión");
    }
    next();
});

// Middleware para verificar si el usuario es ADMIN
function isAdmin(req, res, next) {
    if (!req.session.usuario || req.session.usuario.tipo !== 'OPERADOR')
        return res.status(403).render("error", { mensaje: "Acceso denegado (solo para administradores)" });
    next();
}


// --- RUTAS ---

// Rutas de administración para Camisetas
app.use('/admin/indexRegistrado', isAdmin, camisetaRouter);
//Esta ruta se usará para las peticiones
app.use('/admin', isAdmin, camisetaRouter);
//Est parte es para guias las solicitudes de esdicion de camisetas
app.use("/admin/camiseta", camisetaRouter)
//Esta es la que se usa para los usuarios normales
app.use('/camisetas', camisetaRouter);
// Rutas de autenticación
app.use('/auth', authRouter);




// RUTA DE USUARIOS AÑADIDA DIRECTAMENTE AQUÍ PARA EVITAR CREAR usuarioRouter.js
app.get('/admin/usuarios/list', isAdmin, (req, res) => {

    // Consulta para obtener todos los usuarios (omitiendo la contraseña)
    let query = 'SELECT id, username, email, telefono, direccion, activo, tipo FROM usuario';

    db.query(query, (error, resultado) => {
        if (error) {
            console.log(error);
            res.render('error', {
                mensaje: 'Imposible acceder a la lista de usuarios: ' + error.message
            });
        } else     
            res.render('usuarios/list', { usuarios: resultado }); // Se asume que la vista se encuentra en 'usuario/list.pug'
        
    });
});


// RUTAS CSS
app.use(express.static('styles'));

// --------------------------------------------------------------------------

// Ruta principal
app.get("/", (req, res) => {
  res.render("index");
});

// Ruta a la que se redirige tras el login exitoso
app.get("/indexRegistrado", (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/auth/login');
    }else{
        res.render(`indexRegistrado`)
    }
});

app.get("/logout-success", (req, res) => {
    res.render("auth/logout");
});

// Poner el servidor a escuchar
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});