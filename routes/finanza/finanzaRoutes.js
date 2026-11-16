
const express = require('express');

const router = express.Router();

const finanzaController = require('../../controllers/finanza/finanzaControllers');

// Obtener resumen financiero
router.get('/resumen', finanzaController.obtenerResumen);

// Obtener gastos del club
router.get('/gastos', finanzaController.obtenerGastos);

module.exports = router;
