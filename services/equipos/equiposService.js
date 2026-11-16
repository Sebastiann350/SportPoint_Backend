
const supabase = require('../../database/supabase');

const crearEquipo = async (nombre, usuarioId) => {

    const { data: equipo, error: errorEquipo } = await supabase
        .from('equipos')
        .insert({
            nombre,
            creador_id: usuarioId
        })
        .select()
        .single();

    if (errorEquipo) {
        throw errorEquipo;
    }

    const { data: miembro, error: errorMiembro } = await supabase
        .from('miembros_equipo')
        .insert({
            equipo_id: equipo.id,
            usuario_id: usuarioId,
            rol: 'capitan'
        })
        .select()
        .single();

    if (errorMiembro) {
        await supabase
            .from('equipos')
            .delete()
            .eq('id', equipo.id);

        throw errorMiembro;
    }

    return {
        equipo,
        miembro
    };
};

const obtenerMiEquipo = async (usuarioId) => {

    const { data: membresias, error: errorMembresia } = await supabase
        .from('miembros_equipo')
        .select('equipo_id')
        .eq('usuario_id', usuarioId)
        .is('hasta', null);

    if (errorMembresia) {
        throw errorMembresia;
    }

    if (!membresias || membresias.length === 0) {
        return null;
    }

    if (membresias.length > 1) {
        throw new Error(
            'El usuario tiene más de una membresía activa en equipos.'
        );
    }

    const { data: equipo, error: errorEquipo } = await supabase
        .from('equipos')
        .select(`
            id,
            nombre,
            deporte,
            estado,
            creador_id,
            creado_en,
            miembros_equipo (
                id,
                usuario_id,
                rol,
                desde,
                hasta,
                perfiles (
                    id,
                    nombre,
                    zona
                )
            )
        `)
        .eq('id', membresias[0].equipo_id)
        .maybeSingle();

    if (errorEquipo) {
        throw errorEquipo;
    }

    if (!equipo) {
        return null;
    }

    return equipo;
};

const gestionarIntegrante = async (equipoId, usuarioId, integranteId, accion) => {

    // Verificar que el equipo exista y que el usuario sea su creador.
    const { data: equipo, error: errorEquipo } = await supabase
        .from('equipos')
        .select('id, creador_id')
        .eq('id', equipoId)
        .single();

    if (errorEquipo) {
        throw errorEquipo;
    }

    if (equipo.creador_id !== usuarioId) {
        throw new Error('Solo el capitan del equipo puede gestionar integrantes');
    }

    if (integranteId === usuarioId) {
        throw new Error('No podes gestionar tu propia membresia');
    }

    // Agregar un integrante.
    if (accion === 'agregar') {

        const { data: membresiaExistente, error: errorMembresia } = await supabase
            .from('miembros_equipo')
            .select('id, hasta')
            .eq('equipo_id', equipoId)
            .eq('usuario_id', integranteId)
            .maybeSingle();

        if (errorMembresia) {
            throw errorMembresia;
        }

        if (membresiaExistente && membresiaExistente.hasta === null) {
            throw new Error('El jugador ya pertenece a este equipo');
        }

        const { count, error: errorCantidad } = await supabase
            .from('miembros_equipo')
            .select('id', { count: 'exact', head: true })
            .eq('equipo_id', equipoId)
            .is('hasta', null);

        if (errorCantidad) {
            throw errorCantidad;
        }

        if (count >= 2) {
            throw new Error('El equipo ya tiene sus dos integrantes');
        }

        let miembro;
        let errorOperacion;

        if (membresiaExistente) {
            const resultado = await supabase
                .from('miembros_equipo')
                .update({
                    hasta: null,
                    desde: new Date().toISOString().slice(0, 10),
                    rol: 'integrante'
                })
                .eq('id', membresiaExistente.id)
                .select()
                .single();

            miembro = resultado.data;
            errorOperacion = resultado.error;

        } else {
            const resultado = await supabase
                .from('miembros_equipo')
                .insert({
                    equipo_id: equipoId,
                    usuario_id: integranteId,
                    rol: 'integrante'
                })
                .select()
                .single();

            miembro = resultado.data;
            errorOperacion = resultado.error;
        }

        if (errorOperacion) {
            throw errorOperacion;
        }

        return miembro;
    }

    // Quitar un integrante.
    if (accion === 'quitar') {

        const { data: miembro, error: errorMiembro } = await supabase
            .from('miembros_equipo')
            .select('id')
            .eq('equipo_id', equipoId)
            .eq('usuario_id', integranteId)
            .is('hasta', null)
            .maybeSingle();

        if (errorMiembro) {
            throw errorMiembro;
        }

        if (!miembro) {
            throw new Error('El jugador no pertenece a este equipo');
        }

        const { data: miembroActualizado, error: errorActualizar } = await supabase
            .from('miembros_equipo')
            .update({
                hasta: new Date().toISOString().slice(0, 10)
            })
            .eq('id', miembro.id)
            .select()
            .single();

        if (errorActualizar) {
            throw errorActualizar;
        }

        return miembroActualizado;
    }

    throw new Error('Accion no valida. Utiliza agregar o quitar');
};

module.exports = {crearEquipo, obtenerMiEquipo, gestionarIntegrante};
