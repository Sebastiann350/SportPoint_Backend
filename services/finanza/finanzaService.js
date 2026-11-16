
const supabase = require('../../database/supabase');

const obtenerResumen = async (clubId) => {
    console.log('FINANZAS - Club recibido:', clubId);

    const { data: canchas, error: errorCanchas } = await supabase
        .from('canchas')
        .select('id')
        .eq('club_id', clubId);

    if (errorCanchas) throw errorCanchas;

    const idsCanchas = (canchas || []).map(cancha => cancha.id);

    let ingresos = 0;
    let ingresosPendientes = 0;

    if (idsCanchas.length > 0) {
        const { data: reservas, error: errorReservas } = await supabase
            .from('reservas')
            .select('precio, pagada')
            .in('cancha_id', idsCanchas);

        if (errorReservas) throw errorReservas;

        (reservas || []).forEach(reserva => {
            const precio = Number(reserva.precio) || 0;

            if (reserva.pagada) {
                ingresos += precio;
            } else {
                ingresosPendientes += precio;
            }
        });
    }

    const { data: gastos, error: errorGastos } = await supabase
        .from('gastos')
        .select('monto')
        .eq('club_id', clubId);

    if (errorGastos) throw errorGastos;

    const totalGastos = (gastos || []).reduce(
        (total, gasto) => total + (Number(gasto.monto) || 0),
        0
    );

    return {
        ingresos,
        ingresosPendientes,
        totalGastos,
        balance: ingresos - totalGastos
    };
};

const obtenerGastos = async (clubId) => {
    const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .eq('club_id', clubId)
        .order('fecha', { ascending: false });

    if (error) throw error;

    return data || [];
};

module.exports = {
    obtenerResumen,
    obtenerGastos
};
