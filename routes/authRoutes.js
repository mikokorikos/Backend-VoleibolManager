// routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit'); // <--- Añadido
const { registerValidationRules, loginValidationRules } = require('../validators/authValidators'); // <--- Añadido
const { handleValidationErrors } = require('../middleware/validationMiddleware'); // <--- Añadido

const router = express.Router();

// --- Rate Limiters específicos para Auth ---
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 10, // Limita cada IP a 10 intentos de login/registro por ventana
	message: 'Demasiados intentos de autenticación desde esta IP, intente de nuevo en 15 minutos',
    standardHeaders: true,
	legacyHeaders: false,
});

// --- Rutas ---

// Ruta de Registro - Comentada para deshabilitarla
/*
router.post(
    '/register',
    authLimiter, // Aplica rate limit
    registerValidationRules(), // Aplica reglas de validación
    handleValidationErrors, // Middleware que maneja errores de validación
    registerUser
);
*/

router.post(
    '/login',
    authLimiter, // Aplica rate limit
    loginValidationRules(), // Aplica reglas de validación
    handleValidationErrors, // Middleware que maneja errores de validación
    loginUser
);

router.get(
    '/me',
    protect, // Ruta protegida
    getMe
);

module.exports = router;