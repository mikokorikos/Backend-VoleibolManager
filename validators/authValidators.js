// validators/authValidators.js
const { body } = require('express-validator');

// Mínimo 8 caracteres, al menos una letra y un número (ejemplo básico)
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

const registerValidationRules = () => {
  return [
    body('username')
      .trim()
      .notEmpty().withMessage('El nombre de usuario es obligatorio.')
      .isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres.'),
    body('password')
      .notEmpty().withMessage('La contraseña es obligatoria.')
      .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
    // Ejemplo de validación más compleja con Regex (descomentar si se usa registro):
    // .matches(passwordRegex).withMessage('La contraseña debe tener mínimo 8 caracteres, incluyendo al menos una letra y un número.'),
  ];
};

const loginValidationRules = () => {
  return [
    body('username')
      .trim()
      .notEmpty().withMessage('El nombre de usuario es obligatorio.'),
    body('password')
      .notEmpty().withMessage('La contraseña es obligatoria.'),
  ];
};

module.exports = {
  registerValidationRules,
  loginValidationRules,
};