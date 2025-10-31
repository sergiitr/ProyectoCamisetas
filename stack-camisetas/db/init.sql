
CREATE DATABASE `camisetas`;

USE `camisetas`;

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


CREATE TABLE `usuario` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `telefono` VARCHAR(20),
  `direccion` VARCHAR(255),
  `activo` BOOLEAN,
  `tipo` ENUM('OPERADOR','CLIENTE'),  
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `pedido` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` ENUM('carrito','pagado','procesando','procesado','enviado','recibido') NOT NULL DEFAULT 'carrito',
  `cliente` INT UNSIGNED NOT NULL,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`cliente`) REFERENCES `usuario`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `linea_pedido` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pedido` INT UNSIGNED NOT NULL,
  `producto` INT UNSIGNED NOT NULL,
  `precio_venta` DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`pedido`) REFERENCES `pedido`(`id`) ,
  FOREIGN KEY (`producto`) REFERENCES `camiseta`(`id`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- juan Secreto_123

INSERT INTO `usuario` (`username`, `password`, `email`, `telefono`, `direccion`, `activo`, `tipo`) VALUES ('juan', '$2a$10$lI.aqorQqeC8Z7faW7npY.j8RKyK48df4c9Beo60FHZltPdaGnO3y', 'juansinmiedo@sincorreo.com', '555123456', 'Paseo de la Estación 44, 23008, JAEN', '1', 'OPERADOR');
