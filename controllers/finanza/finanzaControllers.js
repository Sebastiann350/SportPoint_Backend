
const finanzaService = require('../../services/finanza/finanzaService');

const obtenerResumen = async (req, res) => {
    try {
        const { clubId } = req.query;

        if (!clubId) {
            return res.status(400).json({
                mensaje: 'El ID del club es obligatorio'
            });
        }

        const resumen = await finanzaService.obtenerResumen(clubId);

        return res.status(200).json({
            mensaje: 'Resumen financiero obtenido correctamente',
            datos: resumen
        });

    } catch (error) {
        console.error('Error al obtener resumen financiero:', error.message);

        return res.status(500).json({
            mensaje: 'Error al obtener resumen financiero',
            error: error.message
        });
    }
};

const obtenerGastos = async (req, res) => {
    try {
        const { clubId } = req.query;

        if (!clubId) {
            return res.status(400).json({
                mensaje: 'El ID del club es obligatorio'
            });
        }

        const gastos = await finanzaService.obtenerGastos(clubId);

        return res.status(200).json({
            mensaje: 'Gastos obtenidos correctamente',
            datos: gastos
        });

    } catch (error) {
        console.error('Error al obtener gastos:', error.message);

        return res.status(500).json({
            mensaje: 'Error al obtener gastos',
            error: error.message
        });
    }
};

module.exports = {
    obtenerResumen,
    obtenerGastos
};
