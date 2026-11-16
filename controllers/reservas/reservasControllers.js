
const reservasService = require('../../services/reservas/reservasService');

// Obtener reservas del club.
const obtenerReservas = async (req, res) => {
    try {
        const {
            clubId,
            canchaId,
            fecha,
            creadoPor,
            pagada
        } = req.query;

        if (!clubId) {
            return res.status(400).json({
                mensaje: 'El identificador del club es obligatorio'
            });
        }

        const reservas = await reservasService.obtenerReservas(
            clubId,
            {
                canchaId,
                fecha,
                creadoPor,
                pagada: pagada !== undefined
                    ? pagada === 'true'
                    : undefined
            }
        );

        return res.status(200).json({
            mensaje: 'Reservas obtenidas correctamente',
            datos: reservas
        });

    } catch (error) {
        console.error('Error al obtener reservas:', error.message);

        return res.status(500).json({
            mensaje: 'Error al obtener reservas',
            error: error.message
        });
    }
};

// Crear reserva.
const crearReserva = async (req, res) => {
    try {
        const {
            partidoId,
            canchaId,
            fecha,
            hora,
            precio,
            pagada,
            creadoPor
        } = req.body;

        console.log('ID recibido para creadoPor:', creadoPor);

        if (!partidoId || !canchaId || !fecha || !hora ||
            precio === undefined) {
            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios para crear la reserva'
            });
        }

        if (!creadoPor) {
            return res.status(400).json({
                mensaje: 'No se recibió el identificador del administrador'
            });
        }

        if (precio < 0) {
            return res.status(400).json({
                mensaje: 'El precio no puede ser negativo'
            });
        }

        if (pagada !== undefined && typeof pagada !== 'boolean') {
            return res.status(400).json({
                mensaje: 'El campo pagada debe ser true o false'
            });
        }

        const reserva = await reservasService.crearReserva({
            partidoId,
            canchaId,
            fecha,
            hora,
            precio,
            pagada,
            creadoPor
        });

        return res.status(201).json({
            mensaje: 'Reserva creada correctamente',
            datos: reserva
        });

    } catch (error) {
        console.error('Error al crear reserva:', error.message);

        if (error.code === 'HORARIO_OCUPADO') {
            return res.status(409).json({
                mensaje: error.message
            });
        }

        return res.status(500).json({
            mensaje: 'Error al crear reserva',
            error: error.message
        });
    }
};

// Actualizar estado de pago.
const actualizarEstadoReserva = async (req, res) => {
    try {
        const { reservaId, pagada } = req.body;

        if (!reservaId || pagada === undefined) {
            return res.status(400).json({
                mensaje: 'La reserva y el estado de pago son obligatorios'
            });
        }

        if (typeof pagada !== 'boolean') {
            return res.status(400).json({
                mensaje: 'El campo pagada debe ser true o false'
            });
        }

        const reserva = await reservasService.actualizarEstadoReserva(
            reservaId,
            pagada
        );

        return res.status(200).json({
            mensaje: 'Reserva marcada como pagada correctamente',
            datos: reserva
        });

    } catch (error) {
        console.error('Error al actualizar estado de reserva:', error.message);

        if (
            error.code === 'ESTADO_PAGO_NO_PERMITIDO' ||
            error.code === 'RESERVA_NO_DISPONIBLE'
        ) {
            return res.status(409).json({
                mensaje: error.message
            });
        }

        return res.status(500).json({
            mensaje: 'Error al actualizar estado de reserva',
            error: error.message
        });
    }
};

module.exports = {
    obtenerReservas,
    crearReserva,
    actualizarEstadoReserva
};
