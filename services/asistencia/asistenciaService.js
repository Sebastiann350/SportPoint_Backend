
const supabase = require('../../database/supabase');

// =====================================================
// 1. MARCAR ASISTENCIA
// =====================================================

const marcarAsistencia = async (asistencia) => {

    const { data, error } = await supabase
        .from('asistencias')
        .upsert({
            partido_id: asistencia.partidoId,
            jugador_id: asistencia.jugadorId,
            asistio: asistencia.asistio
        }, {
            onConflict: 'partido_id,jugador_id'
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

module.exports = {marcarAsistencia};
