// routes/torneoRoutes.js
const express = require('express');
const {
    getAllTorneos,
    getTorneoById,
    createTorneo,
    updateTorneo,
    deleteTorneo,
    getTorneoJugadoras,
} = require('../controllers/torneoController');
const { protect } = require('../middleware/authMiddleware');
// Importar validadores
const {
    validateCreateTorneo,
    validateUpdateTorneo,
    validateGetOrDeleteTorneo,
} = require('../validators/torneoValidators');


const router = express.Router();

router.use(protect); // Proteger todas las rutas de torneos

router.route('/')
    .get(getAllTorneos)
    .post(validateCreateTorneo, createTorneo); // Validar al crear

router.route('/:id')
    .get(validateGetOrDeleteTorneo, getTorneoById) // Validar ID al obtener
    .put(validateUpdateTorneo, updateTorneo)     // Validar ID y body al actualizar
    .delete(validateGetOrDeleteTorneo, deleteTorneo); // Validar ID al borrar

// Ruta para obtener las jugadoras de un torneo específico
router.route('/:id/jugadoras')
    .get(validateGetOrDeleteTorneo, getTorneoJugadoras); // Validar ID del torneo


module.exports = router;