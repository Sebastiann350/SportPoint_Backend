
const supabase = require('../../database/supabase');
const supabaseAuth = require('../../database/supabaseAuth');

// Obtener personal perteneciente a un club.
const obtenerPersonal = async (clubId) => {
    const { data, error } = await supabase
        .from('personal')
        .select(`
            id,
            club_id,
            auth_user_id,
            nombre,
            apellido,
            dni,
            telefono,
            cargo,
            rol,
            activo,
            creado_en
        `)
        .eq('club_id', clubId)
        .order('creado_en', { ascending: true });

    if (error) throw error;

    return data || [];
};

// Crear un integrante del personal.
const crearPersonal = async (datos) => {
    const {
        clubId,
        nombre,
        apellido,
        dni,
        telefono,
        cargo,
        rol,
        crearCuenta,
        email,
        password
    } = datos;

    if (!clubId || !nombre || !apellido || !dni || !cargo || !rol) {
        throw new Error('Faltan completar datos obligatorios del personal');
    }

    const rolesPermitidos = ['owner', 'administrador', 'empleado'];

    if (!rolesPermitidos.includes(rol.toLowerCase())) {
        throw new Error('El rol de acceso seleccionado no es válido');
    }

    let authUserId = null;

    if (crearCuenta === true) {
        if (!email || !password) {
            throw new Error('El email y la contraseña son obligatorios para crear una cuenta');
        }

        const { data: authData, error: authError } =
            await supabase.auth.admin.createUser({
                email: email.trim(),
                password,
                email_confirm: true
            });

        if (authError) throw new Error(authError.message);

        authUserId = authData.user.id;
    }

    const { data: personal, error: personalError } = await supabase
        .from('personal')
        .insert({
            club_id: clubId,
            auth_user_id: authUserId,
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            dni: dni.trim(),
            telefono: telefono ? telefono.trim() : null,
            cargo: cargo.trim(),
            rol: rol.toLowerCase(),
            activo: true
        })
        .select()
        .single();

    if (personalError) {
        if (authUserId) {
            const { error: deleteError } =
                await supabase.auth.admin.deleteUser(authUserId);

            if (deleteError) {
                console.error(
                    'No se pudo eliminar la cuenta de acceso:',
                    deleteError.message
                );
            }
        }

        throw personalError;
    }

    return personal;
};

// Editar los datos de un integrante del personal.
const editarPersonal = async (id, datos) => {
    const {
        nombre,
        apellido,
        dni,
        telefono,
        cargo,
        rol,
        activo
    } = datos;

    if (!id || !nombre || !apellido || !dni || !cargo || !rol) {
        throw new Error('Faltan completar datos obligatorios del personal');
    }

    const rolesPermitidos = ['owner', 'administrador', 'empleado'];

    if (!rolesPermitidos.includes(rol.toLowerCase())) {
        throw new Error('El rol de acceso seleccionado no es válido');
    }

    if (typeof activo !== 'boolean') {
        throw new Error('El estado del personal no es válido');
    }

    const { data: personal, error } = await supabase
        .from('personal')
        .update({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            dni: dni.trim(),
            telefono: telefono ? telefono.trim() : null,
            cargo: cargo.trim(),
            rol: rol.toLowerCase(),
            activo
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return personal;
};

// Iniciar sesión de un integrante del personal.
const iniciarSesion = async (email, password) => {
    const { data: authData, error: authError } =
        await supabaseAuth.auth.signInWithPassword({
            email,
            password
        });

    if (authError) {
        throw new Error('Email o contraseña incorrectos');
    }

    const { data: personal, error: personalError } = await supabase
        .from('personal')
        .select('id, auth_user_id, club_id, cargo, rol, activo')
        .eq('auth_user_id', authData.user.id)
        .single();

    if (personalError || !personal) {
        await supabaseAuth.auth.signOut();
        throw new Error('El usuario no está registrado como personal de ningún club');
    }

    if (!personal.activo) {
        await supabaseAuth.auth.signOut();
        throw new Error('El usuario está desactivado');
    }

    if (!personal.rol) {
        await supabaseAuth.auth.signOut();
        throw new Error('El usuario no tiene un rol de acceso asignado');
    }

    return {
        id: personal.id,
        perfilId: authData.user.id,
        authUserId: authData.user.id,
        clubId: personal.club_id,
        cargo: personal.cargo,
        rol: personal.rol,
        email: authData.user.email,
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        expiresAt: authData.session.expires_at
    };
};

module.exports = { obtenerPersonal, crearPersonal, editarPersonal, iniciarSesion };
