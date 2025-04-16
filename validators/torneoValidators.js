// validators/torneoValidators.js
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validationMiddleware');

const commonTorneoRules = [
    body('nombre')
      .trim()
      .notEmpty().withMessage('El nombre del torneo es obligatorio.')
      .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
    body('ubicacion')
      .optional({ nullable: true, checkFalsy: true }).trim()
      .isLength({ max: 100 }).withMessage('La ubicación no puede exceder los 100 caracteres.'),
    body('fecha_inicio')
      .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida (YYYY-MM-DD).')
      .toDate(),
    body('fecha_fin')
      .isISO8601().withMessage('La fecha de fin debe ser una fecha válida (YYYY-MM-DD).')
      .toDate()
      // Validación adicional para asegurar que fecha_fin no sea anterior a fecha_inicio
      .custom((fechaFin, { req }) => {
            // req.body.fecha_inicio ya fue convertida a Date por la validación anterior
            if (req.body.fecha_inicio && fechaFin < req.body.fecha_inicio) {
                 throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio.');
            }
            return true;
       }),
    body('descripcion')
       .optional({ nullable: true, checkFalsy: true }).trim()
       .isLength({ max: 1000 }).withMessage('La descripción no puede exceder los 1000 caracteres.'),
    body('organizador')
      .optional({ nullable: true, checkFalsy: true }).trim()
      .isLength({ max: 100 }).withMessage('El organizador no puede exceder los 100 caracteres.'),
    body('costo')
      .optional({ nullable: true }).isFloat({ min: 0 }).withMessage('El costo debe ser un número no negativo.')
      .toFloat(),
    body('notas')
       .optional({ nullable: true, checkFalsy: true }).trim()
       .isLength({ max: 1000 }).withMessage('Las notas no pueden exceder los 1000 caracteres.'),
];

const idParamValidationRules = (paramName = 'id') => [
    param(paramName)
        .isInt({ gt: 0 }).withMessage(`El ID (${paramName}) debe ser un número entero positivo.`)
        .toInt()
];

const validateCreateTorneo = [commonTorneoRules, handleValidationErrors];
const validateUpdateTorneo = [idParamValidationRules('id'), commonTorneoRules, handleValidationErrors];
const validateGetOrDeleteTorneo = [idParamValidationRules('id'), handleValidationErrors];

module.exports = {
  validateCreateTorneo,
  validateUpdateTorneo,
  validateGetOrDeleteTorneo,
};