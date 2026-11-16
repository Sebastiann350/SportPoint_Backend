const supabase = require('../../database/supabase');

const obtenerPerfiles = async () => {
    const { data, error } = await supabase
        .from('perfiles')
        .select('*');

    if (error) {
        throw error;
    }

    return data;
};

const editarPerfil = async (idUsuario, datos) => {
    const { data, error } = await supabase
        .from('perfiles')
        .update({
            nombre: datos.nombre,
            zona: datos.zona
        })
        .eq('id', idUsuario)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};
const deshabilitarPerfil = async (idUsuario) => {
    const { data, error } = await supabase
        .from('perfiles')
        .update({
            activo: false
        })
        .eq('id', idUsuario)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};


module.exports = {editarPerfil, deshabilitarPerfil, obtenerPerfiles};