
const express = require('express');

const router = express.Router();

const personalController = require('../../controllers/personal/personalControllers');

// Obtener personal
router.get('/obtener', personalController.obtenerPersonal);

// Crear personal
router.post('/crear', personalController.crearPersonal);

// Editar personal
router.post('/editar/:id', personalController.editarPersonal);

// Iniciar sesión
router.post('/login', personalController.iniciarSesion);

module.exports = router;
