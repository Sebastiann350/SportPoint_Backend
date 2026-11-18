
const supabase = require('../../database/supabase');

// =====================================================
// 1. CREAR POSTULACIÓN
// =====================================================

const crearPostulacion = async (postulacion) => {

    // Buscar el aviso y su autor.
    const { data: aviso, error: errorAviso } = await supabase
        .from('avisos')
        .select('id, tipo, estado, autor_id')
        .eq('id', postulacion.avisoId)
        .single();

    if (errorAviso) {
        throw errorAviso;
    }

    if (aviso.estado !== 'abierto') {
        throw new Error('El aviso no está abierto');
    }

    // Evitar que el autor se postule a su propio aviso.
    if (aviso.autor_id === postulacion.usuarioId) {
        throw new Error('No podés postularte a tu propio aviso');
    }

    // Verificar que no exista otra postulación del mismo usuario.
    const { data: postulacionExistente, error: errorExistente } = await supabase
        .from('postulaciones')
        .select('id, estado')
        .eq('aviso_id', postulacion.avisoId)
        .eq('usuario_id', postulacion.usuarioId)
        .maybeSingle();

    if (errorExistente) {
        throw errorExistente;
    }

    if (postulacionExistente) {
        throw new Error('Ya existe una postulación para este aviso');
    }

    // Registrar la postulación.
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

    if (error) {
        throw error;
    }

    // Buscar el nombre del jugador que se postuló.
    const { data: perfil, error: errorPerfil } = await supabase
        .from('perfiles')
        .select('nombre')
        .eq('id', postulacion.usuarioId)
        .single();

    if (errorPerfil) {
        throw errorPerfil;
    }

    // Crear una notificación para el autor del aviso.
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

    if (errorNotificacion) {
        throw errorNotificacion;
    }

    return data;
};

// =====================================================
// 2. RESPONDER POSTULACIÓN
// =====================================================

const responderPostulacion = async (postulacionId, usuarioId, respuesta) => {

    // Buscar la postulación y el aviso relacionado.
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
                autor_id,
                estado
            )
        `)
        .eq('id', postulacionId)
        .single();

    if (errorPostulacion) {
        throw errorPostulacion;
    }

    // Solo el autor del aviso puede responder.
    if (postulacion.avisos.autor_id !== usuarioId) {
        throw new Error('Solo el autor del aviso puede responder la postulación');
    }

    if (postulacion.estado !== 'pendiente') {
        throw new Error('La postulación ya fue respondida');
    }

    if (!['aceptada', 'rechazada'].includes(respuesta)) {
        throw new Error('La respuesta debe ser aceptada o rechazada');
    }

    const { data, error } = await supabase
        .from('postulaciones')
        .update({
            estado: respuesta
        })
        .eq('id', postulacionId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

// =====================================================
// 3. OBTENER POSTULACIONES DE UN USUARIO
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

    if (error) {
        throw error;
    }

    return data;
};

module.exports = {
    crearPostulacion,
    responderPostulacion,
    obtenerPostulacionesUsuario
};
