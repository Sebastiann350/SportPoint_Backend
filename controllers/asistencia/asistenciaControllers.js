
const asistenciaService = require('../../services/asistencia/asistenciaService');

// =====================================================
// 1. MARCAR ASISTENCIA
// =====================================================

const marcarAsistencia = async (req, res) => {
    try {
        const {
            partidoId,
            jugadorId,
            asistio
        } = req.body;

        if (!partidoId || !jugadorId || asistio === undefined) {
            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios para marcar la asistencia'
            });
        }

        if (typeof asistio !== 'boolean') {
            return res.status(400).json({
                mensaje: 'El campo asistio debe ser true o false'
            });
        }

        const asistencia = await asistenciaService.marcarAsistencia({
            partidoId,
            jugadorId,
            asistio
        });

        res.status(201).json({
            mensaje: 'Asistencia registrada correctamente',
            datos: asistencia
        });

    } catch (error) {
        console.error('Error al marcar asistencia:', error.message);

        res.status(500).json({
            mensaje: 'Error al marcar asistencia',
            error: error.message
        });
    }
};

module.exports = {marcarAsistencia};
