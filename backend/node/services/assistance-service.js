const Assistance = require('../models/Assistance');
const Streak = require('../models/Streak');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Gym = require('../models/Gym');
const { Op } = require('sequelize');

// Utilidad para validar distancia
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371000; // en metros
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*rad) * Math.cos(lat2*rad) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const registrarAsistencia = async ({ id_user, id_gym, id_streak, latitude, longitude }) => {
  const hoy = new Date();
  const fecha = hoy.toISOString().split('T')[0];     // "YYYY-MM-DD"
  const hora = hoy.toTimeString().split(' ')[0];     // "HH:MM:SS"

  // Validar asistencia duplicada A TENER EN CUENTA !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const asistenciaHoy = await Assistance.findOne({
    where: { id_user, id_gym, date: fecha }
  });
  if (asistenciaHoy) throw new Error('Ya registraste asistencia hoy.');

  // Validar distancia
  const gym = await Gym.findByPk(id_gym);
  if (!gym) throw new Error('Gimnasio no encontrado');
  const distancia = calcularDistancia(latitude, longitude, gym.latitude, gym.longitude);
  const umbral = 15; // ✅ Umbral cambiado de 100 a 15 metros
  if (distancia > umbral) {
    throw new Error(`Estás fuera del rango del gimnasio (distancia: ${Math.round(distancia)} m)`);
  }

  // Registrar asistencia
  const nuevaAsistencia = await Assistance.create({
    id_user,
    id_gym,
    id_streak,
    date: fecha,
    hour: hora
  });

  // Lógica de racha
  const racha = await Streak.findByPk(id_streak);
  if (!racha) throw new Error('Racha no encontrada.');

  const ultimaAsistencia = await Assistance.findOne({
    where: { id_user, id_gym, date: { [Op.lt]: fecha } },
    order: [['date', 'DESC']]
  });

  const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
  const fechaAyer = ayer.toISOString().split('T')[0];

  if (ultimaAsistencia && ultimaAsistencia.date === fechaAyer) {
    racha.value += 1;
  } else {
    if (racha.recovery_items > 0) {
      racha.recovery_items -= 1;
    } else {
      racha.last_value = racha.value;
      racha.value = 1;
    }
  }

  await racha.save();

  // Otorgar tokens + registrar transacción
  const user = await User.findByPk(id_user);
  user.tokens += 10;
  await user.save();

  await Transaction.create({
    id_user,
    id_reward: null,
    movement_type: 'GANANCIA',
    amount: 10,
    result_balance: user.tokens,
    date: new Date()
  });

  // ⬇️ Actualizar la frecuencia semanal
  const frequencyService = require('../services/frequency-service');
  await frequencyService.actualizarAsistenciaSemanal(id_user);

  return {
    asistencia: nuevaAsistencia,
    distancia: Math.round(distancia),
    tokens_actuales: user.tokens
  };
};

const obtenerHistorialAsistencias = async (id_user) => {
  return await Assistance.findAll({
    where: { id_user },
    include: {
      model: Gym,
      attributes: ['name', 'city', 'address']
    },
    order: [['date', 'DESC'], ['hour', 'DESC']]
  });
};


module.exports = { 
  registrarAsistencia,
  obtenerHistorialAsistencias
};
