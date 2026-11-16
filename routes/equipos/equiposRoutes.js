
const express = require('express');

const router = express.Router();

const equiposController = require('../../controllers/equipos/equiposControllers');

router.post('/crear', equiposController.crearEquipo);

router.get('/mi-equipo', equiposController.obtenerMiEquipo);

router.post('/gestionar-integrante', equiposController.gestionarIntegrante);

module.exports = router;
