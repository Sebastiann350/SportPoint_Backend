const express = require('express');

const router = express.Router();

const reservasController = require('../../controllers/reservas/reservasControllers');

// Obtener reservas
router.get('/obtener', reservasController.obtenerReservas);

// Crear reserva
router.post('/crear', reservasController.crearReserva);

// Actualizar estado de pago
router.post('/actualizar-estado', reservasController.actualizarEstadoReserva);

module.exports = router;