const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./config/database');
const setupSwagger = require('./utils/swagger');
const { runMigrations } = require('./migrate');
const { startRewardStatsJob } = require('./jobs/reward-stats-job');
const { startCleanupJob } = require('./jobs/cleanup-job');
const { startAccountDeletionJob } = require('./jobs/account-deletion-job');
const { errorHandler, notFoundHandler } = require('./middlewares/error-handler');

// Cargar variables de entorno
dotenv.config();

// Importar rutas
const healthRoutes = require('./routes/health-routes');
const authRoutes = require('./routes/auth-routes');
const gymRoutes = require('./routes/gym-routes');
const assistanceRoutes = require('./routes/assistance-routes');
const routineRoutes = require('./routes/routine-routes');
const exerciseRoutes = require('./routes/exercise-routes');
const userRoutineRoutes = require('./routes/user-routine-routes');
const progressRoutes = require('./routes/progress-routes');
const rewardRoutes = require('./routes/reward-routes');
const transactionRoutes = require('./routes/transaction-routes');
const tokenRoutes = require('./routes/token-routes');
const userGymRoutes = require('./routes/user-gym-routes');
const frequencyRoutes = require('./routes/frequency-routes');
const gymScheduleRoutes = require('./routes/gym-schedule-routes');
const specialScheduleRoutes = require('./routes/gym-special-schedule-routes');
const gymPaymentRoutes = require('./routes/gym-payment-routes');
const rewardCodeRoutes = require('./routes/reward-code-routes');
const userRoutes = require('./routes/user-routes');
const adminRoutes = require('./routes/admin-routes');
const adminRewardsRoutes = require('./routes/admin-rewards-routes');
const reviewRoutes = require('./routes/review-routes');
const mediaRoutes = require('./routes/media-routes');
const workoutRoutes = require('./routes/workout-routes');
// NOTA: body-metrics y notifications se montan como subrutas en user-routes.js (líneas 148-149)
// const bodyMetricsRoutes = require('./routes/body-metrics-routes');
// const notificationRoutes = require('./routes/notification-routes');
const paymentRoutes = require('./routes/payment-routes');
const webhookRoutes = require('./routes/webhook-routes');
const testRoutes = require('./routes/test-routes');

// Inicializar app
const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Confiar en proxies (para obtener IP real detrás de reverse proxy)
app.set('trust proxy', true);

// Health checks (sin autenticación, para load balancers/kubernetes)
app.use('/', healthRoutes);

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/assistances', assistanceRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/user-routines', userRoutineRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/user-gym', userGymRoutes);
app.use('/api/frequency', frequencyRoutes);
app.use('/api/schedules', gymScheduleRoutes);
app.use('/api/special-schedules', specialScheduleRoutes);
app.use('/api/gym-payments', gymPaymentRoutes);
app.use('/api/reward-codes', rewardCodeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminRewardsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/workouts', workoutRoutes);
// NOTA: Estas rutas se montan en user-routes.js como subrutas de /api/users/me/
// app.use('/api/body-metrics', bodyMetricsRoutes); // Ahora: /api/users/me/body-metrics
// app.use('/api/notifications', notificationRoutes); // Ahora: /api/users/me/notifications
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/test', testRoutes);

// Swagger UI
setupSwagger(app);

// Manejo de errores - debe ir al final de todas las rutas
app.use(notFoundHandler);  // 404 para rutas no encontradas
app.use(errorHandler);     // Manejo centralizado de errores

// Función para iniciar el servidor
async function startServer() {
  const PORT = process.env.PORT || 3000;
  
  try {
    // 1. Verificar conexión a base de datos
    console.log('🔄 Verificando conexión a MySQL...');
    await sequelize.authenticate();
    console.log('✅ Conexión con MySQL establecida correctamente');

    // 2. Ejecutar migraciones automáticamente
    console.log('🔄 Ejecutando migraciones...');
    await runMigrations();
    
    // 3. Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('='.repeat(50));
      console.log(`🚀 Servidor GymPoint corriendo en puerto ${PORT}`);
      console.log(`📚 Documentación API: http://localhost:${PORT}/api-docs`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
      console.log(`✅ Ready check: http://localhost:${PORT}/ready`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(50));
      console.log('');
    });
    
    // 4. Iniciar jobs programados
    if (process.env.NODE_ENV !== 'test') {
      startRewardStatsJob(); // Cada 5 minutos
      startCleanupJob(); // Diario a las 3 AM
      startAccountDeletionJob(); // Diario a las 2 AM
    }
    
  } catch (error) {
    console.error('❌ Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Exportar app para tests
module.exports = app;

// Manejo de señales para shutdown graceful
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM recibido. Cerrando conexiones...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n⚠️  SIGINT recibido. Cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});
