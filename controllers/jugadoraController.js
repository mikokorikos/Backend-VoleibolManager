// controllers/jugadoraController.js
const pool = require('../config/db');
const { format } = require('date-fns');

// Helper para formatear fecha a YYYY-MM-DD
const formatDate = (date) => {
    if (!date) return null;
    try {
        if (date instanceof Date) { // Si ya es objeto Date (viene del validador)
             return format(date, 'yyyy-MM-dd');
        }
        // Si es string (menos probable ahora con la validación), intentar parsear
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
             return date.substring(0, 10); // Asegurar solo YYYY-MM-DD
        }
        // Intentar parsear otros formatos si es necesario
        return format(new Date(date), 'yyyy-MM-dd');
    } catch (e) {
        console.warn(`Fecha inválida recibida para formatear: ${date}`);
        return null;
    }
};


// @desc    Obtener todas las jugadoras
const getAllJugadoras = async (req, res, next) => {
    try {
        // Considera añadir JOINs aquí si siempre necesitas datos del tutor, o hazlo bajo demanda
        const [rows] = await pool.query('SELECT * FROM jugadoras ORDER BY apellido_paterno, nombre ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener jugadoras:', error);
        next(error);
    }
};

// @desc    Obtener una jugadora por ID
const getJugadoraById = async (req, res, next) => {
    // ID validado por middleware
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM jugadoras WHERE id = ?', [id]);
        if (rows.length === 0) {
            const error = new Error('Jugadora no encontrada');
            error.statusCode = 404;
            return next(error);
        }
        // Aquí podrías hacer JOINs o consultas separadas para obtener datos relacionados si es necesario
        res.json(rows[0]);
    } catch (error) {
        console.error(`Error al obtener jugadora ${id}:`, error);
        next(error);
    }
};

// @desc    Crear una nueva jugadora
const createJugadora = async (req, res, next) => {
    // Body validado por middleware
    const {
        nombre, apellido_paterno, apellido_materno, fecha_nacimiento, categoria,
        posicion, numero_uniforme, altura, peso, tutor_id, tutor_secundario_id,
        telefono, email, direccion, escuela, grado_escolar, alergias,
        condiciones_medicas, notas, activo = true, fecha_ingreso // activo por defecto true si no viene
    } = req.body;

    const formattedFechaNacimiento = formatDate(fecha_nacimiento); // Fecha ya es Date object
    const formattedFechaIngreso = formatDate(fecha_ingreso); // Puede ser null o Date object

    try {
        const [result] = await pool.query(
            `INSERT INTO jugadoras (
                nombre, apellido_paterno, apellido_materno, fecha_nacimiento, categoria,
                posicion, numero_uniforme, altura, peso, tutor_id, tutor_secundario_id,
                telefono, email, direccion, escuela, grado_escolar, alergias,
                condiciones_medicas, notas, activo, fecha_ingreso, fecha_creacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                nombre, apellido_paterno, apellido_materno, formattedFechaNacimiento, categoria,
                posicion, numero_uniforme, altura, peso, tutor_id, tutor_secundario_id,
                telefono, email, direccion, escuela, grado_escolar, alergias,
                condiciones_medicas, notas, activo ? 1 : 0, formattedFechaIngreso
            ]
        );

        const [newJugadora] = await pool.query('SELECT * FROM jugadoras WHERE id = ?', [result.insertId]);
        if(newJugadora.length > 0) {
            res.status(201).json(newJugadora[0]);
        } else {
             throw new Error("No se pudo recuperar la jugadora después de la inserción.");
        }

    } catch (error) {
        console.error('Error al crear jugadora:', error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             const err = new Error('El ID del tutor proporcionado no existe.');
             err.statusCode = 400; // Bad Request por FK inválida
             return next(err);
        }
        if (error.code === 'ER_DUP_ENTRY') {
            const err = new Error('El email proporcionado ya está registrado para otra jugadora.');
            err.statusCode = 409; // Conflict
            return next(err);
        }
        next(error);
    }
};

// @desc    Actualizar una jugadora
const updateJugadora = async (req, res, next) => {
    // ID y Body validados
    const { id } = req.params;
    const {
        nombre, apellido_paterno, apellido_materno, fecha_nacimiento, categoria,
        posicion, numero_uniforme, altura, peso, tutor_id, tutor_secundario_id,
        telefono, email, direccion, escuela, grado_escolar, alergias,
        condiciones_medicas, notas, activo, fecha_ingreso
    } = req.body;

    const formattedFechaNacimiento = formatDate(fecha_nacimiento);
    const formattedFechaIngreso = formatDate(fecha_ingreso);

    try {
        // 1. Verificar si existe
        const [checkRows] = await pool.query('SELECT id FROM jugadoras WHERE id = ?', [id]);
        if (checkRows.length === 0) {
            const error = new Error('Jugadora no encontrada para actualizar');
            error.statusCode = 404;
            return next(error);
        }

        // 2. Actualizar
        await pool.query(
            `UPDATE jugadoras SET
                nombre = ?, apellido_paterno = ?, apellido_materno = ?, fecha_nacimiento = ?, categoria = ?,
                posicion = ?, numero_uniforme = ?, altura = ?, peso = ?, tutor_id = ?, tutor_secundario_id = ?,
                telefono = ?, email = ?, direccion = ?, escuela = ?, grado_escolar = ?, alergias = ?,
                condiciones_medicas = ?, notas = ?, activo = ?, fecha_ingreso = ?, ultima_actualizacion = NOW()
             WHERE id = ?`,
            [
                nombre, apellido_paterno, apellido_materno, formattedFechaNacimiento, categoria,
                posicion, numero_uniforme, altura, peso, tutor_id, tutor_secundario_id,
                telefono, email, direccion, escuela, grado_escolar, alergias,
                condiciones_medicas, notas, activo ? 1 : 0, formattedFechaIngreso, id
            ]
        );

        // 3. Obtener y devolver actualizado
        const [updatedJugadora] = await pool.query('SELECT * FROM jugadoras WHERE id = ?', [id]);
        if (updatedJugadora.length > 0) {
            res.json(updatedJugadora[0]);
        } else {
            throw new Error('No se pudo recuperar la jugadora después de la actualización.');
        }

    } catch (error) {
        console.error(`Error al actualizar jugadora ${id}:`, error);
         if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             const err = new Error('El ID del tutor proporcionado no existe.');
             err.statusCode = 400;
             return next(err);
         }
         if (error.code === 'ER_DUP_ENTRY') {
            const err = new Error('El email proporcionado ya está registrado para otra jugadora.');
            err.statusCode = 409;
            return next(err);
        }
        next(error);
    }
};

// @desc    Eliminar una jugadora
const deleteJugadora = async (req, res, next) => {
    // ID validado
    const { id } = req.params;
    let connection; // Para transacción
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Verificar si existe
        const [checkRows] = await connection.query('SELECT id FROM jugadoras WHERE id = ?', [id]);
        if (checkRows.length === 0) {
            await connection.rollback(); // Liberar transacción
            connection.release();
            const error = new Error('Jugadora no encontrada para eliminar');
            error.statusCode = 404;
            return next(error);
        }

        // 2. Eliminar registros dependientes (si no usas ON DELETE CASCADE o quieres lógica extra)
        //    Tus FK tienen CASCADE o SET NULL, así que esto es opcional, pero explícito
        await connection.query('DELETE FROM pagos WHERE jugadora_id = ?', [id]);
        await connection.query('DELETE FROM estadisticas_partido WHERE jugadora_id = ?', [id]);
        await connection.query('DELETE FROM equipo_jugadora WHERE jugadora_id = ?', [id]);
        await connection.query('DELETE FROM jugadora_torneo WHERE jugadora_id = ?', [id]);

        // 3. Eliminar la jugadora
        await connection.query('DELETE FROM jugadoras WHERE id = ?', [id]);

        // 4. Confirmar transacción
        await connection.commit();
        connection.release();

        res.status(200).json({ message: 'Jugadora y sus registros asociados eliminados correctamente' });

    } catch (error) {
        console.error(`Error al eliminar jugadora ${id}:`, error);
        if (connection) {
            await connection.rollback(); // Asegurar rollback en caso de error
            connection.release();
        }
        next(error);
    }
};


// --- Manejo de relaciones (Ejemplo: Torneos de una jugadora) ---

// @desc    Obtener torneos asignados a una jugadora
const getJugadoraTorneos = async (req, res, next) => {
    // ID validado
    const { id } = req.params; // ID de la jugadora
    try {
        const [torneos] = await pool.query(`
            SELECT t.*
            FROM torneos t
            JOIN jugadora_torneo jt ON t.id = jt.torneo_id
            WHERE jt.jugadora_id = ?
            ORDER BY t.fecha_inicio DESC
        `, [id]);
        res.json(torneos);
    } catch (error) {
        console.error(`Error al obtener torneos para jugadora ${id}:`, error);
        next(error);
    }
};

// @desc    Asignar una jugadora a un torneo
const assignJugadoraToTorneo = async (req, res, next) => {
    // IDs validados
    const { jugadoraId, torneoId } = req.params;
    const { notas } = req.body; // Notas opcionales (validar si es necesario)

    try {
        // Opcional: Verificar si la jugadora y el torneo existen antes de insertar
        // const [jugadoraCheck] = await pool.query('SELECT id FROM jugadoras WHERE id = ?', [jugadoraId]);
        // const [torneoCheck] = await pool.query('SELECT id FROM torneos WHERE id = ?', [torneoId]);
        // if (jugadoraCheck.length === 0 || torneoCheck.length === 0) { ... return 404 }

        await pool.query(
            'INSERT INTO jugadora_torneo (jugadora_id, torneo_id, notas) VALUES (?, ?, ?)',
            [jugadoraId, torneoId, notas || null]
        );
        res.status(201).json({ message: 'Jugadora asignada al torneo correctamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const err = new Error('La jugadora ya está asignada a este torneo');
            err.statusCode = 409; // Conflict
            return next(err);
        }
         if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             const err = new Error('La jugadora o el torneo especificado no existe.');
             err.statusCode = 404; // Not Found (o 400 Bad Request)
             return next(err);
         }
        console.error(`Error al asignar jugadora ${jugadoraId} a torneo ${torneoId}:`, error);
        next(error);
    }
};

// @desc    Eliminar asignación de una jugadora a un torneo
const removeJugadoraFromTorneo = async (req, res, next) => {
    // IDs validados
    const { jugadoraId, torneoId } = req.params;
    try {
        const [result] = await pool.query(
            'DELETE FROM jugadora_torneo WHERE jugadora_id = ? AND torneo_id = ?',
            [jugadoraId, torneoId]
        );

        if (result.affectedRows === 0) {
             const error = new Error('Asignación no encontrada');
             error.statusCode = 404;
             return next(error);
        }
        res.status(200).json({ message: 'Asignación eliminada correctamente' });
    } catch (error) {
        console.error(`Error al eliminar asignación de jugadora ${jugadoraId} a torneo ${torneoId}:`, error);
        next(error);
    }
};


module.exports = {
    getAllJugadoras,
    getJugadoraById,
    createJugadora,
    updateJugadora,
    deleteJugadora,
    getJugadoraTorneos,
    assignJugadoraToTorneo,
    removeJugadoraFromTorneo,
    // Añadir funciones similares para equipo_jugadora si es necesario
};