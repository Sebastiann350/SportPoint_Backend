
const express = require('express');

const router = express.Router();

const postulacionesController = require('../../controllers/postulaciones/postulacionesControllers');

// Crear postulación
router.post('/crear', postulacionesController.crearPostulacion);

// Responder postulación
router.post('/responder', postulacionesController.responderPostulacion);

// Obtener postulaciones de un usuario
router.get('/usuario/:usuarioId', postulacionesController.obtenerPostulacionesUsuario);

module.exports = router;
