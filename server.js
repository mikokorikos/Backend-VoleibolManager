// server.js - PRINCIPIO DEL ARCHIVO
console.log('--- Verificando TODAS las Variables de Entorno (antes de dotenv) ---');
// Imprime el objeto completo process.env al inicio del script
// ¡CUIDADO! Esto puede imprimir información sensible en los logs.
console.log(process.env);
console.log('--- Fin Verificación Inicial de Variables de Entorno ---');


// Carga las variables de entorno desde .env (si existe) después de la verificación inicial
const dotenv = require('dotenv');
dotenv.config();

// Luego importa los demás módulos
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Importa la configuración de la DB DESPUÉS de dotenv y la verificación inicial
const pool = require('./config/db'); // db.js también llama a dotenv.config(), pero no debería afectar
const initializeDatabase = require('./config/initDb');

// Importa las rutas
const authRoutes = require('./routes/authRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const jugadoraRoutes = require('./routes/jugadoraRoutes');
const torneoRoutes = require('./routes/torneoRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
// const equipoRoutes = require('./routes/equipoRoutes');
// const partidoRoutes = require('./routes/partidoRoutes');
// const estadisticaRoutes = require('./routes/estadisticaRoutes');


const app = express();

// --- Middlewares de Seguridad ---
app.use(helmet());

// Configuración de CORS
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://127.0.0.1:5500'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Proporciona el origen específico en el error para facilitar la depuración
      callback(new Error(`Origen '${origin}' no permitido por CORS`));
    }
  },
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Limitación de Tasa (Rate Limiting)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo después de 15 minutos',
});
app.use(generalLimiter);


// --- Middlewares Generales ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));


// --- Inicialización DB y Rutas ---
initializeDatabase()
  .then(() => {
    console.log("🟢 Inicialización de DB completada, montando rutas...");

    // Rutas de la API
    app.get('/api/status', (req, res) => {
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
      // Log detallado solo en desarrollo
      if (process.env.NODE_ENV !== 'production') {
          console.error("Error Object:", err);
          console.error("Error Stack:", err.stack);
      } else {
          // En producción, loguea al menos el mensaje del error
           console.error("Error Message:", err.message);
      }
      console.error("-----------------------------------------------------------");

      const statusCode = err.statusCode || 500;
      // Mensaje genérico para errores 500 en producción
      const message = (process.env.NODE_ENV === 'production' && statusCode === 500)
                      ? '¡Algo salió mal en el servidor!'
                      : err.message || 'Error interno del servidor';

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
    console.error("❌ Error durante la inicialización o arranque del servidor:", err);
    // Evitar salida si el error ya fue manejado en db.js
    if (err.message !== 'DATABASE_URL no configurada. La aplicación no puede iniciar.') {
       console.error("Terminando proceso debido a error no recuperable.")
       process.exit(1); // Termina el proceso si la inicialización/DB falla críticamente
    }
  });