
const supabase = require('../../database/supabase');

// Obtener las canchas pertenecientes a un club.
const obtenerCanchas = async (clubId) => {

    const { data, error } = await supabase
        .from('canchas')
        .select(`
            id,
            club_id,
            nombre,
            tipo,
            precio_hora,
            activa,
            creado_en
        `)
        .eq('club_id', clubId)
        .order('nombre', { ascending: true });

    if (error) {
        throw error;
    }

    return data;
};

// Crear una cancha.
const crearCancha = async (cancha) => {

    const { data, error } = await supabase
        .from('canchas')
        .insert({
            club_id: cancha.clubId,
            nombre: cancha.nombre,
            tipo: cancha.tipo,
            precio_hora: cancha.precioHora,
            activa: true
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

// Modificar los datos de una cancha.
const actualizarCancha = async (canchaId, cancha) => {

    const { data, error } = await supabase
        .from('canchas')
        .update({
            nombre: cancha.nombre,
            tipo: cancha.tipo,
            precio_hora: cancha.precioHora
        })
        .eq('id', canchaId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

// Activar o desactivar una cancha.
const actualizarEstadoCancha = async (canchaId, activa) => {

    const { data, error } = await supabase
        .from('canchas')
        .update({ activa })
        .eq('id', canchaId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

module.exports = {
    obtenerCanchas,
    crearCancha,
    actualizarCancha,
    actualizarEstadoCancha
};
