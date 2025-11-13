/**
 * Reward Stats Service - Lote 5
 * Maneja estadísticas de recompensas por gimnasio
 */

const { rewardRepository } = require('../infra/db/repositories');
const { NotFoundError } = require('../utils/errors');

// ============================================================================
// REWARD STATISTICS
// ============================================================================

/**
 * Obtiene estadísticas de recompensas de un gimnasio
 * @param {GetRewardStatsQuery} query
 * @returns {Promise<Object>} Estadísticas de recompensas
 */
async function getRewardStats(query) {
  const stats = await rewardRepository.getAggregatedRewardStats(query.gymId, {
    from_date: query.from_date,
    to_date: query.to_date,
  });

  return {
    gymId: query.gymId,
    totalRewardsClaimed: stats.total_rewards_claimed || 0,
    totalTokensSpent: stats.total_tokens_spent || 0,
    totalUsers: stats.total_users || 0,
    fromDate: query.from_date,
    toDate: query.to_date,
  };
}

/**
 * Obtiene estadísticas globales de recompensas
 * @param {GetGlobalRewardStatsQuery} query
 * @returns {Promise<Object>} Estadísticas globales
 */
async function getGlobalRewardStats(query) {
  // Para estadísticas globales, podríamos agregar todas las estadísticas de todos los gimnasios
  // Por ahora retornamos un placeholder que se puede implementar según necesidades
  return {
    totalRewardsClaimed: 0,
    totalTokensSpent: 0,
    totalUsers: 0,
    fromDate: query.from_date,
    toDate: query.to_date,
  };
}

/**
 * Lista estadísticas diarias de un gimnasio
 * @param {GetRewardStatsQuery} query (con gymId, from_date, to_date)
 * @returns {Promise<Array>} Array de estadísticas diarias
 */
async function listDailyStats(query) {
  const stats = await rewardRepository.findRewardStatsDaily(query.gymId, {
    from_date: query.from_date,
    to_date: query.to_date,
  });

  return stats;
}

/**
 * Actualiza o crea estadísticas diarias de un gimnasio
 * Esta función es típicamente llamada por trabajos programados (cron jobs)
 * @param {number} gymId - ID del gimnasio
 * @param {Date} day - Día para el que se calcula la estadística
 * @returns {Promise<Object>} Estadísticas creadas/actualizadas
 */
async function upsertDailyStat(gymId, day) {
  // Aquí iría la lógica para calcular las estadísticas del día
  // Por ahora es un placeholder
  const payload = {
    id_gym: gymId,
    day,
    total_rewards_claimed: 0,
    total_tokens_spent: 0,
    unique_users: 0,
  };

  return rewardRepository.upsertRewardStatsDaily(payload);
}

async function runDailyUpsert(fromDate, toDate) {
  const aggregates = await rewardRepository.aggregateClaimedRewardsByGymAndDay({
    fromDate,
    toDate,
  });

  for (const aggregate of aggregates) {
    if (!aggregate.id_gym) continue;

    const dayValue =
      aggregate.day instanceof Date ? aggregate.day : new Date(aggregate.day);

    await rewardRepository.upsertRewardStatsDaily({
      id_gym: aggregate.id_gym,
      day: dayValue,
      total_rewards_claimed: Number(aggregate.total_rewards_claimed) || 0,
      total_tokens_spent: Number(aggregate.total_tokens_spent) || 0,
      unique_users: Number(aggregate.unique_users) || 0,
    });
  }

  return aggregates.length;
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

const obtenerEstadisticasGimnasio = getRewardStats;
const obtenerEstadisticasGlobales = getGlobalRewardStats;

module.exports = {
  // New API
  getRewardStats,
  getGlobalRewardStats,
  listDailyStats,
  upsertDailyStat,
  runDailyUpsert,

  // Legacy API
  obtenerEstadisticasGimnasio,
  obtenerEstadisticasGlobales,
};

