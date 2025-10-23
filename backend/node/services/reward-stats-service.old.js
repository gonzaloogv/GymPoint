const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');
const ClaimedReward = require('../models/ClaimedReward');
const { TokenLedger } = require('../models');
const Gym = require('../models/Gym');

/**
 * Servicio de estadísticas de recompensas por gimnasio
 * Ajustado para usar la estructura actual de BD:
 * - reward_gym_stats_daily: id_gym, total_rewards_claimed, total_tokens_spent, unique_users
 * - claimed_reward: sin campos snapshot
 * - Status: PENDING, ACTIVE, USED, EXPIRED (uppercase)
 */

/**
 * Ejecutar upsert de agregados diarios para una ventana de tiempo
 * @param {Date} from - Fecha de inicio de ventana
 * @param {Date} to - Fecha de fin de ventana
 * @returns {Promise<void>}
 */
const runDailyUpsert = async (from, to) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (isNaN(fromDate) || isNaN(toDate)) {
    throw new Error('Fechas inválidas para upsert');
  }

  try {
    // Upsert de claims y tokens desde claimed_reward + reward
    // Estructura actual de BD: id_gym, total_rewards_claimed, total_tokens_spent, unique_users
    await sequelize.query(`
      INSERT INTO reward_gym_stats_daily (day, id_gym, total_rewards_claimed, total_tokens_spent, unique_users)
      SELECT
        DATE(cr.claimed_date) as day,
        r.id_gym as id_gym,
        COUNT(*) as total_rewards_claimed,
        SUM(cr.tokens_spent) as total_tokens_spent,
        COUNT(DISTINCT cr.id_user_profile) as unique_users
      FROM claimed_reward cr
      JOIN reward r ON cr.id_reward = r.id_reward
      WHERE
        r.id_gym IS NOT NULL
        AND cr.claimed_date BETWEEN :from AND :to
      GROUP BY DATE(cr.claimed_date), r.id_gym
      ON DUPLICATE KEY UPDATE
        total_rewards_claimed = total_rewards_claimed + VALUES(total_rewards_claimed),
        total_tokens_spent = total_tokens_spent + VALUES(total_tokens_spent),
        unique_users = unique_users + VALUES(unique_users)
    `, {
      replacements: { from: fromDate, to: toDate },
      type: sequelize.QueryTypes.INSERT
    });

    console.log(` Upsert completado para ventana ${fromDate.toISOString()} - ${toDate.toISOString()}`);

  } catch (error) {
    console.error(' Error en runDailyUpsert:', error.message);
    throw error;
  }
};

/**
 * Obtener estadísticas de recompensas por gimnasio (rango de fechas)
 * Usa tabla reward_gym_stats_daily para días pasados + consulta a claimed_reward para hoy
 * @param {Date} from - Fecha de inicio
 * @param {Date} to - Fecha de fin
 * @returns {Promise<Array>} Array de stats por id_gym
 */
const getGymStatsRange = async (from, to) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (isNaN(fromDate) || isNaN(toDate)) {
    throw new Error('Fechas inválidas');
  }

  if (fromDate > toDate) {
    throw new Error('La fecha de inicio debe ser menor que la fecha de fin');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  let aggregatedStats = {};

  // Parte B: Si el rango incluye días pasados, leer de reward_gym_stats_daily
  if (fromDate < today) {
    const historicalEnd = toDate < today ? toDate : new Date(today.getTime() - 1);

    const dailyStats = await sequelize.query(`
      SELECT
        id_gym,
        SUM(total_rewards_claimed) as total_claims,
        SUM(total_tokens_spent) as total_tokens,
        SUM(unique_users) as unique_users
      FROM reward_gym_stats_daily
      WHERE day BETWEEN :from AND :to
      GROUP BY id_gym
    `, {
      replacements: {
        from: fromDate.toISOString().split('T')[0],
        to: historicalEnd.toISOString().split('T')[0]
      },
      type: sequelize.QueryTypes.SELECT
    });

    dailyStats.forEach(stat => {
      aggregatedStats[stat.id_gym] = {
        id_gym: parseInt(stat.id_gym),
        claims: parseInt(stat.total_claims) || 0,
        tokens_spent: parseInt(stat.total_tokens) || 0,
        unique_users: parseInt(stat.unique_users) || 0
      };
    });
  }

  // Parte A: Si el rango incluye hoy, consultar claimed_reward directamente
  if (toDate >= today) {
    const todayStart = fromDate > today ? fromDate : today;

    const claimStats = await sequelize.query(`
      SELECT
        r.id_gym as id_gym,
        COUNT(*) as total_claims,
        SUM(cr.tokens_spent) as total_tokens,
        COUNT(DISTINCT cr.id_user_profile) as unique_users
      FROM claimed_reward cr
      JOIN reward r ON cr.id_reward = r.id_reward
      WHERE
        r.id_gym IS NOT NULL
        AND cr.claimed_date BETWEEN :from AND :to
      GROUP BY r.id_gym
    `, {
      replacements: { from: todayStart, to: toDate },
      type: sequelize.QueryTypes.SELECT
    });

    claimStats.forEach(stat => {
      const gymId = stat.id_gym;
      if (!aggregatedStats[gymId]) {
        aggregatedStats[gymId] = {
          id_gym: parseInt(gymId),
          claims: 0,
          tokens_spent: 0,
          unique_users: 0
        };
      }
      aggregatedStats[gymId].claims += parseInt(stat.total_claims);
      aggregatedStats[gymId].tokens_spent += parseInt(stat.total_tokens) || 0;
      aggregatedStats[gymId].unique_users += parseInt(stat.unique_users) || 0;
    });
  }

  // Convertir a array y agregar info del gym
  const results = [];
  for (const gymId in aggregatedStats) {
    const stat = aggregatedStats[gymId];

    const gym = await Gym.findByPk(gymId, {
      attributes: ['id_gym', 'name', 'city']
    });

    results.push({
      id_gym: stat.id_gym,
      gym_name: gym ? gym.name : null,
      gym_city: gym ? gym.city : null,
      total_claims: stat.claims,
      tokens_spent: stat.tokens_spent,
      unique_users: stat.unique_users
    });
  }

  return results.sort((a, b) => b.total_claims - a.total_claims);
};

/**
 * Obtener estadísticas de un gimnasio específico
 * Usa tabla reward_gym_stats_daily para días pasados + consulta a claimed_reward para hoy
 * @param {number} gymId - ID del gimnasio
 * @param {Date} from - Fecha de inicio
 * @param {Date} to - Fecha de fin
 * @returns {Promise<Object>} Stats del gym
 */
const getGymStatsById = async (gymId, from, to) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (isNaN(fromDate) || isNaN(toDate)) {
    throw new Error('Fechas inválidas');
  }

  if (fromDate > toDate) {
    throw new Error('La fecha de inicio debe ser menor que la fecha de fin');
  }

  const gym = await Gym.findByPk(gymId);
  if (!gym) {
    throw new Error('Gimnasio no encontrado');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let aggregated = {
    claims: 0,
    tokens_spent: 0,
    unique_users: 0
  };

  // Parte B: Días pasados
  if (fromDate < today) {
    const historicalEnd = toDate < today ? toDate : new Date(today.getTime() - 1);

    const dailyStats = await sequelize.query(`
      SELECT
        SUM(total_rewards_claimed) as total_claims,
        SUM(total_tokens_spent) as total_tokens,
        SUM(unique_users) as unique_users
      FROM reward_gym_stats_daily
      WHERE id_gym = :gymId AND day BETWEEN :from AND :to
    `, {
      replacements: {
        gymId,
        from: fromDate.toISOString().split('T')[0],
        to: historicalEnd.toISOString().split('T')[0]
      },
      type: sequelize.QueryTypes.SELECT
    });

    if (dailyStats[0]) {
      aggregated.claims += parseInt(dailyStats[0].total_claims) || 0;
      aggregated.tokens_spent += parseInt(dailyStats[0].total_tokens) || 0;
      aggregated.unique_users += parseInt(dailyStats[0].unique_users) || 0;
    }
  }

  // Parte A: Hoy
  if (toDate >= today) {
    const todayStart = fromDate > today ? fromDate : today;

    const claimStats = await sequelize.query(`
      SELECT
        COUNT(*) as total_claims,
        SUM(cr.tokens_spent) as total_tokens,
        COUNT(DISTINCT cr.id_user_profile) as unique_users
      FROM claimed_reward cr
      JOIN reward r ON cr.id_reward = r.id_reward
      WHERE
        r.id_gym = :gymId
        AND cr.claimed_date BETWEEN :from AND :to
    `, {
      replacements: { gymId, from: todayStart, to: toDate },
      type: sequelize.QueryTypes.SELECT
    });

    if (claimStats[0]) {
      aggregated.claims += parseInt(claimStats[0].total_claims) || 0;
      aggregated.tokens_spent += parseInt(claimStats[0].total_tokens) || 0;
      aggregated.unique_users += parseInt(claimStats[0].unique_users) || 0;
    }
  }

  return {
    id_gym: gym.id_gym,
    gym_name: gym.name,
    gym_city: gym.city,
    total_claims: aggregated.claims,
    tokens_spent: aggregated.tokens_spent,
    unique_users: aggregated.unique_users,
    period: {
      from: fromDate.toISOString(),
      to: toDate.toISOString()
    }
  };
};

module.exports = {
  runDailyUpsert,
  getGymStatsRange,
  getGymStatsById
};
