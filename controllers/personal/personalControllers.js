
const personalService = require('../../services/personal/personalService');

// Obtener personal perteneciente a un club.
const obtenerPersonal = async (req, res) => {
    try {
        const { clubId } = req.query;

        if (!clubId) {
            return res.status(400).json({
                mensaje: 'El ID del club es obligatorio'
            });
        }

        const personal = await personalService.obtenerPersonal(clubId);

        return res.status(200).json({
            mensaje: 'Personal obtenido correctamente',
            datos: personal
        });

    } catch (error) {
        console.error('Error al obtener personal:', error.message);

        return res.status(500).json({
            mensaje: 'Error al obtener personal',
            error: error.message
        });
    }
};

// Crear un integrante del personal.
const crearPersonal = async (req, res) => {
    try {
        const {
            clubId,
            nombre,
            apellido,
            dni,
            telefono,
            cargo,
            rol,
            crearCuenta,
            email,
            password
        } = req.body;

        if (!clubId || !nombre || !apellido || !dni || !cargo || !rol) {
            return res.status(400).json({
                mensaje: 'Faltan completar datos obligatorios del personal'
            });
        }

        const personal = await personalService.crearPersonal({
            clubId,
            nombre,
            apellido,
            dni,
            telefono,
            cargo,
            rol,
            crearCuenta,
            email,
            password
        });

        return res.status(201).json({
            mensaje: 'Personal registrado correctamente',
            datos: personal
        });

    } catch (error) {
        console.error('Error al crear personal:', error.message);

        return res.status(400).json({
            mensaje: error.message
        });
    }
};

// Editar un integrante del personal.
const editarPersonal = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nombre,
            apellido,
            dni,
            telefono,
            cargo,
            rol,
            activo
        } = req.body;

        if (!id || !nombre || !apellido || !dni || !cargo || !rol) {
            return res.status(400).json({
                mensaje: 'Faltan completar datos obligatorios del personal'
            });
        }

        if (typeof activo !== 'boolean') {
            return res.status(400).json({
                mensaje: 'El estado del personal es obligatorio'
            });
        }

        const personal = await personalService.editarPersonal(id, {
            nombre,
            apellido,
            dni,
            telefono,
            cargo,
            rol,
            activo
        });

        return res.status(200).json({
            mensaje: 'Personal actualizado correctamente',
            datos: personal
        });

    } catch (error) {
        console.error('Error al editar personal:', error.message);

        return res.status(400).json({
            mensaje: error.message
        });
    }
};

// Iniciar sesión de un integrante del personal.
const iniciarSesion = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                mensaje: 'El email y la contraseña son obligatorios'
            });
        }

        const personal = await personalService.iniciarSesion(email, password);

        return res.status(200).json({
            mensaje: 'Inicio de sesión exitoso',
            datos: personal
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);

        return res.status(401).json({
            mensaje: error.message
        });
    }
};

module.exports = { obtenerPersonal, crearPersonal, editarPersonal, iniciarSesion };
