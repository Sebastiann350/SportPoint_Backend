const perfilService = require('../../services/perfiles/perfilService');

const obtenerPerfiles = async (req, res) => {
    try {
        const perfiles = await perfilService.obtenerPerfiles();

        res.status(200).json({
            mensaje: 'Perfiles obtenidos correctamente',
            datos: perfiles
        });

    } catch (error) {
        console.error('Error al obtener perfiles:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener los perfiles',
            error: error.message
        });
    }
};

const editarPerfil = async (req, res) => {
    try {
        const { idUsuario, nombre, zona } = req.body;

        const perfil = await perfilService.editarPerfil(idUsuario, {
            nombre,
            zona
        });

        res.status(200).json({
            mensaje: 'Perfil actualizado correctamente',
            datos: perfil
        });

    } catch (error) {
        console.error('Error al editar perfil:', error.message);

        res.status(500).json({
            mensaje: 'Error al editar el perfil',
            error: error.message
        });
    }
};

const deshabilitarPerfil = async (req, res) => {
    try {
        const { idUsuario } = req.body;

        const perfil = await perfilService.deshabilitarPerfil(idUsuario);

        res.status(200).json({
            mensaje: 'Cuenta deshabilitada correctamente',
            datos: perfil
        });

    } catch (error) {
        console.error('Error al deshabilitar la cuenta:', error.message);

        res.status(500).json({
            mensaje: 'Error al deshabilitar la cuenta',
            error: error.message
        });
    }
};

module.exports = {obtenerPerfiles, deshabilitarPerfil, editarPerfil};