// validators/pagoValidators.js
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validationMiddleware');

const commonPagoRules = [
    body('jugadora_id')
      .notEmpty().withMessage('El ID de la jugadora es obligatorio.')
      .isInt({ gt: 0 }).withMessage('El ID de la jugadora debe ser un número entero positivo.')
      .toInt(),
    body('tutor_id')
      .optional({ nullable: true }).isInt({ gt: 0 }).withMessage('El ID del tutor debe ser un número entero positivo.')
      .toInt(),
    body('concepto')
      .trim()
      .notEmpty().withMessage('El concepto es obligatorio.')
      .isLength({ min: 3, max: 100 }).withMessage('El concepto debe tener entre 3 y 100 caracteres.'),
    body('monto')
      .notEmpty().withMessage('El monto es obligatorio.')
      .isFloat({ gt: 0 }).withMessage('El monto debe ser un número positivo.')
      .toFloat(),
    body('fecha_pago')
      .isISO8601().withMessage('La fecha de pago debe ser una fecha válida (YYYY-MM-DD).')
      .toDate(),
    body('metodo_pago')
      .optional({ nullable: true, checkFalsy: true }).trim()
      .isLength({ max: 50 }).withMessage('El método de pago no puede exceder los 50 caracteres.')
      .isIn(['Efectivo', 'Transferencia', 'Tarjeta de crédito', 'Tarjeta de débito', 'Cheque', 'Otro', null]).withMessage('Método de pago inválido.'), // Incluye null
    body('referencia')
       .optional({ nullable: true, checkFalsy: true }).trim()
       .isLength({ max: 100 }).withMessage('La referencia no puede exceder los 100 caracteres.'),
    body('estado')
      .trim()
      .notEmpty().withMessage('El estado es obligatorio.')
      .toLowerCase() // Convertir a minúsculas antes de validar
      .isIn(['pendiente', 'pagado', 'cancelado']).withMessage('Estado inválido. Usar: pendiente, pagado, cancelado.'),
    body('comprobante')
       .optional({ nullable: true, checkFalsy: true }).trim()
       .isLength({ max: 255 }).withMessage('La ruta del comprobante no puede exceder los 255 caracteres.')
       .isURL({ protocols: ['http', 'https'], require_protocol: true, require_tld: false }).withMessage('El comprobante debe ser una URL válida (si se proporciona como URL).'), // Opcional: validar como URL si aplica
    body('notas')
       .optional({ nullable: true, checkFalsy: true }).trim()
       .isLength({ max: 1000 }).withMessage('Las notas no pueden exceder los 1000 caracteres.'),
];

const idParamValidationRules = (paramName = 'id') => [
    param(paramName)
        .isInt({ gt: 0 }).withMessage(`El ID (${paramName}) debe ser un número entero positivo.`)
        .toInt()
];

const validateCreatePago = [commonPagoRules, handleValidationErrors];
const validateUpdatePago = [idParamValidationRules('id'), commonPagoRules, handleValidationErrors];
const validateGetOrDeletePago = [idParamValidationRules('id'), handleValidationErrors];

module.exports = {
  validateCreatePago,
  validateUpdatePago,
  validateGetOrDeletePago,
};