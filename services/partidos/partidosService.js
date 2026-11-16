const supabase = require('../../database/supabase');

// Obtener partidos acordados que todavía no tienen una reserva.
const obtenerPartidosAcordados = async (clubId) => {

    // Obtener los partidos que ya tienen una reserva.
    const { data: reservas, error: errorReservas } = await supabase
        .from('reservas')
        .select('partido_id');

    if (errorReservas) {
        throw errorReservas;
    }

    // Crear una lista de los IDs de partidos reservados.
    const partidosReservados = new Set(
        (reservas || []).map(reserva => reserva.partido_id)
    );

    // Obtener solamente los partidos acordados.
    const { data: partidos, error } = await supabase
        .from('partidos')
        .select(`
            id,
            equipo_local_id,
            equipo_visitante_id,
            aviso_id,
            fecha,
            hora,
            estado,
            creado_en
        `)
        .eq('estado', 'acordado')
        .order('fecha', { ascending: true });

    if (error) {
        throw error;
    }

    // Excluir los partidos que ya tienen una reserva.
    return (partidos || []).filter(
        partido => !partidosReservados.has(partido.id)
    );
};

module.exports = { obtenerPartidosAcordados };