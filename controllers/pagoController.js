// controllers/pagoController.js
const pool = require('../config/db');
const { format } = require('date-fns');
// NO necesitamos validationResult aquí

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

const getAllPagos = async (req, res, next) => {
    try {
        const { jugadoraId, fechaInicio, fechaFin, estado } = req.query; // Validar estos query params si se usan filtros complejos
        let query = `
            SELECT p.*, j.nombre AS jugadora_nombre, j.apellido_paterno AS jugadora_apellido
            FROM pagos p
            JOIN jugadoras j ON p.jugadora_id = j.id
        `;
        const params = [];
        const conditions = [];

        if (jugadoraId && /^\d+$/.test(jugadoraId)) { // Validar que sea numérico
            conditions.push('p.jugadora_id = ?');
            params.push(parseInt(jugadoraId, 10));
        }
        if (fechaInicio) {
            const formattedDate = formatDate(fechaInicio);
            if(formattedDate) {
                conditions.push('p.fecha_pago >= ?');
                params.push(formattedDate);
            }
        }
         if (fechaFin) {
            const formattedDate = formatDate(fechaFin);
            if(formattedDate) {
                conditions.push('p.fecha_pago <= ?');
                params.push(formattedDate);
            }
        }
        if (estado && ['pendiente', 'pagado', 'cancelado'].includes(estado.toLowerCase())) {
             conditions.push('LOWER(p.estado) = ?');
             params.push(estado.toLowerCase());
        }

        if(conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY p.fecha_pago DESC, p.fecha_creacion DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener pagos:', error);
        next(error);
    }
};

const getPagoById = async (req, res, next) => {
    // ID validado
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT p.*, j.nombre AS jugadora_nombre, j.apellido_paterno AS jugadora_apellido
            FROM pagos p
            JOIN jugadoras j ON p.jugadora_id = j.id
            WHERE p.id = ?
        `, [id]);
        if (rows.length === 0) {
            const error = new Error('Pago no encontrado');
            error.statusCode = 404;
            return next(error);
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(`Error al obtener pago ${id}:`, error);
        next(error);
    }
};

const createPago = async (req, res, next) => {
    // Body validado
    const { jugadora_id, tutor_id, concepto, monto, fecha_pago, metodo_pago, referencia, estado, notas, comprobante } = req.body;
    const formattedFechaPago = formatDate(fecha_pago);
    try {
        const [result] = await pool.query(
            `INSERT INTO pagos (jugadora_id, tutor_id, concepto, monto, fecha_pago, metodo_pago, referencia, estado, notas, comprobante, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [jugadora_id, tutor_id, concepto, monto, formattedFechaPago, metodo_pago, referencia, estado, notas, comprobante]
        );
        const [newPago] = await pool.query('SELECT * FROM pagos WHERE id = ?', [result.insertId]);
        if (newPago.length > 0) {
           res.status(201).json(newPago[0]);
        } else {
            throw new Error("No se pudo recuperar el pago después de la inserción.");
        }
    } catch (error) {
        console.error('Error al crear pago:', error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             const err = new Error('El ID de la jugadora o tutor proporcionado no existe.');
             err.statusCode = 400;
             return next(err);
         }
        next(error);
    }
};

const updatePago = async (req, res, next) => {
    // ID y Body validados
    const { id } = req.params;
    const { jugadora_id, tutor_id, concepto, monto, fecha_pago, metodo_pago, referencia, estado, notas, comprobante } = req.body;
    const formattedFechaPago = formatDate(fecha_pago);
    try {
        // 1. Verificar si existe
        const [checkRows] = await pool.query('SELECT id FROM pagos WHERE id = ?', [id]);
        if (checkRows.length === 0) {
             const error = new Error('Pago no encontrado para actualizar');
             error.statusCode = 404;
             return next(error);
        }
        // 2. Actualizar
        await pool.query(
            `UPDATE pagos SET jugadora_id = ?, tutor_id = ?, concepto = ?, monto = ?, fecha_pago = ?, metodo_pago = ?, referencia = ?, estado = ?, notas = ?, comprobante = ?, ultima_actualizacion = NOW() WHERE id = ?`,
            [jugadora_id, tutor_id, concepto, monto, formattedFechaPago, metodo_pago, referencia, estado, notas, comprobante, id]
        );
        // 3. Obtener y devolver actualizado
        const [updatedPago] = await pool.query('SELECT * FROM pagos WHERE id = ?', [id]);
        if (updatedPago.length > 0) {
             res.json(updatedPago[0]);
        } else {
             throw new Error("No se pudo recuperar el pago después de la actualización.");
        }
    } catch (error) {
        console.error(`Error al actualizar pago ${id}:`, error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             const err = new Error('El ID de la jugadora o tutor proporcionado no existe.');
             err.statusCode = 400;
             return next(err);
        }
        next(error);
    }
};

const deletePago = async (req, res, next) => {
    // ID validado
    const { id } = req.params;
    try {
        // 1. Verificar si existe
        const [checkRows] = await pool.query('SELECT id FROM pagos WHERE id = ?', [id]);
        if (checkRows.length === 0) {
             const error = new Error('Pago no encontrado para eliminar');
             error.statusCode = 404;
             return next(error);
        }
        // 2. Eliminar
        await pool.query('DELETE FROM pagos WHERE id = ?', [id]);
        // 3. Responder
        res.status(200).json({ message: 'Pago eliminado correctamente' });
    } catch (error) {
        console.error(`Error al eliminar pago ${id}:`, error);
        next(error);
    }
};

module.exports = { getAllPagos, getPagoById, createPago, updatePago, deletePago };