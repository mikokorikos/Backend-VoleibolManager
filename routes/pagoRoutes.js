// routes/pagoRoutes.js
const express = require('express');
const {
    getAllPagos,
    getPagoById,
    createPago,
    updatePago,
    deletePago,
} = require('../controllers/pagoController');
const { protect } = require('../middleware/authMiddleware');
// Importar validadores
const {
    validateCreatePago,
    validateUpdatePago,
    validateGetOrDeletePago,
} = require('../validators/pagoValidators');

const router = express.Router();

router.use(protect); // Proteger todas las rutas de pagos

router.route('/')
    .get(getAllPagos) // GET no suele necesitar validación (a menos que uses query params)
    .post(validateCreatePago, createPago); // Validar al crear

router.route('/:id')
    .get(validateGetOrDeletePago, getPagoById) // Validar ID al obtener
    .put(validateUpdatePago, updatePago)     // Validar ID y body al actualizar
    .delete(validateGetOrDeletePago, deletePago); // Validar ID al borrar

module.exports = router;