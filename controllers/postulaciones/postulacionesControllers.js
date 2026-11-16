
const postulacionesService = require('../../services/postulaciones/postulacionesService');

// =====================================================
// 1. CREAR POSTULACIÓN
// =====================================================

const crearPostulacion = async (req, res) => {
    try {
        const {
            avisoId,
            usuarioId,
            equipoId
        } = req.body;

        if (!avisoId || !usuarioId) {
            return res.status(400).json({
                mensaje: 'El aviso y el usuario son obligatorios'
            });
        }

        const postulacion = await postulacionesService.crearPostulacion({
            avisoId,
            usuarioId,
            equipoId
        });

        res.status(201).json({
            mensaje: 'Postulación creada correctamente',
            datos: postulacion
        });

    } catch (error) {
        console.error('Error al crear postulación:', error.message);

        const erroresValidacion = [
            'El aviso no está abierto',
            'Ya existe una postulación para este aviso'
        ];

        const esValidacion = erroresValidacion.includes(error.message);

        res.status(esValidacion ? 400 : 500).json({
            mensaje: 'Error al crear postulación',
            error: error.message
        });
    }
};

// =====================================================
// 2. RESPONDER POSTULACIÓN
// =====================================================

const responderPostulacion = async (req, res) => {
    try {
        const {
            postulacionId,
            usuarioId,
            respuesta
        } = req.body;

        if (!postulacionId || !usuarioId || !respuesta) {
            return res.status(400).json({
                mensaje: 'La postulación, el usuario y la respuesta son obligatorios'
            });
        }

        if (!['aceptada', 'rechazada'].includes(respuesta)) {
            return res.status(400).json({
                mensaje: 'La respuesta debe ser aceptada o rechazada'
            });
        }

        const postulacion = await postulacionesService.responderPostulacion(
            postulacionId,
            usuarioId,
            respuesta
        );

        res.status(200).json({
            mensaje: 'Postulación respondida correctamente',
            datos: postulacion
        });

    } catch (error) {
        console.error('Error al responder postulación:', error.message);

        const erroresValidacion = [
            'Solo el autor del aviso puede responder la postulación',
            'La postulación ya fue respondida',
            'La respuesta debe ser aceptada o rechazada'
        ];

        const esValidacion = erroresValidacion.includes(error.message);

        res.status(esValidacion ? 400 : 500).json({
            mensaje: 'Error al responder postulación',
            error: error.message
        });
    }
};

// =====================================================
// 3. OBTENER POSTULACIONES DE UN USUARIO
// =====================================================

const obtenerPostulacionesUsuario = async (req, res) => {
    try {
        const { usuarioId } = req.params;

        if (!usuarioId) {
            return res.status(400).json({
                mensaje: 'El usuario es obligatorio'
            });
        }

        const postulaciones = await postulacionesService.obtenerPostulacionesUsuario(usuarioId);

        res.status(200).json({
            mensaje: 'Postulaciones obtenidas correctamente',
            datos: postulaciones
        });

    } catch (error) {
        console.error('Error al obtener postulaciones:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener postulaciones',
            error: error.message
        });
    }
};

module.exports = {
    crearPostulacion,
    responderPostulacion,
    obtenerPostulacionesUsuario
};
