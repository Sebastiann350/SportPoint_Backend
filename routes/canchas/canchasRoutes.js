const express = require('express');

const router = express.Router();

const canchasController = require('../../controllers/canchas/canchasControllers');

// Obtener canchas.
router.get('/obtener', canchasController.obtenerCanchas);

// Crear cancha.
router.post('/crear', canchasController.crearCancha);

// Modificar datos de una cancha.
router.post('/actualizar', canchasController.actualizarCancha);

// Activar o desactivar una cancha.
router.post('/actualizar-estado', canchasController.actualizarEstadoCancha);

module.exports = router;