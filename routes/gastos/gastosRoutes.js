
const express = require('express');

const router = express.Router();

const gastosController = require('../../controllers/gastos/gastosControllers');

// Obtener gastos
router.get('/obtener', gastosController.obtenerGastos);

// Crear gasto
router.post('/crear', gastosController.crearGasto);

module.exports = router;
