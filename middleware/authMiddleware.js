// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Asegúrate que la ruta sea correcta
require('dotenv').config();

const protect = async (req, res, next) => {
  let token;

  // Busca el token en el header Authorization (formato: Bearer TOKEN)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extrae el token
      token = req.headers.authorization.split(' ')[1];

      // Verifica el token usando el secreto
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Encuentra al usuario en la DB basado en el ID del token
      // Asume que tienes una tabla 'users' con un campo 'id'
      // Excluimos la contraseña del objeto usuario que adjuntamos a la request
      const [rows] = await pool.query('SELECT id, username FROM users WHERE id = ?', [decoded.id]);

      if (rows.length === 0) {
        return res.status(401).json({ message: 'Usuario no encontrado, token inválido' });
      }

      // Adjunta la información del usuario (sin contraseña) al objeto request
      req.user = rows[0];
      next(); // Pasa al siguiente middleware o al controlador de la ruta

    } catch (error) {
      console.error('Error de autenticación:', error);
      res.status(401).json({ message: 'No autorizado, token falló' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token' });
  }
};

module.exports = { protect };