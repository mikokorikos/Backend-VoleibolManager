// controllers/torneoController.js
const pool = require('../config/db');
const { format } = require('date-fns');
// No necesitamos validationResult aquí

const formatDate = (date) => {
    if (!date) return null;
    try {
         if (date instanceof Date) {
             return format(date, 'yyyy-MM-dd');
         }
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
             return date.substring(0, 10);
        }
        return format(new Date(date), 'yyyy-MM-dd');
    } catch (e) {
        console.warn(`Fecha inválida recibida para formatear: ${date}`);
        return null;
    }
};

// @desc    Obtener todos los torneos
const getAllTorneos = async (req, res, next) => {
    try {
        // Podrías añadir validación para query params de filtros si los implementas
        const [rows] = await pool.query('SELECT * FROM torneos ORDER BY fecha_inicio DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener torneos:', error);
        next(error);
    }
};

// @desc    Obtener un torneo por ID
const getTorneoById = async (req, res, next) => {
    // ID validado
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM torneos WHERE id = ?', [id]);
        if (rows.length === 0) {
            const error = new Error('Torneo no encontrado');
            error.statusCode = 404;
            return next(error);
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(`Error al obtener torneo ${id}:`, error);
        next(error);
    }
};

// @desc    Crear un nuevo torneo
const createTorneo = async (req, res, next) => {
    // Body validado
    const { nombre, ubicacion, fecha_inicio, fecha_fin, descripcion, organizador, costo, notas } = req.body;
    const formattedFechaInicio = formatDate(fecha_inicio);
    const formattedFechaFin = formatDate(fecha_fin);
    try {
        const [result] = await pool.query(
            `INSERT INTO torneos (nombre, ubicacion, fecha_inicio, fecha_fin, descripcion, organizador, costo, notas, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [nombre, ubicacion, formattedFechaInicio, formattedFechaFin, descripcion, organizador, costo, notas]
        );
        const [newTorneo] = await pool.query('SELECT * FROM torneos WHERE id = ?', [result.insertId]);
        if (newTorneo.length > 0) {
            res.status(201).json(newTorneo[0]);
        } else {
            throw new Error("No se pudo recuperar el torneo después de la inserción.");
        }
    } catch (error) {
        console.error('Error al crear torneo:', error);
        // Podrías añadir manejo de ER_DUP_ENTRY si tienes campos únicos
        next(error);
    }
};

// @desc    Actualizar un torneo
const updateTorneo = async (req, res, next) => {
    // ID y Body validados
    const { id } = req.params;
    const { nombre, ubicacion, fecha_inicio, fecha_fin, descripcion, organizador, costo, notas } = req.body;
    const formattedFechaInicio = formatDate(fecha_inicio);
    const formattedFechaFin = formatDate(fecha_fin);
    try {
        // 1. Verificar si existe
        const [checkRows] = await pool.query('SELECT id FROM torneos WHERE id = ?', [id]);
        if (checkRows.length === 0) {
             const error = new Error('Torneo no encontrado para actualizar');
             error.statusCode = 404;
             return next(error);
        }
        // 2. Actualizar
        await pool.query(
            `UPDATE torneos SET nombre = ?, ubicacion = ?, fecha_inicio = ?, fecha_fin = ?, descripcion = ?, organizador = ?, costo = ?, notas = ?, ultima_actualizacion = NOW() WHERE id = ?`,
            [nombre, ubicacion, formattedFechaInicio, formattedFechaFin, descripcion, organizador, costo, notas, id]
        );
        // 3. Obtener y devolver actualizado
        const [updatedTorneo] = await pool.query('SELECT * FROM torneos WHERE id = ?', [id]);
         if (updatedTorneo.length > 0) {
            res.json(updatedTorneo[0]);
        } else {
             throw new Error("No se pudo recuperar el torneo después de la actualización.");
        }
    } catch (error) {
        console.error(`Error al actualizar torneo ${id}:`, error);
        next(error);
    }
};

// @desc    Eliminar un torneo
const deleteTorneo = async (req, res, next) => {
    // ID validado
    const { id } = req.params;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
         // 1. Verificar si existe
        const [checkRows] = await connection.query('SELECT id FROM torneos WHERE id = ?', [id]);
        if (checkRows.length === 0) {
            await connection.rollback();
            connection.release();
            const error = new Error('Torneo no encontrado para eliminar');
            error.statusCode = 404;
            return next(error);
        }
        // 2. Eliminar relaciones dependientes (o manejar con FK ON DELETE)
        await connection.query('DELETE FROM jugadora_torneo WHERE torneo_id = ?', [id]);
        // Decide qué hacer con los partidos: ¿eliminarlos o poner torneo_id a NULL?
        await connection.query('UPDATE partidos SET torneo_id = NULL WHERE torneo_id = ?', [id]); // O DELETE FROM partidos...

        // 3. Eliminar el torneo
        await connection.query('DELETE FROM torneos WHERE id = ?', [id]);
        // 4. Confirmar transacción
        await connection.commit();
        connection.release();

        res.status(200).json({ message: 'Torneo y sus relaciones eliminadas correctamente' });
    } catch (error) {
        console.error(`Error al eliminar torneo ${id}:`, error);
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        next(error);
    }
};

// --- Relaciones ---

// @desc    Obtener jugadoras asignadas a un torneo
const getTorneoJugadoras = async (req, res, next) => {
    // ID validado
    const { id } = req.params; // ID del torneo
    try {
        const [jugadoras] = await pool.query(`
            SELECT j.id, j.nombre, j.apellido_paterno, j.apellido_materno, j.categoria -- Selecciona solo las columnas necesarias
            FROM jugadoras j
            JOIN jugadora_torneo jt ON j.id = jt.jugadora_id
            WHERE jt.torneo_id = ?
            ORDER BY j.apellido_paterno, j.nombre ASC
        `, [id]);
        res.json(jugadoras);
    } catch (error) {
        console.error(`Error al obtener jugadoras para torneo ${id}:`, error);
        next(error);
    }
};


module.exports = {
    getAllTorneos,
    getTorneoById,
    createTorneo,
    updateTorneo,
    deleteTorneo,
    getTorneoJugadoras,
};