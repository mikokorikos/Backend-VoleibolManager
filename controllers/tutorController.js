// controllers/tutorController.js
const pool = require('../config/db');
// Ya no necesitamos validationResult aquí porque se maneja en el middleware

// @desc    Obtener todos los tutores
// @route   GET /api/tutores
// @access  Private
const getAllTutores = async (req, res, next) => { // <--- Añadir next
  try {
    const [rows] = await pool.query('SELECT id, nombre, apellido_paterno, apellido_materno, telefono, email, direccion, ocupacion, notas, activo, fecha_creacion, ultima_actualizacion FROM tutores ORDER BY fecha_creacion DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tutores:', error);
    // Pasamos el error al middleware de errores global
    next(error); // <--- Usar next(error)
  }
};

// @desc    Obtener un tutor por ID
// @route   GET /api/tutores/:id
// @access  Private
const getTutorById = async (req, res, next) => { // <--- Añadir next
  // La validación del ID ya se hizo en el middleware
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id, nombre, apellido_paterno, apellido_materno, telefono, email, direccion, ocupacion, notas, activo, fecha_creacion, ultima_actualizacion FROM tutores WHERE id = ?', [id]);
    if (rows.length === 0) {
      // Usar un error específico para 'no encontrado'
      return res.status(404).json({ message: 'Tutor no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(`Error al obtener tutor ${id}:`, error);
    next(error); // <--- Usar next(error)
  }
};

// @desc    Crear un nuevo tutor
// @route   POST /api/tutores
// @access  Private
const createTutor = async (req, res, next) => { // <--- Añadir next
  // La validación del body ya se hizo en el middleware
  const {
    nombre,
    apellido_paterno,
    apellido_materno,
    telefono,
    email,
    direccion,
    ocupacion,
    notas,
    // activo (podría venir del body si se permite crearlo inactivo)
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO tutores (nombre, apellido_paterno, apellido_materno, telefono, email, direccion, ocupacion, notas, fecha_creacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`, // Usar NOW() de SQL es más seguro
      [nombre, apellido_paterno, apellido_materno || null, telefono, email || null, direccion || null, ocupacion || null, notas || null]
    );

    // Obtener el tutor recién creado para devolverlo
    const [newTutor] = await pool.query('SELECT id, nombre, apellido_paterno, apellido_materno, telefono, email, direccion, ocupacion, notas, activo, fecha_creacion, ultima_actualizacion FROM tutores WHERE id = ?', [result.insertId]);

    if (newTutor.length > 0) {
        res.status(201).json(newTutor[0]);
    } else {
        // Error inesperado si no se encuentra el tutor recién insertado
        throw new Error("No se pudo recuperar el tutor después de la inserción.");
    }

  } catch (error) {
    console.error('Error al crear tutor:', error);
    // Detectar errores específicos si es posible (ej. email duplicado si tienes UNIQUE constraint)
    if (error.code === 'ER_DUP_ENTRY') {
        // Asumiendo que tienes un índice único en 'email'
        return res.status(409).json({ message: 'El email proporcionado ya está registrado.' });
    }
    next(error); // <--- Usar next(error)
  }
};

// @desc    Actualizar un tutor
// @route   PUT /api/tutores/:id
// @access  Private
const updateTutor = async (req, res, next) => { // <--- Añadir next
  // La validación del ID y del body ya se hizo
  const { id } = req.params;
  const {
    nombre,
    apellido_paterno,
    apellido_materno,
    telefono,
    email,
    direccion,
    ocupacion,
    notas,
    activo // Asegúrate de manejar 'activo' si permites cambiarlo
  } = req.body;

  try {
    // Verifica primero si el tutor existe
     const [checkRows] = await pool.query('SELECT id FROM tutores WHERE id = ?', [id]);
     if (checkRows.length === 0) {
       return res.status(404).json({ message: 'Tutor no encontrado para actualizar' });
     }

    // Construcción dinámica de la consulta (alternativa más compleja pero flexible)
    // O la versión simple como la tenías:
    const [result] = await pool.query(
      `UPDATE tutores SET
          nombre = ?,
          apellido_paterno = ?,
          apellido_materno = ?,
          telefono = ?,
          email = ?,
          direccion = ?,
          ocupacion = ?,
          notas = ?,
          activo = ?,
          ultima_actualizacion = NOW()
        WHERE id = ?`,
      [
          nombre,
          apellido_paterno,
          apellido_materno || null,
          telefono,
          email || null,
          direccion || null,
          ocupacion || null,
          notas || null,
          (typeof activo === 'boolean' ? (activo ? 1 : 0) : 1), // Maneja 'activo'
          id
      ]
    );

    // affectedRows podría ser 0 si los datos enviados son idénticos a los existentes
    // Por eso verificamos la existencia antes.

    // Obtener el tutor actualizado
    const [updatedTutor] = await pool.query('SELECT id, nombre, apellido_paterno, apellido_materno, telefono, email, direccion, ocupacion, notas, activo, fecha_creacion, ultima_actualizacion FROM tutores WHERE id = ?', [id]);
    res.json(updatedTutor[0]);

  } catch (error) {
    console.error(`Error al actualizar tutor ${id}:`, error);
     if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'El email proporcionado ya está registrado por otro tutor.' });
    }
    next(error); // <--- Usar next(error)
  }
};

// @desc    Eliminar un tutor
// @route   DELETE /api/tutores/:id
// @access  Private
const deleteTutor = async (req, res, next) => { // <--- Añadir next
  // La validación del ID ya se hizo
  const { id } = req.params;
  try {
    // Considera qué pasa con las jugadoras si eliminas un tutor (FK constraints)
    // Tu schema usa ON DELETE SET NULL, lo cual es bueno.

    // Verifica primero si el tutor existe
    const [checkRows] = await pool.query('SELECT id FROM tutores WHERE id = ?', [id]);
    if (checkRows.length === 0) {
      return res.status(404).json({ message: 'Tutor no encontrado para eliminar' });
    }

    const [result] = await pool.query('DELETE FROM tutores WHERE id = ?', [id]);

    // No necesitas verificar affectedRows si ya comprobaste que existía.

    res.status(200).json({ message: 'Tutor eliminado correctamente' }); // Status 200 o 204 (No Content) es común para DELETE exitoso

  } catch (error) {
    console.error(`Error al eliminar tutor ${id}:`, error);
    // El error ER_ROW_IS_REFERENCED_2 no debería ocurrir con ON DELETE SET NULL,
    // pero si tuvieras restricciones diferentes, lo manejarías aquí.
    // if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    //     return res.status(400).json({ message: 'No se puede eliminar el tutor porque está referenciado.' });
    // }
    next(error); // <--- Usar next(error)
  }
};


module.exports = {
  getAllTutores,
  getTutorById,
  createTutor,
  updateTutor,
  deleteTutor,
};