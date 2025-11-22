// Archivo: /utils/CamisetasImagenes.js (o donde decidas guardarlo)

const defaultImages = [
    'camiseta-01.jpg', 
    'camiseta-02.jpg', 
    'camiseta-03.jpg', 
    'camiseta-04.jpg', 
    'camiseta-05.jpg', 
    'camiseta-06.jpg', 
    'camiseta-07.jpg', 
    'camiseta-08.jpg', 
    'camiseta-09.jpg', 
    'camiseta-10.jpg'
];

/**
 * Devuelve la URL estática de una imagen de camiseta elegida al azar.
 * @returns {string} La ruta completa a la imagen.
 */
function getRandomImageUrl() {
    const randomIndex = Math.floor(Math.random() * defaultImages.length);
    const randomImageName = defaultImages[randomIndex];
    
    // IMPORTANTE: '/styles/images/' debe coincidir con tu ruta estática configurada en Express.
    return '/styles/images/' + randomImageName;
}

// Exportar la función para que Pug pueda usarla
module.exports = {
    getRandomImageUrl
};