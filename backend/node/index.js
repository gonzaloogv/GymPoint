const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const setupSwagger = require('./utils/swagger');

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

dotenv.config();

const app = express();
app.use(express.json());

// Testear conexión a MySQL
sequelize.authenticate()
  .then(() => console.log('✅ Conexión con MySQL establecida correctamente.'))
  .catch((err) => console.error('❌ Error al conectar con MySQL:', err));

// Rutas
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

// Confiar proxys
app.set('trust proxy', true);

// Inicializador de swagger
setupSwagger(app);

// Arrancar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
