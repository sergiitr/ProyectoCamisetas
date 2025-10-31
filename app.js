// Cargamos módulos
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const path = require('path')
const camisetaRouter = require('./routes/camisetaRouter')
const authRouter = require('./routes/authRouter')

// crea el objeto servidor Web
// todavía no sirve páginas (hay que darle
// la orden)
const app = express()

// cargo el .ENV (el mismo de DOCKER)
require('dotenv').config({ path: './stack-camisetas/.env' })
const port = process.env.APP_PORT


// Configuración de Pug
app.set('view engine', 'pug')
// Le decimos a express que use bodyparser
// para recoger datos de formularios
app.use(bodyParser.urlencoded({ extended: true }))

app.use( (req,res,next) =>{
  console.log("El middleware interceptó una petición.")
  next()
} )

app.use('/admin/camiseta',camisetaRouter)
app.use('/auth', authRouter)


// le doy la orden de escuchar en el puerto 
// indicado y servir páginas Web
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
