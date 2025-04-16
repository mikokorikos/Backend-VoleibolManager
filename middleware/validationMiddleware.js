// middleware/validationMiddleware.js
const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log detallado de errores de validación en el servidor
    console.warn(`Errores de validación para ${req.method} ${req.originalUrl}:`, JSON.stringify(errors.array()));
    // Enviar respuesta 400 (Bad Request) con los errores
    return res.status(400).json({ message: "Errores de validación", errors: errors.array() });
  }
  // Si no hay errores, pasa al siguiente middleware o controlador
  next();
};

module.exports = { handleValidationErrors };