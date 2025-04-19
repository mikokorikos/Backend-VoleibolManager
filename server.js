// server.js
// Carga las variables de entorno primero
const dotenv = require('dotenv');
dotenv.config();

// Luego importa los demás módulos
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // <--- Añadido
const rateLimit = require('express-rate-limit'); // <--- Añadido
const pool = require('./config/db');
const initializeDatabase = require('./config/initDb');


console.log('--- Verificando Variables de Entorno ---');
console.log('Valor de process.env.DATABASE_URL:', process.env.DATABASE_URL);
console.log('--- Fin Verificación ---');

// Importa las rutas
const authRoutes = require('./routes/authRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const jugadoraRoutes = require('./routes/jugadoraRoutes');
const torneoRoutes = require('./routes/torneoRoutes');
const pagoRoutes = require('./routes/pagoRoutes');

// server.js - PRINCIPIO DEL ARCHIVO

// ... resto del código

// const equipoRoutes = require('./routes/equipoRoutes');
// const partidoRoutes = require('./routes/partidoRoutes');
// const estadisticaRoutes = require('./routes/estadisticaRoutes');


const app = express();

// --- Middlewares de Seguridad ---

// Añade cabeceras de seguridad básicas
app.use(helmet()); // <--- Añadido

// Configuración de CORS (más restrictiva)
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://127.0.0.1:5500']; // <--- Cambia 'http://localhost:3000' por la URL de tu frontend Flutter o web si es diferente. Añade 'http://127.0.0.1:5500' si usas Live Server para index.html
const corsOptions = {
  origin: function (origin, callback) {
    // Permite requests sin 'origin' (como apps móviles o Postman) O si el origen está en la lista
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  },
  optionsSuccessStatus: 200 // Algunos navegadores legacy (IE11) se ahogan con 204
};
app.use(cors(corsOptions)); // <--- Modificado

// Limitación de Tasa (Rate Limiting) general (ajusta según tus necesidades)
const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 200, // Limita cada IP a 200 requests por ventana (15 minutos)
	standardHeaders: true, // Devuelve info del rate limit en headers `RateLimit-*`
	legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
    message: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo después de 15 minutos', // <--- Mensaje personalizado
});
app.use(generalLimiter); // Aplica a todas las rutas después de esta línea


// --- Middlewares Generales ---
app.use(express.json()); // Para parsear JSON
app.use(express.urlencoded({ extended: false })); // Para parsear form data

// Sirve archivos estáticos desde 'public' (si aún lo necesitas para index.html)
app.use(express.static('public')); // <--- Añadido si usas el index.html

// --- Inicialización DB y Rutas ---
initializeDatabase()
  .then(() => {
    console.log("🟢 Inicialización de DB completada, montando rutas...");

    // Rutas de la API
    app.get('/api/status', (req, res) => { // Ruta simple de estado
      res.json({ status: 'API Voleibol Manager funcionando!' });
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/tutores', tutorRoutes);
    app.use('/api/jugadoras', jugadoraRoutes);
    app.use('/api/torneos', torneoRoutes);
    app.use('/api/pagos', pagoRoutes);
    // app.use('/api/equipos', equipoRoutes);
    // app.use('/api/partidos', partidoRoutes);
    // app.use('/api/estadisticas', estadisticaRoutes);


    // Middleware de manejo de errores (más robusto)
    app.use((err, req, res, next) => {
      console.error("-------------------- ERROR NO CONTROLADO --------------------");
      console.error(`[${new Date().toISOString()}] Ruta: ${req.method} ${req.originalUrl}`);
      console.error("Error:", err); // Log completo del error
      console.error("Stack:", err.stack); // Log del stack trace
      console.error("-----------------------------------------------------------");

      // Evita filtrar detalles internos en producción
      const statusCode = err.statusCode || 500;
      const message = process.env.NODE_ENV === 'production' ? '¡Algo salió mal en el servidor!' : err.message || 'Error interno del servidor';

      res.status(statusCode).json({
           message: message,
           // Opcional: añadir stack en desarrollo
           stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
       });
    });

    // Define el puerto
    const PORT = process.env.PORT || 5000;

    // Inicia el servidor
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));

  })
  .catch(err => {
    console.error("❌ Falló la inicialización de la base de datos. El servidor no se iniciará.", err);
    process.exit(1); // Termina el proceso si la DB falla
  });