// Cargamos módulos
const express = require('express');
const session = require('express-session'); // Necesario para el login
const bodyParser = require('body-parser');
const path = require('path'); // Necesario solo si usas path en env, si no, se puede quitar
const camisetaRouter = require('./routes/camisetaRouter');
const authRouter = require('./routes/authRouter');

const app = express();

// Cargo el .ENV
require('dotenv').config({ path: './stack-camisetas/.env' });
const port = process.env.APP_PORT;

// Configuración de Pug
app.set('view engine', 'pug');

// Configuración de la Sesión (Básico para que funcione el login)
app.use(session({
    secret: 'clave_secreta_proyecto', // Pon lo que quieras aquí
    resave: false,
    saveUninitialized: false
}));

// Middleware para BodyParser
app.use(bodyParser.urlencoded({ extended: true }));

// --- TRUCO PARA EL PIE DE PÁGINA ---
// Este middleware pasa la variable 'user' a TODOS los archivos .pug automáticamente
app.use((req, res, next) => {
    res.locals.user = req.session.usuario;
    next();
});

// Middleware de log
app.use((req, res, next) =>{
  console.log("Petición recibida en: " + req.url);
  next();
});

// --- RUTAS ---

app.use('/admin/camiseta', camisetaRouter);
app.use('/auth', authRouter);

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/login", (req, res) => {
  res.render("")
})

app.get("/auth/index", (req, res) => {
  res.render("index")
})



// ESTA ES LA RUTA QUE TE FALTABA
app.get("/indexRegistrado", (req, res) => {
    // Si no hay usuario logueado, lo mandamos al login
    if (!req.session.usuario) {
        return res.redirect('/auth/login');
    }
    // Renderizamos la vista. No hace falta pasar variables, el middleware de arriba ya lo hizo.
    res.render("indexRegistrado");
});

// Poner el servidor a escuchar
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});