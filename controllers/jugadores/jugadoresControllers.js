const jugadoresService = require('../../services/jugadores/jugadoresService');

const buscarJugadores = async (req, res) => {
    try {
        const { zona } = req.query;

        const jugadores = await jugadoresService.buscarJugadores(zona);

        res.status(200).json({
            mensaje: 'Jugadores obtenidos correctamente',
            datos: jugadores
        });

    } catch (error) {
        console.error('Error al buscar jugadores:', error.message);

        res.status(500).json({
            mensaje: 'Error al buscar jugadores',
            error: error.message
        });
    }
};

module.exports = {buscarJugadores};