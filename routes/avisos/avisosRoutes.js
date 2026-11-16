
const express = require('express');

const router = express.Router();

const avisosController = require('../../controllers/avisos/avisosControllers');

// Obtener avisos
router.get('/obtener', avisosController.obtenerAvisos);

// Crear aviso
router.post('/crear', avisosController.crearAviso);

// Eliminar aviso
router.post('/eliminar', avisosController.eliminarAviso);

module.exports = router;
