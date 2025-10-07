const Assistance = require('../models/Assistance');
const Streak = require('../models/Streak');
const { UserProfile } = require('../models');
const tokenLedgerService = require('./token-ledger-service');
const Gym = require('../models/Gym');
const { Op } = require('sequelize');
const frequencyService = require('../services/frequency-service');
const { NotFoundError, ConflictError, BusinessError } = require('../utils/errors');

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

/**
 * Registrar asistencia a un gimnasio
 * @param {Object} data - Datos de asistencia
 * @param {number} data.id_user - ID del user_profile
 * @param {number} data.id_gym - ID del gimnasio
 * @param {number} data.latitude - Latitud del usuario
 * @param {number} data.longitude - Longitud del usuario
 * @returns {Promise<Object>} Asistencia registrada + tokens actuales
 */
const registrarAsistencia = async ({ id_user, id_gym, latitude, longitude }) => {
  const hoy = new Date();
  const fecha = hoy.toISOString().split('T')[0];
  const hora = hoy.toTimeString().split(' ')[0];

  // id_user ahora es id_user_profile
  const idUserProfile = id_user;

  // Validar que no haya registrado ya hoy
  const asistenciaHoy = await Assistance.findOne({
    where: { id_user: idUserProfile, id_gym, date: fecha }
  });
  if (asistenciaHoy) throw new ConflictError('Ya registraste asistencia hoy');

  // Validar gimnasio
  const gym = await Gym.findByPk(id_gym);
  if (!gym) throw new NotFoundError('Gimnasio');

  // Validar proximidad
  const distancia = calcularDistancia(latitude, longitude, gym.latitude, gym.longitude);
  const PROXIMITY_M = parseInt(process.env.PROXIMITY_M || '180');
  if (distancia > PROXIMITY_M) {
    throw new BusinessError(
      `Estás fuera del rango del gimnasio (distancia: ${Math.round(distancia)} m, máximo: ${PROXIMITY_M} m)`,
      'OUT_OF_RANGE'
    );
  }

  // Cargar user profile
  const userProfile = await UserProfile.findByPk(idUserProfile);
  if (!userProfile) throw new NotFoundError('Usuario');

  const racha = await Streak.findByPk(userProfile.id_streak);
  if (!racha) throw new NotFoundError('Racha');

  // Crear asistencia
  const nuevaAsistencia = await Assistance.create({
    id_user: idUserProfile,
    id_gym,
    id_streak: userProfile.id_streak,
    date: fecha,
    hour: hora
  });

  // Actualizar racha
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);
  const fechaAyer = ayer.toISOString().split('T')[0];

  const ultimaAsistencia = await Assistance.findOne({
    where: { id_user: idUserProfile, id_gym, date: fechaAyer }
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

  // Otorgar tokens usando ledger
  const TOKENS_ATTENDANCE = parseInt(process.env.TOKENS_ATTENDANCE || '10');
  const { newBalance } = await tokenLedgerService.registrarMovimiento({
    userId: idUserProfile,
    delta: TOKENS_ATTENDANCE,
    reason: 'ATTENDANCE',
    refType: 'assistance',
    refId: nuevaAsistencia.id_assistance
  });

  // Actualizar frecuencia semanal
  await frequencyService.actualizarAsistenciaSemanal(idUserProfile);

  return {
    asistencia: nuevaAsistencia,
    distancia: Math.round(distancia),
    tokens_actuales: newBalance,
    racha_actual: racha.value
  };
};

/**
 * Obtener historial de asistencias de un usuario
 * @param {number} idUserProfile - ID del user_profile
 * @returns {Promise<Array>} Lista de asistencias con gimnasio
 */
const obtenerHistorialAsistencias = async (idUserProfile) => {
  return await Assistance.findAll({
    where: { id_user: idUserProfile },
    include: {
      model: Gym,
      as: 'gym',
      attributes: ['name', 'city', 'address']
    },
    order: [['date', 'DESC'], ['hour', 'DESC']]
  });
};

module.exports = {
  registrarAsistencia,
  obtenerHistorialAsistencias
};
