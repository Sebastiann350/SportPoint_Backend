
const equiposService = require('../../services/equipos/equiposService');

const crearEquipo = async (req, res) => {
    try {
        const { nombre, usuarioId } = req.body;

        if (!nombre || !usuarioId) {
            return res.status(400).json({
                mensaje: 'El nombre del equipo y el usuario son obligatorios'
            });
        }

        const equipo = await equiposService.crearEquipo(nombre, usuarioId);

        res.status(201).json({
            mensaje: 'Equipo creado correctamente',
            datos: equipo
        });

    } catch (error) {
        console.error('Error al crear equipo:', error.message);

        res.status(500).json({
            mensaje: 'Error al crear equipo',
            error: error.message
        });
    }
};

const obtenerMiEquipo = async (req, res) => {
    try {
        const { usuarioId } = req.query;

        if (!usuarioId) {
            return res.status(400).json({
                mensaje: 'El usuario es obligatorio'
            });
        }

        const equipo = await equiposService.obtenerMiEquipo(usuarioId);

        if (!equipo) {
            return res.status(404).json({
                mensaje: 'El usuario no pertenece a ningún equipo'
            });
        }

        res.status(200).json({
            mensaje: 'Equipo obtenido correctamente',
            datos: equipo
        });

    } catch (error) {
        console.error('Error al obtener equipo:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener equipo',
            error: error.message
        });
    }
};

const gestionarIntegrante = async (req, res) => {
    try {
        const { equipoId, usuarioId, integranteId, accion } = req.body;

        if (!equipoId || !usuarioId || !integranteId || !accion) {
            return res.status(400).json({
                mensaje: 'Todos los datos son obligatorios: equipoId, usuarioId, integranteId y accion'
            });
        }

        if (!['agregar', 'quitar'].includes(accion)) {
            return res.status(400).json({
                mensaje: 'La acción debe ser agregar o quitar'
            });
        }

        const resultado = await equiposService.gestionarIntegrante(
            equipoId,
            usuarioId,
            integranteId,
            accion
        );

        res.status(200).json({
            mensaje: accion === 'agregar'
                ? 'Integrante agregado correctamente'
                : 'Integrante quitado correctamente',
            datos: resultado
        });

    } catch (error) {
        console.error('Error al gestionar integrante:', error.message);

        const erroresValidacion = [
            'Solo el capitan del equipo puede gestionar integrantes',
            'No podes gestionar tu propia membresia',
            'El jugador ya pertenece a este equipo',
            'El equipo ya tiene sus dos integrantes',
            'El jugador no pertenece a este equipo',
            'Accion no valida. Utiliza agregar o quitar'
        ];

        const esValidacion = erroresValidacion.includes(error.message);

        res.status(esValidacion ? 400 : 500).json({
            mensaje: 'Error al gestionar integrante',
            error: error.message
        });
    }
};

module.exports = {crearEquipo, obtenerMiEquipo, gestionarIntegrante};
