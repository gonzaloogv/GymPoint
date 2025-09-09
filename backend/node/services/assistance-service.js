const Assistance = require('../models/Assistance');
const Streak = require('../models/Streak');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Gym = require('../models/Gym');
const { Op } = require('sequelize');
const frequencyService = require('../services/frequency-service');

// Utilidad para validar distancia
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6378137;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const registrarAsistencia = async ({ id_user, id_gym, latitude, longitude }) => {
  const hoy = new Date();
  const fecha = hoy.toISOString().split('T')[0];
  const hora = hoy.toTimeString().split(' ')[0];

  const asistenciaHoy = await Assistance.findOne({
    where: { id_user, id_gym, date: fecha }
  });
  if (asistenciaHoy) throw new Error('Ya registraste asistencia hoy.');

  const gym = await Gym.findByPk(id_gym);
  if (!gym) throw new Error('Gimnasio no encontrado');
  const distancia = calcularDistancia(latitude, longitude, gym.latitude, gym.longitude);
  if (distancia > 15) {
    throw new Error(`Estás fuera del rango del gimnasio (distancia: ${Math.round(distancia)} m)`);
  }

  const user = await User.findByPk(id_user);
  if (!user) throw new Error('Usuario no encontrado');
  const racha = await Streak.findByPk(user.id_streak);
  if (!racha) throw new Error('Racha no encontrada');

  const nuevaAsistencia = await Assistance.create({
    id_user,
    id_gym,
    id_streak: user.id_streak,
    date: fecha,
    hour: hora
  });

  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);
  const fechaAyer = ayer.toISOString().split('T')[0];

  const ultimaAsistencia = await Assistance.findOne({
    where: { id_user, id_gym, date: fechaAyer }
  });

  if (ultimaAsistencia) {
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

  user.tokens += 10;
  await user.save();

  await Transaction.create({
    id_user,
    id_reward: null,
    movement_type: 'ASISTENCIA',
    amount: 10,
    result_balance: user.tokens,
    date: new Date()
  });

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
