
const supabase = require('../../database/supabase');

// =====================================================
// 1. OBTENER GASTOS
// =====================================================

const obtenerGastos = async (clubId) => {

    const { data, error } = await supabase
        .from('gastos')
        .select(`
            id,
            club_id,
            concepto,
            monto,
            fecha,
            cargado_por,
            creado_en
        `)
        .eq('club_id', clubId)
        .order('fecha', { ascending: false });

    if (error) {
        throw error;
    }

    return data;
};

// =====================================================
// 2. CREAR GASTO
// =====================================================

const crearGasto = async (gasto) => {

    const { data, error } = await supabase
        .from('gastos')
        .insert({
            club_id: gasto.clubId,
            concepto: gasto.concepto,
            monto: gasto.monto,
            fecha: gasto.fecha,
            cargado_por: gasto.cargadoPor
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

module.exports = {obtenerGastos, crearGasto};
