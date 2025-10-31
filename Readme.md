# Gestión tienda de camisetas

Breve descripción (tecnologías y cómo hemos calentado el plato).

* Contenedor docker
* Seleccionar con nvm la versión de node
* Crear el proyecto node
* Crear el proyecto git
* Crear el .gitignore

## Tablas

La información que necesito es:

1. Camiseta
   1. ID
   2. Talla (xxs, xs, s, m, l, xl, xxl)
   3. Sexo (chica, chico, unisex, niño, niña, unisex_infantil)
   4. Color
   5. Marca
   6. Stock
   7. Precio
2. Usuarios
   1. ID
   2. username
   3. password (hashed)
   4. email
   5. teléfono
   6. dirección
3. Pedidos
   1. ID
   2. fecha
   3. estado (carrito, pagado, procesando, procesado, enviado, recibido)
   4. cliente
   5. total
4. Linea_pedido
   1. ID
   2. Pedido
   3. Producto
   4. Precio venta
   

Y las tablas son:

Tabla `camiseta`:

```sql
CREATE TABLE `camiseta` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `talla` ENUM('xxs','xs','s','m','l','xl','xxl') NOT NULL,
  `sexo` ENUM('chica','chico','unisex','niño','niña','unisex_infantil') NOT NULL,
  `color` VARCHAR(50) NOT NULL,
  `marca` VARCHAR(50) NOT NULL,
  `stock` INT UNSIGNED NOT NULL DEFAULT 0,
  `precio` DECIMAL(8,2) NOT NULL,
  `activo` BOOLEAN,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


```

Tabla `usuario`:

```sql
CREATE TABLE `usuario` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `telefono` VARCHAR(20),
  `direccion` VARCHAR(255),
  `tipo` ENUM('OPERARIO','CLIENTE'),
  `activo` BOOLEAN,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

```

Tabla `pedido`:

```sql
CREATE TABLE `pedido` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` ENUM('carrito','pagado','procesando','procesado','enviado','recibido') NOT NULL DEFAULT 'carrito',
  `cliente` INT UNSIGNED NOT NULL,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`cliente`) REFERENCES `usuario`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

```

Tabla `linea_pedido`:

```sql
CREATE TABLE `linea_pedido` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pedido` INT UNSIGNED NOT NULL,
  `producto` INT UNSIGNED NOT NULL,
  `precio_venta` DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`pedido`) REFERENCES `pedido`(`id`) ,
  FOREIGN KEY (`producto`) REFERENCES `camiseta`(`id`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```


-- juan Secreto_123

INSERT INTO `usuario` (`username`, `password`, `email`, `telefono`, `direccion`, `activo`) VALUES ('juan', '$2a$10$lI.aqorQqeC8Z7faW7npY.j8RKyK48df4c9Beo60FHZltPdaGnO3y', 'juansinmiedo@sincorreo.com', '555123456', 'Paseo de la Estación 44, 23008, JAEN', '1');


## Diseño de endpoints

Rutas y perfiles:

RUTA | VERBO HTTP | Observaciones | Perfil|
-----|------------|---------------|--------|
/ | GET | Muestra el inicio de la tienda | cualquiera
/auth/login | GET | Muestra el formulario de login | cualquiera
/auth/login | POST | Recibe datos de login y crea sesión | cualquiera
/auth/signup | GET | Muestra el formulario de crear usuario | cualquiera
/auth/signup | POST | Recibe datos del usuario y lo crea  | cualquiera
/auth/logout | GET | Cierra la sesión | cualquiera
/auth/logout | POST | Cierra la sesión | cualquiera
/admin/camiseta | GET | Muestra todas las camisetas | OPERARIO
/admin/camiseta/\[id\] | GET | Muestra la camiseta con ese ID | OPERARIO
/admin/camiseta/del/\[id\] | GET | Muestra el formulario que pregunta si borrar la camiseta con ese ID | OPERARIO
/admin/camiseta/del/\[id\] | POST | Borra realmente la camiseta con ese ID | OPERARIO
/admin/camiseta/add | GET | Muestra el formulario para añadir una camiseta | OPERARIO
/admin/camiseta/add | POST | Añade la camiseta a la BBDD | OPERARIO
/admin/camiseta/update/\[id\] | GET | Muestra el formulario con los datos de la camiseta a actualizar | OPERARIO
/admin/camiseta/update/\[id\] | POST  | Actualiza realmente la camiseta con ese ID | OPERARIO
/carro | GET | Mostrar el carro | CLIENTE
~~/carro/add~~ | ~~POST~~ | ~~Añadir al carro la camiseta del formulario~~ | CLIENTE
/carro/add/camiseta/\[id\] | GET | Formulario para añadir al carro una camiseta (y cantidad) o cambiar cantidad | CLIENTE
/carro/add/camiseta/\[id\] | POST | Realmente añade al carro la/s camiseta/s | CLIENTE
/carro/del/camiseta/\[id\] | GET | Formulario para quitar del carro un producto | CLIENTE
/carro/del/camiseta/\[id\] | POST | Realmente quita del carro la/s camiseta/s | CLIENTE
/carro/procesar | GET | Formulario pago/envío | CLIENTE
/carro/procesar | POST | Formulario pago/envío | CLIENTE
/admin/pedido | GET | Muestra ***TODOS*** los pedidos | OPERARIO
/admin/pedido/estado/[estado] | GET | Muestra pedidos filtrados por estado  | OPERARIO
/admin/pedido/[id] | GET | Muestra un pedido para cambiarle el estado | OPERARIO
/admin/pedido/[id] | POST | Cambia el estado de un pedido | OPERARIO
/camiseta | GET | Muestra todas las camisetas | CLIENTE
/camiseta/\[id\] | GET | Muestra la camiseta con ese ID | CLIENTE
/pedido | GET | Muestra todos mis pedidos | CLIENTE
/pedido/\[id\] | GET | Muestra el pedido con ese ID | CLIENTE