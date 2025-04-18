// config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config(); // Carga variables de .env si están en un archivo .env

// Obtiene la URL de la base de datos desde las variables de entorno
const dbUrl = process.env.DATABASE_URL;

// Verifica si la variable DATABASE_URL está definida
if (!dbUrl) {
  console.error('❌ Error Fatal: La variable de entorno DATABASE_URL no está definida.');
  console.error('Asegúrate de configurar la variable DATABASE_URL en tu entorno de despliegue (Railway).');
  // Lanza un error para detener la aplicación si la DB es esencial
  throw new Error('DATABASE_URL no configurada. La aplicación no puede iniciar.');
  // Alternativamente, podrías usar process.exit(1) para forzar la salida:
  // process.exit(1);
}

console.log('🔌 Intentando conectar a la base de datos...'); // Mensaje para saber que se intenta conectar

let pool;
try {
  // Crea el pool de conexiones usando la URL
  pool = mysql.createPool(dbUrl);

  // Prueba la conexión para asegurar que la URL es válida y la DB accesible
  pool.getConnection()
    .then(connection => {
      console.log('✅ Conexión a la base de datos MySQL establecida correctamente.');
      connection.release(); // Libera la conexión de prueba inmediatamente
    })
    .catch(err => {
      // Este error es más específico, ocurre si la URL es inválida o la conexión falla
      console.error(`❌ Error al establecer una conexión con la base de datos usando la URL proporcionada.`);
      console.error('Detalles del error:', err.message); // Muestra el mensaje específico del error de conexión
      // Podrías querer terminar el proceso aquí también si la conexión inicial falla
      // process.exit(1);
    });

} catch (error) {
    // Este catch manejaría errores si `mysql.createPool(dbUrl)` fallara inmediatamente
    // (aunque es más común que falle dentro del .getConnection().catch)
    console.error('❌ Error Crítico al intentar crear el pool de conexiones MySQL:', error);
    throw error; // Relanza el error para detener la aplicación
    // o process.exit(1);
}

// Exporta el pool para usarlo en otros archivos (controllers, etc.)
module.exports = pool;