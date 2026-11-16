const express = require('express');
const router = express.Router();

const perfilController = require('../../controllers/perfiles/perfilControllers');

// Obtener todos los perfiles
router.get('/obtener', perfilController.obtenerPerfiles);

// Editar perfil
router.post('/editar', perfilController.editarPerfil);

// Deshabilitar cuenta
router.post('/deshabilitar', perfilController.deshabilitarPerfil);

module.exports = router;