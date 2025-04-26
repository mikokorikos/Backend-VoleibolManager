// config/db.js - MODIFICACIÓN TEMPORAL PARA DEPURAR
const mysql = require('mysql2/promise');
// Carga variables de .env si existen, pero las del entorno (Railway) tienen prioridad
require('dotenv').config();

// Obtiene la URL de la base de datos desde las variables de entorno
const dbUrl = process.env.DATABASE_URL;

// Imprime el valor que recibe este módulo específico
console.log(`[config/db.js] Valor de process.env.DATABASE_URL al cargar este módulo: ${dbUrl}`);

let pool = null; // Inicializa el pool como null

// Intenta crear el pool SOLO si la URL parece estar definida
if (dbUrl) {
  try {
    console.log('[config/db.js] DATABASE_URL parece definida. Intentando crear pool...');
    // Crea el pool de conexiones usando la URL
    pool = mysql.createPool(dbUrl);

    // Prueba la conexión de forma asíncrona para no bloquear la carga inicial
    pool.getConnection()
      .then(connection => {
        console.log('✅ [config/db.js] Conexión de prueba al pool exitosa.');
        connection.release(); // Libera la conexión de prueba
      })
      .catch(err => {
        // Loguea el error de conexión pero NO detiene la aplicación aquí
        console.error(`❌ [config/db.js] Error al obtener conexión de prueba del pool. ¿URL/Credenciales correctas? ¿DB accesible? Error: ${err.message}`);
      });

  } catch (error) {
    // Captura errores SÍNCRONOS durante la creación del pool (menos común)
    console.error('❌ [config/db.js] Error SÍNCRONO al intentar crear el pool:', error);
    // No lanzamos el error para permitir que la app continúe cargando
  }
} else {
  // Advierte si la URL no está definida, pero no detiene la aplicación
  console.warn('⚠️ [config/db.js] DATABASE_URL no está definida al cargar este módulo. El pool de conexiones (BD) no estará disponible.');
}

// Exporta el pool (puede ser null si la URL no estaba definida o hubo un error síncrono)
module.exports = pool;