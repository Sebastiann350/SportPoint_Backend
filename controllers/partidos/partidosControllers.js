const partidosService = require('../../services/partidos/partidosService');

// Obtener partidos acordados de un club.
const obtenerPartidosAcordados = async (req, res) => {
    try {

        const { clubId } = req.query;

        if (!clubId) {
            return res.status(400).json({
                mensaje: 'El identificador del club es obligatorio'
            });
        }

        const partidos = await partidosService.obtenerPartidosAcordados(clubId);

        res.status(200).json({
            mensaje: 'Partidos acordados obtenidos correctamente',
            datos: partidos
        });

    } catch (error) {
        console.error('Error al obtener partidos acordados:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener partidos acordados',
            error: error.message
        });
    }
};

module.exports = { obtenerPartidosAcordados };