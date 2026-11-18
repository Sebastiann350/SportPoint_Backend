
const supabase = require('../../database/supabase');

const CLUB_PADEL_NORTE = '11111111-1111-4111-8111-111111111111';

// =====================================================
// 1. CREAR POSTULACIÓN
// =====================================================

const crearPostulacion = async (postulacion) => {

    const { data: aviso, error: errorAviso } = await supabase
        .from('avisos')
        .select('id, tipo, estado, autor_id')
        .eq('id', postulacion.avisoId)
        .single();

    if (errorAviso) throw errorAviso;

    if (aviso.estado !== 'abierto') {
        throw new Error('El aviso no está abierto');
    }

    if (aviso.autor_id === postulacion.usuarioId) {
        throw new Error('No podés postularte a tu propio aviso');
    }

    const { data: existente, error: errorExistente } = await supabase
        .from('postulaciones')
        .select('id')
        .eq('aviso_id', postulacion.avisoId)
        .eq('usuario_id', postulacion.usuarioId)
        .maybeSingle();

    if (errorExistente) throw errorExistente;

    if (existente) {
        throw new Error('Ya existe una postulación para este aviso');
    }

    const { data, error } = await supabase
        .from('postulaciones')
        .insert({
            aviso_id: postulacion.avisoId,
            usuario_id: postulacion.usuarioId,
            equipo_id: postulacion.equipoId || null,
            estado: 'pendiente'
        })
        .select()
        .single();

    if (error) throw error;

    const { data: perfil, error: errorPerfil } = await supabase
        .from('perfiles')
        .select('nombre')
        .eq('id', postulacion.usuarioId)
        .single();

    if (errorPerfil) throw errorPerfil;

    const { error: errorNotificacion } = await supabase
        .from('notificaciones')
        .insert({
            usuario_id: aviso.autor_id,
            actor_id: postulacion.usuarioId,
            tipo: 'nueva_postulacion',
            titulo: 'Nueva postulación',
            mensaje: `${perfil.nombre} se postuló a tu aviso.`,
            aviso_id: aviso.id,
            postulacion_id: data.id
        });

    if (errorNotificacion) throw errorNotificacion;

    return data;
};

// =====================================================
// 2. CREAR EQUIPO AUTOMÁTICAMENTE
// =====================================================

const crearEquipoAutomatico = async (postulacion) => {

    const aviso = Array.isArray(postulacion.avisos)
        ? postulacion.avisos[0]
        : postulacion.avisos;

    const autorId = aviso.autor_id;
    const jugadorId = postulacion.usuario_id;

    const { data: perfiles, error: errorPerfiles } = await supabase
        .from('perfiles')
        .select('id, nombre')
        .in('id', [autorId, jugadorId]);

    if (errorPerfiles) throw errorPerfiles;

    const perfilAutor = perfiles.find(p => p.id === autorId);
    const perfilJugador = perfiles.find(p => p.id === jugadorId);

    if (!perfilAutor || !perfilJugador) {
        throw new Error('No se encontraron los perfiles de ambos jugadores');
    }

    const { data: membresias, error: errorMembresias } = await supabase
        .from('miembros_equipo')
        .select('equipo_id, usuario_id')
        .in('usuario_id', [autorId, jugadorId])
        .is('hasta', null);

    if (errorMembresias) throw errorMembresias;

    const equipoAutor = membresias.find(m => m.usuario_id === autorId);
    const equipoJugador = membresias.find(m => m.usuario_id === jugadorId);

    if (equipoAutor && equipoJugador) {
        if (equipoAutor.equipo_id === equipoJugador.equipo_id) {
            return equipoAutor.equipo_id;
        }

        throw new Error('Los jugadores ya pertenecen a equipos diferentes');
    }

    if (equipoAutor || equipoJugador) {
        throw new Error('Uno de los jugadores ya pertenece a otro equipo');
    }

    const nombreEquipo = `${perfilJugador.nombre} - ${perfilAutor.nombre}`;

    const { data: equipo, error: errorEquipo } = await supabase
        .from('equipos')
        .insert({
            nombre: nombreEquipo,
            creador_id: autorId
        })
        .select()
        .single();

    if (errorEquipo) throw errorEquipo;

    const { error: errorAgregar } = await supabase
        .from('miembros_equipo')
        .insert([
            {
                equipo_id: equipo.id,
                usuario_id: autorId,
                rol: 'capitan'
            },
            {
                equipo_id: equipo.id,
                usuario_id: jugadorId,
                rol: 'integrante'
            }
        ]);

    if (errorAgregar) {
        await supabase
            .from('equipos')
            .delete()
            .eq('id', equipo.id);

        throw errorAgregar;
    }

    return equipo.id;
};

// =====================================================
// 3. CREAR PARTIDO AUTOMÁTICAMENTE
// =====================================================

const crearPartidoAutomatico = async (postulacion) => {

    const aviso = Array.isArray(postulacion.avisos)
        ? postulacion.avisos[0]
        : postulacion.avisos;

    if (!aviso.equipo_id || !postulacion.equipo_id) {
        throw new Error('No se encontraron los dos equipos del partido');
    }

    if (aviso.equipo_id === postulacion.equipo_id) {
        throw new Error('Un equipo no puede enfrentarse a sí mismo');
    }

    const { data: existente, error: errorExistente } = await supabase
        .from('partidos')
        .select('id')
        .eq('aviso_id', aviso.id)
        .maybeSingle();

    if (errorExistente) throw errorExistente;

    if (existente) return existente;

    const { data: partido, error } = await supabase
        .from('partidos')
        .insert({
            equipo_local_id: aviso.equipo_id,
            equipo_visitante_id: postulacion.equipo_id,
            aviso_id: aviso.id,
            fecha: aviso.fecha,
            hora: aviso.hora,
            estado: 'acordado',
            club_id: CLUB_PADEL_NORTE
        })
        .select()
        .single();

    if (error) throw error;

    return partido;
};

// =====================================================
// 4. CERRAR AVISO
// =====================================================

const cerrarAviso = async (avisoId) => {

    const { error } = await supabase
        .from('avisos')
        .update({ estado: 'cerrado' })
        .eq('id', avisoId);

    if (error) throw error;
};

// =====================================================
// 5. RESPONDER POSTULACIÓN
// =====================================================

const responderPostulacion = async (postulacionId, usuarioId, respuesta) => {

    const { data: postulacion, error: errorPostulacion } = await supabase
        .from('postulaciones')
        .select(`
            id,
            aviso_id,
            usuario_id,
            equipo_id,
            estado,
            avisos (
                id,
                tipo,
                autor_id,
                equipo_id,
                estado,
                fecha,
                hora
            )
        `)
        .eq('id', postulacionId)
        .single();

    if (errorPostulacion) throw errorPostulacion;

    const aviso = Array.isArray(postulacion.avisos)
        ? postulacion.avisos[0]
        : postulacion.avisos;

    if (!aviso || aviso.autor_id !== usuarioId) {
        throw new Error('Solo el autor del aviso puede responder la postulación');
    }

    if (!['aceptada', 'rechazada'].includes(respuesta)) {
        throw new Error('La respuesta debe ser aceptada o rechazada');
    }

    if (postulacion.estado !== 'pendiente' && postulacion.estado !== respuesta) {
        throw new Error('La postulación ya fue respondida');
    }

    let postulacionActualizada = postulacion;

    if (postulacion.estado === 'pendiente') {

        const { data, error } = await supabase
            .from('postulaciones')
            .update({ estado: respuesta })
            .eq('id', postulacionId)
            .select()
            .single();

        if (error) throw error;

        postulacionActualizada = data;
    }

    if (respuesta === 'aceptada') {

        if (aviso.tipo === 'jugador') {

            if (!postulacion.equipo_id) {
                await crearEquipoAutomatico(postulacion);
            }

            await cerrarAviso(aviso.id);

        } else if (aviso.tipo === 'equipo') {

            await crearPartidoAutomatico(postulacion);
            await cerrarAviso(aviso.id);
        }
    }

    return postulacionActualizada;
};

// =====================================================
// 6. OBTENER POSTULACIONES DE UN USUARIO
// =====================================================

const obtenerPostulacionesUsuario = async (usuarioId) => {

    const { data, error } = await supabase
        .from('postulaciones')
        .select(`
            id,
            aviso_id,
            usuario_id,
            equipo_id,
            estado,
            avisos (
                id,
                tipo,
                estado,
                zona,
                fecha,
                hora
            )
        `)
        .eq('usuario_id', usuarioId);

    if (error) throw error;

    return data;
};

// =====================================================
// 7. OBTENER POSTULACIONES RECIBIDAS
// =====================================================

const obtenerPostulacionesRecibidas = async (usuarioId) => {

    const { data, error } = await supabase
        .from('postulaciones')
        .select(`
            id,
            aviso_id,
            usuario_id,
            equipo_id,
            estado,
            creado_en,
            perfiles (
                id,
                nombre,
                zona
            ),
            avisos!inner (
                id,
                tipo,
                estado,
                autor_id,
                zona,
                fecha,
                hora
            )
        `)
        .eq('avisos.autor_id', usuarioId)
        .order('creado_en', { ascending: false });

    if (error) throw error;

    return data;
};

// =====================================================
// 8. RECUPERAR EQUIPOS DE POSTULACIONES ACEPTADAS
// =====================================================

const sincronizarEquiposAceptados = async (usuarioId) => {

    const { data: postulaciones, error } = await supabase
        .from('postulaciones')
        .select(`
            id,
            aviso_id,
            usuario_id,
            equipo_id,
            estado,
            avisos!inner (
                id,
                tipo,
                autor_id,
                estado
            )
        `)
        .eq('estado', 'aceptada');

    if (error) throw error;

    for (const postulacion of postulaciones) {

        const aviso = Array.isArray(postulacion.avisos)
            ? postulacion.avisos[0]
            : postulacion.avisos;

        const esParticipante =
            postulacion.usuario_id === usuarioId ||
            aviso.autor_id === usuarioId;

        if (!esParticipante || postulacion.equipo_id || aviso.tipo !== 'jugador') {
            continue;
        }

        await crearEquipoAutomatico(postulacion);
        await cerrarAviso(postulacion.aviso_id);
    }
};

// =====================================================
// 9. RECUPERAR PARTIDOS DE POSTULACIONES ACEPTADAS
// =====================================================

const sincronizarPartidosAceptados = async () => {

    const { data: postulaciones, error } = await supabase
        .from('postulaciones')
        .select(`
            id,
            aviso_id,
            usuario_id,
            equipo_id,
            estado,
            avisos!inner (
                id,
                tipo,
                autor_id,
                equipo_id,
                estado,
                fecha,
                hora
            )
        `)
        .eq('estado', 'aceptada');

    if (error) throw error;

    for (const postulacion of postulaciones) {

        const aviso = Array.isArray(postulacion.avisos)
            ? postulacion.avisos[0]
            : postulacion.avisos;

        if (aviso.tipo !== 'equipo') continue;

        await crearPartidoAutomatico(postulacion);
        await cerrarAviso(aviso.id);
    }
};

module.exports = {
    crearPostulacion,
    responderPostulacion,
    obtenerPostulacionesUsuario,
    obtenerPostulacionesRecibidas,
    sincronizarEquiposAceptados,
    sincronizarPartidosAceptados
};
