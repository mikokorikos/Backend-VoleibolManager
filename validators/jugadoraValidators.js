// validators/jugadoraValidators.js
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validationMiddleware'); // Importa el manejador

// Reglas comunes para crear y actualizar
const commonJugadoraRules = [
    body('nombre')
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio.')
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.'),
    body('apellido_paterno')
      .trim()
      .notEmpty().withMessage('El apellido paterno es obligatorio.')
      .isLength({ min: 2, max: 50 }).withMessage('El apellido paterno debe tener entre 2 y 50 caracteres.'),
    body('apellido_materno')
      .optional({ nullable: true, checkFalsy: true }).trim()
      .isLength({ max: 50 }).withMessage('El apellido materno no puede exceder los 50 caracteres.'),
    body('fecha_nacimiento')
      .isISO8601().withMessage('La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD).')
      .toDate(), // Convierte a objeto Date
    body('categoria')
      .trim()
      .notEmpty().withMessage('La categoría es obligatoria.')
      .isLength({ max: 50 }).withMessage('La categoría no puede exceder los 50 caracteres.'),
      // .isIn(['Infantil', 'Juvenil', 'Cadete', 'Junior', 'Senior']).withMessage('Categoría inválida'), // Opcional: validar contra lista fija
    body('posicion')
       .optional({ nullable: true, checkFalsy: true }).trim()
       .isLength({ max: 50 }).withMessage('La posición no puede exceder los 50 caracteres.'),
       // .isIn(['Colocadora', 'Opuesta', ...]).withMessage('Posición inválida'), // Opcional
    body('numero_uniforme')
      .optional({ nullable: true }).isInt({ min: 0 }).withMessage('El número de uniforme debe ser un entero no negativo.')
      .toInt(),
    body('altura')
      .optional({ nullable: true }).isFloat({ min: 0 }).withMessage('La altura debe ser un número decimal positivo.')
      .toFloat(),
    body('peso')
      .optional({ nullable: true }).isFloat({ min: 0 }).withMessage('El peso debe ser un número decimal positivo.')
      .toFloat(),
    body('tutor_id')
      .notEmpty().withMessage('El ID del tutor principal es obligatorio.')
      .isInt({ gt: 0 }).withMessage('El ID del tutor principal debe ser un número entero positivo.')
      .toInt(),
    body('tutor_secundario_id')
      .optional({ nullable: true }).isInt({ gt: 0 }).withMessage('El ID del tutor secundario debe ser un número entero positivo.')
      .toInt(),
    body('telefono')
      .optional({ nullable: true, checkFalsy: true }).trim()
      .isLength({ min: 7, max: 20 }).withMessage('El teléfono debe tener entre 7 y 20 caracteres.'),
    body('email')
      .optional({ nullable: true, checkFalsy: true }).trim()
      .isEmail().withMessage('Debe ser un formato de email válido.')
      .normalizeEmail()
      .isLength({ max: 100 }).withMessage('El email no puede exceder los 100 caracteres.'),
    body('direccion')
      .optional({ nullable: true, checkFalsy: true }).trim()
      .isLength({ max: 500 }).withMessage('La dirección no puede exceder los 500 caracteres.'),
    body('escuela')
      .optional({ nullable: true, checkFalsy: true }).trim()
      .isLength({ max: 100 }).withMessage('La escuela no puede exceder los 100 caracteres.'),
    body('grado_escolar')
       .optional({ nullable: true, checkFalsy: true }).trim()
       .isLength({ max: 50 }).withMessage('El grado escolar no puede exceder los 50 caracteres.'),
    body('alergias')
       .optional({ nullable: true, checkFalsy: true }).trim()
       .isLength({ max: 1000 }).withMessage('Las alergias no pueden exceder los 1000 caracteres.'),
    body('condiciones_medicas')
       .optional({ nullable: true, checkFalsy: true }).trim()
       .isLength({ max: 1000 }).withMessage('Las condiciones médicas no pueden exceder los 1000 caracteres.'),
    body('notas')
       .optional({ nullable: true, checkFalsy: true }).trim()
       .isLength({ max: 1000 }).withMessage('Las notas no pueden exceder los 1000 caracteres.'),
    body('activo')
      .optional().isBoolean().withMessage('El campo activo debe ser verdadero o falso.')
      .toBoolean(),
    body('fecha_ingreso')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601().withMessage('La fecha de ingreso debe ser una fecha válida (YYYY-MM-DD).')
      .toDate(),
];

// Reglas para validar IDs en parámetros de URL
const idParamValidationRules = (paramName = 'id') => [
    param(paramName)
        .isInt({ gt: 0 }).withMessage(`El ID (${paramName}) debe ser un número entero positivo.`)
        .toInt()
];

// Reglas para asignar/eliminar torneo (valida IDs en params)
const relationshipParamsValidationRules = () => [
    param('jugadoraId')
        .isInt({ gt: 0 }).withMessage('El ID de la jugadora debe ser un número entero positivo.')
        .toInt(),
    param('torneoId')
         .isInt({ gt: 0 }).withMessage('El ID del torneo debe ser un número entero positivo.')
         .toInt(),
    // Añadir validación para 'equipoId' si implementas esa relación
    // param('equipoId').isInt({ gt: 0 })...
];

// Middleware combinados para simplificar rutas
const validateCreateJugadora = [commonJugadoraRules, handleValidationErrors];
const validateUpdateJugadora = [idParamValidationRules('id'), commonJugadoraRules, handleValidationErrors];
const validateGetOrDeleteJugadora = [idParamValidationRules('id'), handleValidationErrors];
const validateRelationshipParams = [relationshipParamsValidationRules(), handleValidationErrors];


module.exports = {
  validateCreateJugadora,
  validateUpdateJugadora,
  validateGetOrDeleteJugadora,
  validateRelationshipParams,
  // Exportamos reglas individuales si se necesitan por separado
  commonJugadoraRules,
  idParamValidationRules,
  relationshipParamsValidationRules,
};