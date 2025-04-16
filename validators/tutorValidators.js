// validators/tutorValidators.js
const { body, param } = require('express-validator');

const tutorValidationRules = () => {
  return [
    body('nombre')
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio.')
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.'),

    body('apellido_paterno')
      .trim()
      .notEmpty().withMessage('El apellido paterno es obligatorio.')
      .isLength({ min: 2, max: 50 }).withMessage('El apellido paterno debe tener entre 2 y 50 caracteres.'),

    body('apellido_materno')
      .optional({ nullable: true, checkFalsy: true }) // Permite null o string vacío
      .trim()
      .isLength({ max: 50 }).withMessage('El apellido materno no puede exceder los 50 caracteres.'),

    body('telefono')
      .trim()
      .notEmpty().withMessage('El teléfono es obligatorio.')
      .isLength({ min: 7, max: 20 }).withMessage('El teléfono debe tener entre 7 y 20 caracteres.')
      .matches(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/).withMessage('Formato de teléfono inválido.'), // Regex básica para teléfono

    body('email')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isEmail().withMessage('Debe ser un formato de email válido.')
      .normalizeEmail() // Normaliza el email (ej. a minúsculas)
      .isLength({ max: 100 }).withMessage('El email no puede exceder los 100 caracteres.'),

    body('direccion')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 500 }).withMessage('La dirección no puede exceder los 500 caracteres.'), // Ajusta max según necesites

    body('ocupacion')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 100 }).withMessage('La ocupación no puede exceder los 100 caracteres.'),

    body('notas')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 1000 }).withMessage('Las notas no pueden exceder los 1000 caracteres.'), // Ajusta max

    body('activo')
      .optional() // Solo validar si se envía
      .isBoolean().withMessage('El campo activo debe ser verdadero o falso.')
      .toBoolean() // Convierte a booleano
  ];
};

const tutorIdParamValidationRules = () => {
    return [
        param('id')
            .isInt({ gt: 0 }).withMessage('El ID del tutor debe ser un número entero positivo.')
            .toInt() // Convierte a entero
    ];
}

module.exports = {
  tutorValidationRules,
  tutorIdParamValidationRules,
};