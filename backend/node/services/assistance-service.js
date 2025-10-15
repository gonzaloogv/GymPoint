const Assistance = require('../models/Assistance');
﻿const Assistance = require('../models/Assistance');
const Streak = require('../models/Streak');
const { UserProfile } = require('../models');
const Frequency = require('../models/Frequency');
const tokenLedgerService = require('./token-ledger-service');
const Gym = require('../models/Gym');
const { Op } = require('sequelize');
const frequencyService = require('../services/frequency-service');
const { NotFoundError, ConflictError, BusinessError, ValidationError } = require('../utils/errors');
const { PROXIMITY_METERS, ACCURACY_MAX_METERS, TOKENS, TOKEN_REASONS } = require('../config/constants');

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
const registrarAsistencia = async ({ id_user, id_gym, latitude, longitude, accuracy = null }) => {
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

  // Validar precisión GPS si se envía
  if (accuracy != null) {
    const acc = Number(accuracy);
    if (Number.isFinite(acc) && acc > ACCURACY_MAX_METERS) {
      throw new ValidationError(`GPS con baja precisión (> ${ACCURACY_MAX_METERS} m)`, [{ field: 'accuracy', message: 'GPS_INACCURATE' }]);
    }
  }

  // Validar gimnasio
  const gym = await Gym.findByPk(id_gym);
  if (!gym) throw new NotFoundError('Gimnasio');

  // Validar proximidad
  const distancia = calcularDistancia(latitude, longitude, gym.latitude, gym.longitude);
  if (distancia > PROXIMITY_METERS) {
    throw new BusinessError(
      `EstÃ¡s fuera del rango del gimnasio (distancia: ${Math.round(distancia)} m, mÃ¡ximo: ${PROXIMITY_METERS} m)`,
      'OUT_OF_RANGE'
    );
  }

  // Cargar user profile
  const userProfile = await UserProfile.findByPk(idUserProfile);
  if (!userProfile) throw new NotFoundError('Usuario');

  const racha = await Streak.findByPk(userProfile.id_streak);
  if (!racha) throw new NotFoundError('Racha');

  // Crear asistencia
  let nuevaAsistencia;
  try {
    nuevaAsistencia = await Assistance.create({
      id_user: idUserProfile,
      id_gym,
      id_streak: userProfile.id_streak,
      date: fecha,
      hour: hora,
      check_in_time: hora
    });
  } catch (e) {
    if (e?.name === 'SequelizeUniqueConstraintError' || e?.parent?.code === 'ER_DUP_ENTRY') {
      throw new ConflictError('Ya registraste asistencia hoy');
    }
    throw e;
  }

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
  const { newBalance } = await tokenLedgerService.registrarMovimiento({
    userId: idUserProfile,
    delta: TOKENS.ATTENDANCE,
    reason: TOKEN_REASONS.ATTENDANCE,
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
 * Check-out de asistencia: registra hora de salida y otorga bonus por duraciÃ³n (top-up)
 * @param {number} assistanceId
 * @param {number} idUserProfile
 */
const checkOut = async (assistanceId, idUserProfile) => {
  const asistencia = await Assistance.findByPk(assistanceId);
  if (!asistencia) throw new NotFoundError('Asistencia');
  if (asistencia.id_user !== idUserProfile) throw new BusinessError('No puedes modificar esta asistencia', 'FORBIDDEN');
  if (asistencia.check_out_time) throw new ConflictError('La asistencia ya tiene check-out');
  if (!asistencia.check_in_time) throw new BusinessError('No hay check-in registrado', 'CHECKIN_REQUIRED');

  const ahora = new Date();
  const horaSalida = ahora.toTimeString().split(' ')[0];
  await asistencia.update({ check_out_time: horaSalida });

  // Recargar para leer duration_minutes; si no existe la columna generada en DB, calcular en app
  const refreshed = await Assistance.findByPk(assistanceId);
  let durMin = refreshed.duration_minutes;
  if (durMin == null && refreshed.check_in_time && refreshed.check_out_time) {
    try {
      const [hIn, mIn, sIn] = String(refreshed.check_in_time).split(':').map(Number);
      const [hOut, mOut, sOut] = String(refreshed.check_out_time).split(':').map(Number);
      const minsIn = (hIn || 0) * 60 + (mIn || 0) + ((sIn || 0) > 0 ? 1 : 0);
      const minsOut = (hOut || 0) * 60 + (mOut || 0) + ((sOut || 0) > 0 ? 1 : 0);
      durMin = Math.max(0, minsOut - minsIn);
    } catch (_) {
      durMin = 0;
    }
  }
  durMin = durMin || 0;

  // Calcular tokens por duraciÃ³n (top-up sobre base ATTENDANCE)
  let tokensByDuration = TOKENS.ATTENDANCE;
  if (durMin >= 60) tokensByDuration = Math.max(tokensByDuration, 15);
  else if (durMin >= 45) tokensByDuration = Math.max(tokensByDuration, 12);
  else if (durMin >= 30) tokensByDuration = Math.max(tokensByDuration, 10);

  const base = TOKENS.ATTENDANCE;
  const delta = Math.max(0, tokensByDuration - base);

  let newBalance = undefined;
  let awarded = 0;
  if (delta > 0) {
    // Evitar doble procesamiento de checkout usando ref_type distinto
    const yaExiste = await tokenLedgerService.existeMovimiento('assistance_checkout', assistanceId);
    if (!yaExiste) {
      const res = await tokenLedgerService.registrarMovimiento({
        userId: idUserProfile,
        delta,
        reason: TOKEN_REASONS.ATTENDANCE,
        refType: 'assistance_checkout',
        refId: assistanceId
      });
      newBalance = res.newBalance;
      awarded = delta;
    }
  }

  return {
    asistencia: refreshed,
    duration_minutes: durMin,
    tokens_awarded: awarded,
    tokens_total: newBalance
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
    order: [['date', 'DESC'], ['check_in_time', 'DESC']] // Usar check_in_time en lugar de hour
  });
};

/**
 * Check-in con validación de geofence
 * NOTA: "auto" en el nombre es legacy. El usuario DEBE presionar el botón de check-in.
 * Esta función solo VALIDA que el usuario esté dentro del geofence del gimnasio.
 */
const autoCheckIn = async ({ id_user, id_gym, latitude, longitude, accuracy = null }) => {
  const hoy = new Date();
  const fecha = hoy.toISOString().split('T')[0];
  const hora = hoy.toTimeString().split(' ')[0];
  const idUserProfile = id_user;

  // Validar que no haya registrado ya hoy
  const asistenciaHoy = await Assistance.findOne({
    where: { id_user: idUserProfile, date: fecha }
  });
  if (asistenciaHoy) throw new ConflictError('Ya registraste asistencia hoy');

  // Gym + config geofence (ahora integrada en gym)
  const gym = await Gym.findByPk(id_gym, {
    attributes: [
      'id_gym',
      'name',
      'latitude',
      'longitude',
      'auto_checkin_enabled',
      'geofence_radius_meters',
      'min_stay_minutes'
    ]
  });
  if (!gym) throw new NotFoundError('Gimnasio');

  // Verificar que auto check-in esté habilitado
  if (gym.auto_checkin_enabled === false) {
    throw new BusinessError('Auto check-in deshabilitado...', 'AUTO_CHECKIN_DISABLED');
  }

  // Usar radio del geofence del gym
  const radius = gym.geofence_radius_meters ?? PROXIMITY_METERS;

  // Validar proximidad
  const distancia = calcularDistancia(latitude, longitude, gym.latitude, gym.longitude);
  if (distancia > radius) {
    throw new BusinessError(
      `Estás fuera del rango del geofence (distancia: ${Math.round(distancia)} m, máximo: ${radius} m)`,
      'OUT_OF_GEOFENCE_RANGE'
    );
  }

  // Crear asistencia
  const nuevaAsistencia = await Assistance.create({
    id_user: idUserProfile,
    id_gym,
    date: fecha,
    check_in_time: hora
  });

  return {
    asistencia: nuevaAsistencia,
    distancia: Math.round(distancia)
  };
};

module.exports = {
  registrarAsistencia,
  obtenerHistorialAsistencias,
  checkOut,
  autoCheckIn,
  // Export util for unit tests
  calculateDistance: calcularDistancia
};
