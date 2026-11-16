const express = require('express');

const router = express.Router();

const jugadorController = require('../../controllers/jugadores/jugadoresControllers');

router.get('/buscar', jugadorController.buscarJugadores);

module.exports = router;