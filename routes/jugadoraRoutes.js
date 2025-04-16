// routes/jugadoraRoutes.js
const express = require('express');
const {
    getAllJugadoras,
    getJugadoraById,
    createJugadora,
    updateJugadora,
    deleteJugadora,
    getJugadoraTorneos,
    assignJugadoraToTorneo,
    removeJugadoraFromTorneo,
} = require('../controllers/jugadoraController');
const { protect } = require('../middleware/authMiddleware');
// Importar validadores y middleware
const {
    validateCreateJugadora,
    validateUpdateJugadora,
    validateGetOrDeleteJugadora,
    validateRelationshipParams,
} = require('../validators/jugadoraValidators');

const router = express.Router();

// Todas las rutas de jugadoras están protegidas
router.use(protect);

router.route('/')
    .get(getAllJugadoras) // GET no suele necesitar validación de body
    .post(validateCreateJugadora, createJugadora); // Validar al crear

router.route('/:id')
    .get(validateGetOrDeleteJugadora, getJugadoraById) // Validar ID al obtener
    .put(validateUpdateJugadora, updateJugadora)     // Validar ID y body al actualizar
    .delete(validateGetOrDeleteJugadora, deleteJugadora); // Validar ID al borrar

// Rutas para manejar la relación Jugadora <-> Torneo
router.route('/:id/torneos')
    .get(validateGetOrDeleteJugadora, getJugadoraTorneos); // Validar ID de jugadora

router.route('/:jugadoraId/torneos/:torneoId')
    .post(validateRelationshipParams, assignJugadoraToTorneo)      // Validar ambos IDs
    .delete(validateRelationshipParams, removeJugadoraFromTorneo); // Validar ambos IDs

// Podrías añadir rutas similares para equipos aquí:
// router.route('/:id/equipos').get(validateGetOrDeleteJugadora, getJugadoraEquipos);
// router.route('/:jugadoraId/equipos/:equipoId').post(validateRelationshipParams, assignJugadoraToEquipo).delete(validateRelationshipParams, removeJugadoraFromEquipo);


module.exports = router;