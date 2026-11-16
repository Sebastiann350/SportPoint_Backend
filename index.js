
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const supabase = require('./database/supabase');

// Rutas
const perfilRoutes = require('./routes/perfiles/perfilRoutes');
const jugadoresRoutes = require('./routes/jugadores/jugadoresRoutes');
const equiposRoutes = require('./routes/equipos/equiposRoutes');
const avisosRoutes = require('./routes/avisos/avisosRoutes');
const postulacionesRoutes = require('./routes/postulaciones/postulacionesRoutes');
const partidosRoutes = require('./routes/partidos/partidosRoutes');
const canchasRoutes = require('./routes/canchas/canchasRoutes');
const reservasRoutes = require('./routes/reservas/reservasRoutes');
const asistenciaRoutes = require('./routes/asistencia/asistenciaRoutes');
const personalRoutes = require('./routes/personal/personalRoutes');
const gastosRoutes = require('./routes/gastos/gastosRoutes');
const finanzaRoutes = require('./routes/finanza/finanzaRoutes');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
    res.send('SportPoint API funcionando correctamente');
});

// Módulos de la API
app.use('/perfil', perfilRoutes);
app.use('/jugadores', jugadoresRoutes);
app.use('/equipos', equiposRoutes);
app.use('/avisos', avisosRoutes);
app.use('/postulaciones', postulacionesRoutes);
app.use('/partidos', partidosRoutes);
app.use('/canchas', canchasRoutes);
app.use('/reservas', reservasRoutes);
app.use('/asistencia', asistenciaRoutes);
app.use('/personal', personalRoutes);
app.use('/gastos', gastosRoutes);
app.use('/finanzas', finanzaRoutes);

// Ruta temporal para probar Supabase
app.get('/test-db', async (req, res) => {

    const { data, error } = await supabase
        .from('clubes')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error al conectar con Supabase:', error.message);

        return res.status(500).json({
            mensaje: 'Error al conectar con Supabase',
            error: error.message
        });
    }

    res.status(200).json({
        mensaje: 'Conexión con Supabase exitosa',
        datos: data
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`SportPoint API funcionando en http://localhost:${PORT}`);
});
