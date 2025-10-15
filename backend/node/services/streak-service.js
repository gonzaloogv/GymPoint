const Streak = require('../models/Streak');
const { UserProfile, Frequency } = require('../models');
const { NotFoundError, BusinessError } = require('../utils/errors');
const { Op } = require('sequelize');

/**
 * Obtener la racha actual de un usuario
 * @param {number} idUserProfile
 * @returns {Promise<Object>}
 */
const obtenerRachaUsuario = async (idUserProfile) => {
  const userProfile = await UserProfile.findByPk(idUserProfile);

  if (!userProfile) {
    throw new NotFoundError('Usuario');
  }

  if (!userProfile.id_streak) {
    throw new NotFoundError('El usuario no tiene una racha asignada');
  }

  const racha = await Streak.findByPk(userProfile.id_streak, {
    include: [
      {
        model: UserProfile,
        as: 'userProfile',
        attributes: ['name', 'lastname', 'id_user_profile']
      },
      {
        model: Frequency,
        as: 'frequency',
        attributes: ['goal', 'assist', 'achieved_goal']
      }
    ]
  });

  if (!racha) {
    throw new NotFoundError('Racha');
  }

  return {
    id_streak: racha.id_streak,
    value: racha.value,
    last_value: racha.last_value,
    recovery_items: racha.recovery_items,
    user: racha.userProfile,
    frequency: racha.frequency,
    created_at: racha.created_at,
    updated_at: racha.updated_at
  };
};

/**
 * Usar un item de recuperación para mantener la racha
 * @param {number} idUserProfile
 * @returns {Promise<Object>}
 */
const usarItemRecuperacion = async (idUserProfile) => {
  const userProfile = await UserProfile.findByPk(idUserProfile);

  if (!userProfile || !userProfile.id_streak) {
    throw new NotFoundError('Usuario o racha no encontrada');
  }

  const racha = await Streak.findByPk(userProfile.id_streak);

  if (!racha) {
    throw new NotFoundError('Racha');
  }

  if (racha.recovery_items <= 0) {
    throw new BusinessError(
      'No tienes items de recuperación disponibles',
      'NO_RECOVERY_ITEMS'
    );
  }

  racha.recovery_items -= 1;
  await racha.save();

  return {
    message: 'Item de recuperación usado exitosamente',
    recovery_items_remaining: racha.recovery_items,
    streak_value: racha.value
  };
};

/**
 * Obtener estadísticas globales de rachas (para admin)
 * @returns {Promise<Object>}
 */
const obtenerEstadisticasGlobales = async () => {
  const totalRachas = await Streak.count();

  const rachaMaxima = await Streak.findOne({
    order: [['value', 'DESC']],
    include: {
      model: UserProfile,
      as: 'userProfile',
      attributes: ['name', 'lastname', 'id_user_profile']
    }
  });

  const promedioRacha = await Streak.findOne({
    attributes: [
      [Streak.sequelize.fn('AVG', Streak.sequelize.col('value')), 'avg_value']
    ],
    raw: true
  });

  const rachasPorRango = await Streak.findAll({
    attributes: [
      [
        Streak.sequelize.literal(`
          CASE
            WHEN value = 0 THEN '0'
            WHEN value BETWEEN 1 AND 7 THEN '1-7'
            WHEN value BETWEEN 8 AND 30 THEN '8-30'
            WHEN value BETWEEN 31 AND 100 THEN '31-100'
            ELSE '100+'
          END
        `),
        'rango'
      ],
      [Streak.sequelize.fn('COUNT', Streak.sequelize.col('id_streak')), 'cantidad']
    ],
    group: ['rango'],
    raw: true
  });

  const itemsRecuperacionTotal = await Streak.findOne({
    attributes: [
      [Streak.sequelize.fn('SUM', Streak.sequelize.col('recovery_items')), 'total']
    ],
    raw: true
  });

  return {
    total_rachas: totalRachas,
    racha_maxima: rachaMaxima ? {
      value: rachaMaxima.value,
      usuario: rachaMaxima.userProfile
    } : null,
    promedio_racha: Math.round(parseFloat(promedioRacha?.avg_value || 0) * 100) / 100,
    rachas_por_rango: rachasPorRango,
    items_recuperacion_total: parseInt(itemsRecuperacionTotal?.total || 0)
  };
};

/**
 * Resetear la racha de un usuario (admin)
 * @param {number} idUserProfile
 * @returns {Promise<Streak>}
 */
const resetearRachaUsuario = async (idUserProfile) => {
  const userProfile = await UserProfile.findByPk(idUserProfile);

  if (!userProfile || !userProfile.id_streak) {
    throw new NotFoundError('Usuario o racha no encontrada');
  }

  const racha = await Streak.findByPk(userProfile.id_streak);

  if (!racha) {
    throw new NotFoundError('Racha');
  }

  racha.last_value = racha.value;
  racha.value = 0;
  await racha.save();

  return racha;
};

/**
 * Otorgar items de recuperación a un usuario (admin)
 * @param {number} idUserProfile
 * @param {number} cantidad
 * @returns {Promise<Streak>}
 */
const otorgarItemsRecuperacion = async (idUserProfile, cantidad) => {
  const userProfile = await UserProfile.findByPk(idUserProfile);

  if (!userProfile || !userProfile.id_streak) {
    throw new NotFoundError('Usuario o racha no encontrada');
  }

  const racha = await Streak.findByPk(userProfile.id_streak);

  if (!racha) {
    throw new NotFoundError('Racha');
  }

  racha.recovery_items += cantidad;
  await racha.save();

  return racha;
};

/**
 * Actualizar la racha de un usuario al registrar asistencia
 * Esta función es llamada desde assistance-service
 * @param {number} idStreak
 * @param {boolean} continuaRacha - Si la asistencia continúa la racha
 * @returns {Promise<Streak>}
 */
const actualizarRacha = async (idStreak, continuaRacha) => {
  const racha = await Streak.findByPk(idStreak);

  if (!racha) {
    throw new NotFoundError('Racha');
  }

  if (continuaRacha) {
    racha.value += 1;
  } else {
    // Si no continúa la racha, verificar items de recuperación
    if (racha.recovery_items > 0) {
      racha.recovery_items -= 1;
      // Mantiene el value actual
    } else {
      // Pierde la racha
      racha.last_value = racha.value;
      racha.value = 1; // Nueva racha comienza en 1
    }
  }

  await racha.save();
  return racha;
};

/**
 * Crear una nueva racha para un usuario
 * @param {number} idUser
 * @param {number} idFrequency
 * @returns {Promise<Streak>}
 */
const crearRacha = async (idUser, idFrequency) => {
  const racha = await Streak.create({
    id_user: idUser,
    value: 0,
    id_frequency: idFrequency,
    last_value: 0,
    recovery_items: 0
  });

  return racha;
};

module.exports = {
  obtenerRachaUsuario,
  usarItemRecuperacion,
  obtenerEstadisticasGlobales,
  resetearRachaUsuario,
  otorgarItemsRecuperacion,
  actualizarRacha,
  crearRacha
};
