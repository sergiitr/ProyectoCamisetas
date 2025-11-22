// Cargamos módulos
const express = require('express');
const session = require('express-session'); // Necesario para el login
const bodyParser = require('body-parser');
const path = require('path');
const camisetaRouter = require('./routes/camisetaRouter');
const authRouter = require('./routes/authRouter');
<<<<<<< HEAD
const carritoRouter = require('./routes/carritoRouter');
const db = require('./db'); // Necesitas acceder a la base de datos
=======
const db = require('./db'); // Necesitas acceder a la base de datos
const carritoRouter = require('./routes/carritoRouter');

>>>>>>> a47b4ff858b92b480f4005b1d51ab381fe164b44

const app = express();

// Cargo el .ENV
require('dotenv').config({ path: './stack-camisetas/.env' });
<<<<<<< HEAD
const port = process.env.APP_PORT || 3000; // Uso 3000 por defecto si no está en .env

// Configuración de Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // Asegura la ruta de las vistas
=======
const port = process.env.APP_PORT;

// Configuración de Pug
app.set('view engine', 'pug');
>>>>>>> a47b4ff858b92b480f4005b1d51ab381fe164b44

// Configuración de la Sesión (Básico para que funcione el login)
app.use(session({
    secret: 'clave_secreta_proyecto', 
    resave: false,
    saveUninitialized: false,
}));

// Middleware para BodyParser (para manejar datos de formularios)
app.use(bodyParser.urlencoded({ extended: true }));

<<<<<<< HEAD
// RUTAS CSS (Asumiendo que están en 'styles')
app.use(express.static('styles')); 

=======
>>>>>>> a47b4ff858b92b480f4005b1d51ab381fe164b44
// Middleware de log
app.use((req, res, next) =>{
    console.log("Petición recibida en: " + req.url);
    next();
});

// --- MIDDLEWARE GLOBAL DE SESIÓN ---
<<<<<<< HEAD
app.use((req, res, next) => {
    if (req.session.usuario) {
        res.locals.user = req.session.usuario.username; 
=======
// Pasa la información de la sesión a TODAS las vistas (archivos .pug)
app.use((req, res, next) => {
    if (req.session.usuario) {
        // Pasa el nombre de usuario
        res.locals.user = req.session.usuario.username; 
        // Pasa un flag si es administrador
>>>>>>> a47b4ff858b92b480f4005b1d51ab381fe164b44
        res.locals.isAdmin = req.session.usuario.tipo === 'OPERADOR'; 
        console.log("Usuario en sesión: " + res.locals.user + " | isAdmin: " + res.locals.isAdmin);         
    } else {
        res.locals.user = null;
        res.locals.isAdmin = false;
        console.log("No hay usuario en sesión");
    }
    next();
});

<<<<<<< HEAD
=======

>>>>>>> a47b4ff858b92b480f4005b1d51ab381fe164b44
// Middleware para verificar si el usuario es ADMIN
function isAdmin(req, res, next) {
    if (!req.session.usuario || req.session.usuario.tipo !== 'OPERADOR')
        return res.status(403).render("error", { mensaje: "Acceso denegado (solo para administradores)" });
    next();
}

<<<<<<< HEAD


// Rutas de administración para Camisetas
app.use('/admin/indexRegistrado', isAdmin, camisetaRouter);
app.use('/admin', isAdmin, camisetaRouter);
app.use("/admin/camiseta", camisetaRouter)
// Esta es la que se usa para los usuarios normales
app.use('/camisetas', camisetaRouter);
// Rutas de autenticación
app.use('/auth', authRouter);

// RUTAS DEL CARRITO <--- NUEVO
app.use('/carrito', carritoRouter);


=======
// --- CARRITO EN SESIÓN ---
app.use((req, res, next) => {
    if (!req.session.carrito) {
        req.session.carrito = [];
    }
    next();
});

// --- RUTAS ---

// Rutas de administración para Camisetas
app.use('/camiseta', isAdmin, camisetaRouter);

// Rutas de autenticación
app.use('/auth', authRouter);

// Rutas del carrito
app.use('/carrito', carritoRouter);

>>>>>>> a47b4ff858b92b480f4005b1d51ab381fe164b44
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
<<<<<<< HEAD
            res.render('usuarios/list', { usuarios: resultado });
=======
            res.render('usuarios/list', { usuarios: resultado }); // Se asume que la vista se encuentra en 'usuario/list.pug'
>>>>>>> a47b4ff858b92b480f4005b1d51ab381fe164b44
        
    });
});


<<<<<<< HEAD
=======
// RUTAS CSS
app.use(express.static('styles'));

// --------------------------------------------------------------------------
>>>>>>> a47b4ff858b92b480f4005b1d51ab381fe164b44

// Ruta principal
app.get("/", (req, res) => {
  res.render("index");
});

// Ruta a la que se redirige tras el login exitoso
app.get("/indexRegistrado", (req, res) => {
<<<<<<< HEAD
    if (!req.session.usuario)
        return res.redirect('/auth/login');
    else
        res.render(`indexRegistrado`)
    
=======
    if (!req.session.usuario) {
        return res.redirect('/auth/login');
    }
    res.render("indexRegistrado");
>>>>>>> a47b4ff858b92b480f4005b1d51ab381fe164b44
});

app.get("/logout-success", (req, res) => {
    res.render("auth/logout");
});

<<<<<<< HEAD
// Simulación de Checkout
app.get('/pedido/checkout', (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/auth/login');
    }
    const carrito = req.session.carrito || { total: 0 };
    res.render('checkout', { total: carrito.total });
});


// Poner el servidor a escuchar
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
=======
// Poner el servidor a escuchar
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
>>>>>>> a47b4ff858b92b480f4005b1d51ab381fe164b44
