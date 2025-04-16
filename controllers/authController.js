// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { validationResult } = require('express-validator'); // <--- Añadido para manejar resultados de validación
require('dotenv').config();

const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h'; // <--- Cambiado a 1 hora (configurable en .env)
                                                      //      NOTA: Para sesiones más largas, considera implementar refresh tokens.
const PASSWORD_MIN_LENGTH = 8; // <--- Define la longitud mínima de la contraseña

// @desc    Registrar un nuevo usuario (ACTUALMENTE DESHABILITADO EN authRoutes.js)
// @route   POST /api/auth/register
// @access  Public (si estuviera habilitado)
const registerUser = async (req, res) => {

  // --- COMENTADO: Lógica de registro deshabilitada ---
  /*
  // 1. Validar entrada (ya hecho por middleware de express-validator)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  // 2. Validación adicional (ej. complejidad de contraseña)
  if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres` });
  }
  // Podrías añadir aquí más validaciones con regex para mayúsculas, números, etc.

  try {
    // 3. Verificar si el usuario ya existe
    const [existingUser] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'El nombre de usuario ya existe' });
    }

    // 4. Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 5. Insertar usuario en la DB
    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, password_hash]
    );

    if (result.insertId) {
      // 6. Generar token JWT (opcional al registrar, usualmente se hace al loguear)
      const token = jwt.sign({ id: result.insertId, username: username }, process.env.JWT_SECRET, {
        expiresIn: JWT_EXPIRATION,
      });
      res.status(201).json({
        _id: result.insertId, // Usa _id o id según prefieras
        id: result.insertId,
        username: username,
        token: token,
      });
    } else {
       // Esto no debería ocurrir si la inserción fue exitosa, pero por si acaso
      res.status(500).json({ message: 'Error inesperado al crear el usuario' });
    }
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error del servidor al registrar usuario' });
  }
  */
 // --- FIN COMENTADO ---

 // Respuesta si la ruta está deshabilitada
  res.status(403).json({ message: 'El registro de usuarios está deshabilitado.' });
};

// @desc    Autenticar (login) un usuario
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  // 1. Validar entrada (hecho por middleware)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    // 2. Buscar usuario por username
    const [users] = await pool.query('SELECT id, username, password_hash FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      console.warn(`Intento de login fallido para usuario (no encontrado): ${username}`);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = users[0];

    // 3. Comparar contraseña ingresada con la hasheada en la DB
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
      // 4. Generar token JWT si la contraseña coincide
      const payload = {
          id: user.id,
          username: user.username
          // Podrías añadir roles aquí si los implementas: role: user.role
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: JWT_EXPIRATION,
      });

      console.log(`Login exitoso para usuario: ${username}`);
      res.json({
        _id: user.id, // Mantenemos consistencia si el frontend espera _id
        id: user.id,
        username: user.username,
        token: token,
        // Podrías devolver el rol aquí también
      });
    } else {
      console.warn(`Intento de login fallido para usuario (contraseña incorrecta): ${username}`);
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor al iniciar sesión' });
  }
};

// @desc    Obtener información del usuario actual (requiere token)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  // La información del usuario (sin hash de contraseña) ya se adjuntó en req.user por el middleware 'protect'
  if (req.user) {
      // Opcional: Podrías querer buscar datos frescos del usuario aquí si fuera necesario
      res.status(200).json(req.user);
  } else {
      // Esto no debería ocurrir si el middleware 'protect' funciona bien
      res.status(401).json({ message: 'Usuario no encontrado en la solicitud' });
  }
};


module.exports = {
  registerUser, // Mantenlo exportado aunque la ruta esté comentada, por si lo habilitas
  loginUser,
  getMe,
};