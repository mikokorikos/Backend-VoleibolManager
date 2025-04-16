// config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config(); // Carga variables de .env

// Usamos createPool para manejar múltiples conexiones eficientemente
const pool = mysql.createPool(process.env.DATABASE_URL);

// Prueba la conexión (opcional pero recomendado)
pool.getConnection()
  .then(connection => {
    console.log('✅ Conexión a la base de datos MySQL establecida.');
    connection.release(); // Libera la conexión de prueba
  })
  .catch(err => {
    console.error('❌ Error al conectar con la base de datos:', err);
    // Podrías querer terminar el proceso si la DB no está disponible al inicio
    // process.exit(1);
  });

module.exports = pool; // Exportamos el pool para usarlo en otros archivos