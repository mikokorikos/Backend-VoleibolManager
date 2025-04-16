// routes/tutorRoutes.js
const express = require('express');
const {
  getAllTutores,
  getTutorById,
  createTutor,
  updateTutor,
  deleteTutor,
} = require('../controllers/tutorController');
const { protect } = require('../middleware/authMiddleware');
const { tutorValidationRules, tutorIdParamValidationRules } = require('../validators/tutorValidators'); // <--- Añadido
const { handleValidationErrors } = require('../middleware/validationMiddleware'); // <--- Añadido

const router = express.Router();

// Proteger todas las rutas de tutores
router.use(protect);

router.route('/')
  .get(getAllTutores)
  .post(
      tutorValidationRules(), // <--- Aplica reglas de validación
      handleValidationErrors, // <--- Maneja errores de validación
      createTutor
  );

router.route('/:id')
  .get(
      tutorIdParamValidationRules(), // <--- Valida el ID en el parámetro
      handleValidationErrors,
      getTutorById
  )
  .put(
      tutorIdParamValidationRules(), // Valida ID
      tutorValidationRules(), // Valida cuerpo de la petición
      handleValidationErrors,
      updateTutor
   )
  .delete(
      tutorIdParamValidationRules(), // Valida ID
      handleValidationErrors,
      deleteTutor
  );

module.exports = router;