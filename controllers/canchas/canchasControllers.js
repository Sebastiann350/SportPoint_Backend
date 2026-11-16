const canchasService = require('../../services/canchas/canchasService');

// 1. Obtener canchas.
const obtenerCanchas = async (req, res) => {
    try {
        const { clubId } = req.query;

        if (!clubId) {
            return res.status(400).json({
                mensaje: 'El club es obligatorio'
            });
        }

        const canchas = await canchasService.obtenerCanchas(clubId);

        return res.status(200).json({
            mensaje: 'Canchas obtenidas correctamente',
            datos: canchas
        });

    } catch (error) {
        console.error('Error al obtener canchas:', error.message);

        return res.status(500).json({
            mensaje: 'Error al obtener canchas',
            error: error.message
        });
    }
};

// 2. Crear cancha.
const crearCancha = async (req, res) => {
    try {
        const {
            clubId,
            nombre,
            tipo,
            precioHora
        } = req.body;

        if (!clubId || !nombre || !tipo || precioHora === undefined) {
            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios para crear la cancha'
            });
        }

        if (Number(precioHora) < 0 || !Number.isFinite(Number(precioHora))) {
            return res.status(400).json({
                mensaje: 'El precio por hora debe ser un número válido y no negativo'
            });
        }

        const cancha = await canchasService.crearCancha({
            clubId,
            nombre,
            tipo,
            precioHora: Number(precioHora)
        });

        return res.status(201).json({
            mensaje: 'Cancha creada correctamente',
            datos: cancha
        });

    } catch (error) {
        console.error('Error al crear cancha:', error.message);

        return res.status(500).json({
            mensaje: 'Error al crear cancha',
            error: error.message
        });
    }
};

// 3. Modificar datos de una cancha.
const actualizarCancha = async (req, res) => {
    try {
        const { canchaId } = req.body;
        const { nombre, tipo, precioHora } = req.body;

        if (!canchaId || !nombre || !tipo || precioHora === undefined) {
            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios para modificar la cancha'
            });
        }

        if (!Number.isFinite(Number(precioHora)) || Number(precioHora) < 0) {
            return res.status(400).json({
                mensaje: 'El precio por hora debe ser un número válido y no negativo'
            });
        }

        const cancha = await canchasService.actualizarCancha(
            canchaId,
            {
                nombre,
                tipo,
                precioHora: Number(precioHora)
            }
        );

        return res.status(200).json({
            mensaje: 'Cancha actualizada correctamente',
            datos: cancha
        });

    } catch (error) {
        console.error('Error al actualizar cancha:', error.message);

        return res.status(500).json({
            mensaje: 'Error al actualizar cancha',
            error: error.message
        });
    }
};

// 4. Activar o desactivar una cancha.
const actualizarEstadoCancha = async (req, res) => {
    try {
        const { canchaId, activa } = req.body;

        if (!canchaId || typeof activa !== 'boolean') {
            return res.status(400).json({
                mensaje: 'Se necesita el ID de la cancha y su nuevo estado'
            });
        }

        const cancha = await canchasService.actualizarEstadoCancha(
            canchaId,
            activa
        );

        return res.status(200).json({
            mensaje: activa
                ? 'Cancha activada correctamente'
                : 'Cancha desactivada correctamente',
            datos: cancha
        });

    } catch (error) {
        console.error('Error al actualizar estado de cancha:', error.message);

        return res.status(500).json({
            mensaje: 'Error al actualizar estado de cancha',
            error: error.message
        });
    }
};

module.exports = {
    obtenerCanchas,
    crearCancha,
    actualizarCancha,
    actualizarEstadoCancha
};
