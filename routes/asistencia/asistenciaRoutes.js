
const express = require('express');

const router = express.Router();

const asistenciaController = require('../../controllers/asistencia/asistenciaControllers');

// Marcar asistencia
router.post('/marcar', asistenciaController.marcarAsistencia);

module.exports = router;
