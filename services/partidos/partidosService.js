
const supabase = require('../../database/supabase');

const {
    sincronizarPartidosAceptados
} = require('../postulaciones/postulacionesService');

// Obtener partidos acordados que todavía no tienen una reserva.
const obtenerPartidosAcordados = async (clubId) => {

    // Recuperar los partidos de postulaciones aceptadas.
    await sincronizarPartidosAceptados();

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

    // Obtener solamente los partidos acordados de Padel Norte.
    let consulta = supabase
        .from('partidos')
        .select(`
            id,
            equipo_local_id,
            equipo_visitante_id,
            aviso_id,
            club_id,
            fecha,
            hora,
            estado,
            creado_en
        `)
        .eq('estado', 'acordado')
        .eq('club_id', clubId)
        .order('fecha', { ascending: true });

    const { data: partidos, error } = await consulta;

    if (error) {
        throw error;
    }

    // Excluir los partidos que ya tienen una reserva.
    return (partidos || []).filter(
        partido => !partidosReservados.has(partido.id)
    );
};

module.exports = { obtenerPartidosAcordados };
