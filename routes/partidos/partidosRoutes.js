const express = require('express');

const router = express.Router();

const partidosController = require('../../controllers/partidos/partidosControllers');

// Obtener partidos acordados
router.get('/acordados', partidosController.obtenerPartidosAcordados);

module.exports = router;