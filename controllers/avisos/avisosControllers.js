const avisosService = require('../../services/avisos/avisosService');

// =====================================================
// 1. OBTENER AVISOS
// =====================================================

const obtenerAvisos = async (req, res) => {
    try {
        const { tipo, zona, clubId } = req.query;

        const avisos = await avisosService.obtenerAvisos({
            tipo,
            zona,
            clubId
        });

        res.status(200).json({
            mensaje: 'Avisos obtenidos correctamente',
            datos: avisos
        });

    } catch (error) {
        console.error('Error al obtener avisos:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener avisos',
            error: error.message
        });
    }
};


// =====================================================
// 2. CREAR AVISO
// =====================================================

const crearAviso = async (req, res) => {
    try {
        const {
            autorId,
            tipo,
            equipoId,
            clubId,
            zona,
            fecha,
            hora,
            lugaresFaltantes,
            nota
        } = req.body;

        if (!autorId || !tipo || !fecha || !hora || lugaresFaltantes === undefined) {
            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios para crear el aviso'
            });
        }

        if (!['jugador', 'equipo'].includes(tipo)) {
            return res.status(400).json({
                mensaje: 'El tipo de aviso debe ser jugador o equipo'
            });
        }

        if (lugaresFaltantes < 1) {
            return res.status(400).json({
                mensaje: 'Los lugares faltantes deben ser mayores a cero'
            });
        }

        if (tipo === 'equipo' && !equipoId) {
            return res.status(400).json({
                mensaje: 'Para un aviso de equipo es obligatorio indicar el equipo'
            });
        }

        const aviso = await avisosService.crearAviso({
            autorId,
            tipo,
            equipoId,
            clubId,
            zona,
            fecha,
            hora,
            lugaresFaltantes,
            nota
        });

        res.status(201).json({
            mensaje: 'Aviso creado correctamente',
            datos: aviso
        });

    } catch (error) {
        console.error('Error al crear aviso:', error.message);

        res.status(500).json({
            mensaje: 'Error al crear aviso',
            error: error.message
        });
    }
};


// =====================================================
// 3. ELIMINAR AVISO
// =====================================================

const eliminarAviso = async (req, res) => {
    try {
        const { avisoId, usuarioId } = req.body;

        if (!avisoId || !usuarioId) {
            return res.status(400).json({
                mensaje: 'El aviso y el usuario son obligatorios'
            });
        }

        const aviso = await avisosService.eliminarAviso(avisoId, usuarioId);

        res.status(200).json({
            mensaje: 'Aviso eliminado correctamente',
            datos: aviso
        });

    } catch (error) {
        console.error('Error al eliminar aviso:', error.message);

        if (error.message === 'Solo el autor del aviso puede eliminarlo') {
            return res.status(403).json({
                mensaje: 'No tenés permiso para eliminar este aviso',
                error: error.message
            });
        }

        res.status(500).json({
            mensaje: 'Error al eliminar aviso',
            error: error.message
        });
    }
};


module.exports = {obtenerAvisos, crearAviso, eliminarAviso};