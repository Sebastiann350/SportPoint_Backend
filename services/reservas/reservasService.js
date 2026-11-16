
const supabase = require('../../database/supabase');

// Obtener reservas pertenecientes a un club.
const obtenerReservas = async (clubId, filtros = {}) => {

    const { data: canchas, error: errorCanchas } = await supabase
        .from('canchas')
        .select('id, nombre')
        .eq('club_id', clubId);

    if (errorCanchas) {
        throw errorCanchas;
    }

    if (!canchas || canchas.length === 0) {
        return [];
    }

    const nombresCanchas = {};

    canchas.forEach(cancha => {
        nombresCanchas[cancha.id] = cancha.nombre;
    });

    const idsCanchas = canchas.map(cancha => cancha.id);

    let consulta = supabase
        .from('reservas')
        .select(`
            id,
            partido_id,
            cancha_id,
            fecha,
            hora,
            precio,
            pagada,
            fecha_pago,
            creado_por,
            creado_en
        `)
        .in('cancha_id', idsCanchas)
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true });

    if (filtros.canchaId) {
        consulta = consulta.eq('cancha_id', filtros.canchaId);
    }

    if (filtros.fecha) {
        consulta = consulta.eq('fecha', filtros.fecha);
    }

    if (filtros.creadoPor) {
        consulta = consulta.eq('creado_por', filtros.creadoPor);
    }

    if (filtros.pagada !== undefined) {
        consulta = consulta.eq('pagada', filtros.pagada);
    }

    const { data: reservas, error } = await consulta;

    if (error) {
        throw error;
    }

    if (!reservas || reservas.length === 0) {
        return [];
    }

    // Obtener los partidos relacionados con las reservas.
    const idsPartidos = [
        ...new Set(
            reservas
                .map(reserva => reserva.partido_id)
                .filter(Boolean)
        )
    ];

    let partidos = [];

    if (idsPartidos.length > 0) {
        const { data, error: errorPartidos } = await supabase
            .from('partidos')
            .select(`
                id,
                equipo_local_id,
                equipo_visitante_id
            `)
            .in('id', idsPartidos);

        if (errorPartidos) {
            throw errorPartidos;
        }

        partidos = data || [];
    }

    // Obtener los IDs de todos los equipos involucrados.
    const idsEquipos = [
        ...new Set(
            partidos.flatMap(partido => [
                partido.equipo_local_id,
                partido.equipo_visitante_id
            ]).filter(Boolean)
        )
    ];

    let equipos = [];

    if (idsEquipos.length > 0) {
        const { data, error: errorEquipos } = await supabase
            .from('equipos')
            .select('id, nombre')
            .in('id', idsEquipos);

        if (errorEquipos) {
            throw errorEquipos;
        }

        equipos = data || [];
    }

    // Preparar los nombres para encontrarlos rápidamente.
    const nombresEquipos = {};

    equipos.forEach(equipo => {
        nombresEquipos[equipo.id] = equipo.nombre;
    });

    const partidosPorId = {};

    partidos.forEach(partido => {
        partidosPorId[partido.id] = partido;
    });

    // Devolver cada reserva con su cancha y sus dos equipos.
    return reservas.map(reserva => {
        const partido = partidosPorId[reserva.partido_id];

        return {
            ...reserva,
            cancha_nombre:
                nombresCanchas[reserva.cancha_id] || 'Sin nombre',

            equipo_local_nombre: partido
                ? nombresEquipos[partido.equipo_local_id] || 'Sin equipo'
                : 'Sin equipo',

            equipo_visitante_nombre: partido
                ? nombresEquipos[partido.equipo_visitante_id] || 'Sin equipo'
                : 'Sin equipo'
        };
    });
};

// Crear reserva.
const crearReserva = async (reserva) => {

    const { data: reservasExistentes, error: errorDisponibilidad } =
        await supabase
            .from('reservas')
            .select('id')
            .eq('cancha_id', reserva.canchaId)
            .eq('fecha', reserva.fecha)
            .eq('hora', reserva.hora)
            .limit(1);

    if (errorDisponibilidad) {
        throw errorDisponibilidad;
    }

    if (reservasExistentes && reservasExistentes.length > 0) {
        const error = new Error(
            'La cancha ya tiene una reserva para esa fecha y horario.'
        );

        error.code = 'HORARIO_OCUPADO';

        throw error;
    }

    const { data, error } = await supabase
        .from('reservas')
        .insert({
            partido_id: reserva.partidoId,
            cancha_id: reserva.canchaId,
            fecha: reserva.fecha,
            hora: reserva.hora,
            precio: reserva.precio,
            pagada: reserva.pagada ?? false,
            creado_por: reserva.creadoPor
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

// Marcar una reserva como pagada.
const actualizarEstadoReserva = async (reservaId, pagada) => {

    // No permitir volver una reserva a pendiente.
    if (pagada !== true) {
        const error = new Error(
            'Una reserva pagada no puede volver a pendiente.'
        );

        error.code = 'ESTADO_PAGO_NO_PERMITIDO';

        throw error;
    }

    // Registrar el pago solamente si todavía está pendiente.
    const { data, error } = await supabase
        .from('reservas')
        .update({
            pagada: true,
            fecha_pago: new Date().toISOString()
        })
        .eq('id', reservaId)
        .eq('pagada', false)
        .select()
        .maybeSingle();

    if (error) {
        throw error;
    }

    // Si no se modificó ninguna reserva, ya estaba pagada
    // o el identificador no existe.
    if (!data) {
        const errorReserva = new Error(
            'La reserva ya está pagada o no existe.'
        );

        errorReserva.code = 'RESERVA_NO_DISPONIBLE';

        throw errorReserva;
    }

    return data;
};

module.exports = {
    obtenerReservas,
    crearReserva,
    actualizarEstadoReserva
};
