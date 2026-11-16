
const gastosService = require('../../services/gastos/gastosService');

// =====================================================
// 1. OBTENER GASTOS
// =====================================================

const obtenerGastos = async (req, res) => {
    try {
        const { clubId } = req.query;

        if (!clubId) {
            return res.status(400).json({
                mensaje: 'El ID del club es obligatorio'
            });
        }

        const gastos = await gastosService.obtenerGastos(clubId);

        res.status(200).json({
            mensaje: 'Gastos obtenidos correctamente',
            datos: gastos
        });

    } catch (error) {
        console.error('Error al obtener gastos:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener gastos',
            error: error.message
        });
    }
};

// =====================================================
// 2. CREAR GASTO
// =====================================================

const crearGasto = async (req, res) => {
    try {
        const {
            clubId,
            concepto,
            monto,
            fecha,
            cargadoPor
        } = req.body;

        if (!clubId || !concepto || monto === undefined || !fecha || !cargadoPor) {
            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios para crear el gasto'
            });
        }

        if (typeof monto !== 'number' || monto <= 0) {
            return res.status(400).json({
                mensaje: 'El monto debe ser un número mayor a cero'
            });
        }

        const gasto = await gastosService.crearGasto({
            clubId,
            concepto,
            monto,
            fecha,
            cargadoPor
        });

        res.status(201).json({
            mensaje: 'Gasto creado correctamente',
            datos: gasto
        });

    } catch (error) {
        console.error('Error al crear gasto:', error.message);

        res.status(500).json({
            mensaje: 'Error al crear gasto',
            error: error.message
        });
    }
};

module.exports = {obtenerGastos, crearGasto};
