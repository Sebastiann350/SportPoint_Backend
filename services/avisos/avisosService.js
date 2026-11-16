const supabase = require('../../database/supabase');

// =====================================================
// 1. OBTENER AVISOS
// =====================================================

const obtenerAvisos = async (filtros = {}) => {

    let consulta = supabase
        .from('avisos')
        .select(`
            id,
            autor_id,
            tipo,
            equipo_id,
            club_id,
            zona,
            fecha,
            hora,
            lugares_faltantes,
            nota,
            estado
        `)
        .eq('estado', 'abierto')
        .order('fecha', { ascending: true });

    if (filtros.tipo) {
        consulta = consulta.eq('tipo', filtros.tipo);
    }

    if (filtros.zona) {
        consulta = consulta.ilike('zona', `%${filtros.zona}%`);
    }

    if (filtros.clubId) {
        consulta = consulta.eq('club_id', filtros.clubId);
    }

    const { data, error } = await consulta;

    if (error) {
        throw error;
    }

    return data;
};


// =====================================================
// 2. CREAR AVISO
// =====================================================

const crearAviso = async (aviso) => {

    const { data, error } = await supabase
        .from('avisos')
        .insert({
            autor_id: aviso.autorId,
            tipo: aviso.tipo,
            equipo_id: aviso.equipoId || null,
            club_id: aviso.clubId || null,
            zona: aviso.zona || null,
            fecha: aviso.fecha,
            hora: aviso.hora,
            lugares_faltantes: aviso.lugaresFaltantes,
            nota: aviso.nota || null,
            estado: 'abierto'
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};


// =====================================================
// 3. ELIMINAR AVISO
// =====================================================

const eliminarAviso = async (avisoId, usuarioId) => {

    const { data: aviso, error: errorAviso } = await supabase
        .from('avisos')
        .select('id, autor_id')
        .eq('id', avisoId)
        .single();

    if (errorAviso) {
        throw errorAviso;
    }

    if (aviso.autor_id !== usuarioId) {
        throw new Error('Solo el autor del aviso puede eliminarlo');
    }

    const { data, error } = await supabase
        .from('avisos')
        .delete()
        .eq('id', avisoId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};


module.exports = {obtenerAvisos, crearAviso, eliminarAviso};