CREATE DATABASE `camisetas`;

USE `camisetas`;

CREATE TABLE `camiseta` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `talla` ENUM('xxs','xs','s','m','l','xl','xxl') NOT NULL,
  `sexo` ENUM('chica','chico','unisex','nino','nina','unisex_infantil') NOT NULL,
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
  `cantidad` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`pedido`) REFERENCES `pedido`(`id`) ,
  FOREIGN KEY (`producto`) REFERENCES `camiseta`(`id`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- juan Secreto_123


INSERT INTO `usuario` (`id`, `username`, `password`, `email`, `telefono`, `direccion`, `activo`, `tipo`) VALUES
(1,	'pepe',	'$2a$10$czRAAeghw4UntjfS4etcgOfCwXypg/PRC.MmfadS8qN1PRWlEJiI2',	'juansinmiedo@sincorreo.com',	'555123456',	'Paseo de la Estación 44, 23008, JAEN',	1,	'OPERADOR'),
(13,	'pepito',	'$2b$10$.zbmFav.W7ZYXvuNerc4J.Saygg9JRE2mEudBrB1Cy71DwbBkJxcG',	'pepe@sinninguncorreo.com',	'123-456-789',	'Paseo de la Estación 44, 23008, JAEN',	1,	'CLIENTE');

INSERT INTO `camiseta` (`id`, `talla`, `sexo`, `color`, `marca`, `stock`, `precio`, `activo`) VALUES
(1,	'xs',	'chico',	'#e01b24',	'Adidas',	3,	20.00,	1),
(2,	'xs',	'chico',	'#a0aba4',	'Puma',	10,	15.00,	0),
(3,	's',	'unisex',	'#000000',	'Puma',	3,	1.20,	1),
(4,	'xxs',	'nina',	'#ed333b',	'Puma',	12,	12.00,	1),
(5,	'xxl',	'nino',	'#f9f06b',	'Adidas',	12,	34.00,	1),
(14,	'xs',	'unisex',	'#e66100',	'Adidas',	3,	6.00,	1);

