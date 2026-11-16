const supabase = require('../../database/supabase');

const buscarJugadores = async (zona) => {
    let consulta = supabase
        .from('perfiles')
        .select('id, nombre, zona')
        .eq('rol', 'jugador')
        .eq('activo', true);

    if (zona) {
        consulta = consulta.ilike('zona', `%${zona}%`);
    }

    const { data, error } = await consulta;

    if (error) {
        throw error;
    }

    return data;
};

module.exports = {buscarJugadores};