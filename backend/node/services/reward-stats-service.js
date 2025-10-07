const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');
const ClaimedReward = require('../models/ClaimedReward');
const { TokenLedger } = require('../models');
const Gym = require('../models/Gym');

/**
 * NOTA: Este servicio ha sido actualizado para usar token_ledger en lugar de transaction
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
    throw new Error('Fechas invÃ¡lidas para upsert');
  }
  
  try {
    // Upsert de claims desde claimed_reward
    await sequelize.query(`
      INSERT INTO reward_gym_stats_daily (day, gym_id, claims, redeemed, revoked, tokens_spent, tokens_refunded)
      SELECT 
        DATE(cr.claimed_date) as day,
        cr.gym_id_snapshot as gym_id,
        COUNT(*) as claims,
        SUM(CASE WHEN cr.status = 'redeemed' THEN 1 ELSE 0 END) as redeemed,
        SUM(CASE WHEN cr.status = 'revoked' THEN 1 ELSE 0 END) as revoked,
        0 as tokens_spent,
        0 as tokens_refunded
      FROM claimed_reward cr
      WHERE 
        cr.provider_snapshot = 'gym'
        AND cr.gym_id_snapshot IS NOT NULL
        AND cr.claimed_date BETWEEN :from AND :to
      GROUP BY DATE(cr.claimed_date), cr.gym_id_snapshot
      ON DUPLICATE KEY UPDATE
        claims = claims + VALUES(claims),
        redeemed = redeemed + VALUES(redeemed),
        revoked = revoked + VALUES(revoked)
    `, {
      replacements: { from: fromDate, to: toDate },
      type: sequelize.QueryTypes.INSERT
    });
    
    // Upsert de tokens desde token_ledger (actualizado)
    await sequelize.query(`
      INSERT INTO reward_gym_stats_daily (day, gym_id, claims, redeemed, revoked, tokens_spent, tokens_refunded)
      SELECT
        DATE(tl.created_at) as day,
        r.id_gym as gym_id,
        0 as claims,
        0 as redeemed,
        0 as revoked,
        SUM(CASE WHEN tl.delta < 0 AND tl.reason = 'REWARD_CLAIM' THEN ABS(tl.delta) ELSE 0 END) as tokens_spent,
        SUM(CASE WHEN tl.delta > 0 AND tl.reason = 'REWARD_REFUND' THEN tl.delta ELSE 0 END) as tokens_refunded
      FROM token_ledger tl
      JOIN claimed_reward cr ON tl.ref_type = 'claimed_reward' AND tl.ref_id = cr.id_claimed_reward
      JOIN reward r ON cr.id_reward = r.id_reward
      WHERE
        r.provider = 'gym'
        AND r.id_gym IS NOT NULL
        AND tl.created_at BETWEEN :from AND :to
      GROUP BY DATE(tl.created_at), r.id_gym
      ON DUPLICATE KEY UPDATE
        tokens_spent = tokens_spent + VALUES(tokens_spent),
        tokens_refunded = tokens_refunded + VALUES(tokens_refunded)
    `, {
      replacements: { from: fromDate, to: toDate },
      type: sequelize.QueryTypes.INSERT
    });
    
    console.log(`âœ… Upsert completado para ventana ${fromDate.toISOString()} - ${toDate.toISOString()}`);
    
  } catch (error) {
    console.error('âŒ Error en runDailyUpsert:', error.message);
    throw error;
  }
};

/**
 * Obtener estadÃ­sticas de recompensas por gimnasio (rango de fechas)
 * Usa tabla B (reward_gym_stats_daily) para dÃ­as pasados + consulta A para hoy
 * @param {Date} from - Fecha de inicio
 * @param {Date} to - Fecha de fin
 * @returns {Promise<Array>} Array de stats por gym_id
 */
const getGymStatsRange = async (from, to) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  
  if (isNaN(fromDate) || isNaN(toDate)) {
    throw new Error('Fechas invÃ¡lidas');
  }
  
  if (fromDate > toDate) {
    throw new Error('La fecha de inicio debe ser menor que la fecha de fin');
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  
  let aggregatedStats = {};
  
  // Parte B: Si el rango incluye dÃ­as pasados, leer de reward_gym_stats_daily
  if (fromDate < today) {
    const historicalEnd = toDate < today ? toDate : new Date(today.getTime() - 1);
    
    const dailyStats = await sequelize.query(`
      SELECT 
        gym_id,
        SUM(claims) as total_claims,
        SUM(redeemed) as redeemed,
        SUM(revoked) as revoked,
        SUM(tokens_spent) as tokens_spent,
        SUM(tokens_refunded) as tokens_refunded
      FROM reward_gym_stats_daily
      WHERE day BETWEEN :from AND :to
      GROUP BY gym_id
    `, {
      replacements: { 
        from: fromDate.toISOString().split('T')[0], 
        to: historicalEnd.toISOString().split('T')[0]
      },
      type: sequelize.QueryTypes.SELECT
    });
    
    dailyStats.forEach(stat => {
      aggregatedStats[stat.gym_id] = {
        gym_id: parseInt(stat.gym_id),
        claims: parseInt(stat.total_claims) || 0,
        redeemed: parseInt(stat.redeemed) || 0,
        revoked: parseInt(stat.revoked) || 0,
        pending: 0, // Se calcularÃ¡ despuÃ©s
        tokens_spent: parseInt(stat.tokens_spent) || 0,
        tokens_refunded: parseInt(stat.tokens_refunded) || 0
      };
    });
  }
  
  // Parte A: Si el rango incluye hoy, consultar claimed_reward directamente
  if (toDate >= today) {
    const todayStart = fromDate > today ? fromDate : today;
    
    const claimStats = await sequelize.query(`
      SELECT 
        cr.gym_id_snapshot as gym_id,
        COUNT(*) as total_claims,
        SUM(CASE WHEN cr.status = 'redeemed' THEN 1 ELSE 0 END) as redeemed,
        SUM(CASE WHEN cr.status = 'revoked' THEN 1 ELSE 0 END) as revoked,
        SUM(CASE WHEN cr.status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM claimed_reward cr
      WHERE 
        cr.provider_snapshot = 'gym'
        AND cr.gym_id_snapshot IS NOT NULL
        AND cr.claimed_date BETWEEN :from AND :to
      GROUP BY cr.gym_id_snapshot
    `, {
      replacements: { from: todayStart, to: toDate },
      type: sequelize.QueryTypes.SELECT
    });
    
    // Actualizado para usar token_ledger
    const ledgerStats = await sequelize.query(`
      SELECT
        r.id_gym as gym_id,
        SUM(CASE WHEN tl.delta < 0 AND tl.reason = 'REWARD_CLAIM' THEN ABS(tl.delta) ELSE 0 END) as tokens_spent,
        SUM(CASE WHEN tl.delta > 0 AND tl.reason = 'REWARD_REFUND' THEN tl.delta ELSE 0 END) as tokens_refunded
      FROM token_ledger tl
      JOIN claimed_reward cr ON tl.ref_type = 'claimed_reward' AND tl.ref_id = cr.id_claimed_reward
      JOIN reward r ON cr.id_reward = r.id_reward
      WHERE
        r.provider = 'gym'
        AND r.id_gym IS NOT NULL
        AND tl.created_at BETWEEN :from AND :to
      GROUP BY r.id_gym
    `, {
      replacements: { from: todayStart, to: toDate },
      type: sequelize.QueryTypes.SELECT
    });
    
    // Agregar stats de hoy a los agregados
    claimStats.forEach(stat => {
      const gymId = stat.gym_id;
      if (!aggregatedStats[gymId]) {
        aggregatedStats[gymId] = {
          gym_id: parseInt(gymId),
          claims: 0,
          redeemed: 0,
          revoked: 0,
          pending: 0,
          tokens_spent: 0,
          tokens_refunded: 0
        };
      }
      aggregatedStats[gymId].claims += parseInt(stat.total_claims);
      aggregatedStats[gymId].redeemed += parseInt(stat.redeemed);
      aggregatedStats[gymId].revoked += parseInt(stat.revoked);
      aggregatedStats[gymId].pending += parseInt(stat.pending);
    });
    
    ledgerStats.forEach(stat => {
      const gymId = stat.gym_id;
      if (!aggregatedStats[gymId]) {
        aggregatedStats[gymId] = {
          gym_id: parseInt(gymId),
          claims: 0,
          redeemed: 0,
          revoked: 0,
          pending: 0,
          tokens_spent: 0,
          tokens_refunded: 0
        };
      }
      aggregatedStats[gymId].tokens_spent += parseInt(stat.tokens_spent) || 0;
      aggregatedStats[gymId].tokens_refunded += parseInt(stat.tokens_refunded) || 0;
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
      gym_id: stat.gym_id,
      gym_name: gym ? gym.name : null,
      gym_city: gym ? gym.city : null,
      claims: stat.claims,
      redeemed: stat.redeemed,
      revoked: stat.revoked,
      pending: stat.pending,
      tokens_spent: stat.tokens_spent,
      tokens_refunded: stat.tokens_refunded,
      net_tokens: stat.tokens_spent - stat.tokens_refunded
    });
  }
  
  return results.sort((a, b) => b.claims - a.claims);
};

/**
 * Obtener estadÃ­sticas de un gimnasio especÃ­fico
 * Usa tabla B para dÃ­as pasados + consulta A para hoy
 * @param {number} gymId - ID del gimnasio
 * @param {Date} from - Fecha de inicio
 * @param {Date} to - Fecha de fin
 * @returns {Promise<Object>} Stats del gym
 */
const getGymStatsById = async (gymId, from, to) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  
  if (isNaN(fromDate) || isNaN(toDate)) {
    throw new Error('Fechas invÃ¡lidas');
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
    redeemed: 0,
    revoked: 0,
    pending: 0,
    tokens_spent: 0,
    tokens_refunded: 0
  };
  
  // Parte B: DÃ­as pasados
  if (fromDate < today) {
    const historicalEnd = toDate < today ? toDate : new Date(today.getTime() - 1);
    
    const dailyStats = await sequelize.query(`
      SELECT 
        SUM(claims) as total_claims,
        SUM(redeemed) as redeemed,
        SUM(revoked) as revoked,
        SUM(tokens_spent) as tokens_spent,
        SUM(tokens_refunded) as tokens_refunded
      FROM reward_gym_stats_daily
      WHERE gym_id = :gymId AND day BETWEEN :from AND :to
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
      aggregated.redeemed += parseInt(dailyStats[0].redeemed) || 0;
      aggregated.revoked += parseInt(dailyStats[0].revoked) || 0;
      aggregated.tokens_spent += parseInt(dailyStats[0].tokens_spent) || 0;
      aggregated.tokens_refunded += parseInt(dailyStats[0].tokens_refunded) || 0;
    }
  }
  
  // Parte A: Hoy
  if (toDate >= today) {
    const todayStart = fromDate > today ? fromDate : today;
    
    const claimStats = await sequelize.query(`
      SELECT 
        COUNT(*) as total_claims,
        SUM(CASE WHEN status = 'redeemed' THEN 1 ELSE 0 END) as redeemed,
        SUM(CASE WHEN status = 'revoked' THEN 1 ELSE 0 END) as revoked,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM claimed_reward
      WHERE 
        provider_snapshot = 'gym'
        AND gym_id_snapshot = :gymId
        AND claimed_date BETWEEN :from AND :to
    `, {
      replacements: { gymId, from: todayStart, to: toDate },
      type: sequelize.QueryTypes.SELECT
    });
    
    // Actualizado para usar token_ledger
    const ledgerStats = await sequelize.query(`
      SELECT
        SUM(CASE WHEN tl.delta < 0 AND tl.reason = 'REWARD_CLAIM' THEN ABS(tl.delta) ELSE 0 END) as tokens_spent,
        SUM(CASE WHEN tl.delta > 0 AND tl.reason = 'REWARD_REFUND' THEN tl.delta ELSE 0 END) as tokens_refunded
      FROM token_ledger tl
      JOIN claimed_reward cr ON tl.ref_type = 'claimed_reward' AND tl.ref_id = cr.id_claimed_reward
      JOIN reward r ON cr.id_reward = r.id_reward
      WHERE
        r.provider = 'gym'
        AND r.id_gym = :gymId
        AND tl.created_at BETWEEN :from AND :to
    `, {
      replacements: { gymId, from: todayStart, to: toDate },
      type: sequelize.QueryTypes.SELECT
    });
    
    if (claimStats[0]) {
      aggregated.claims += parseInt(claimStats[0].total_claims) || 0;
      aggregated.redeemed += parseInt(claimStats[0].redeemed) || 0;
      aggregated.revoked += parseInt(claimStats[0].revoked) || 0;
      aggregated.pending += parseInt(claimStats[0].pending) || 0;
    }
    
    if (ledgerStats[0]) {
      aggregated.tokens_spent += parseInt(ledgerStats[0].tokens_spent) || 0;
      aggregated.tokens_refunded += parseInt(ledgerStats[0].tokens_refunded) || 0;
    }
  }
  
  return {
    gym_id: gym.id_gym,
    gym_name: gym.name,
    gym_city: gym.city,
    claims: aggregated.claims,
    redeemed: aggregated.redeemed,
    revoked: aggregated.revoked,
    pending: aggregated.pending,
    tokens_spent: aggregated.tokens_spent,
    tokens_refunded: aggregated.tokens_refunded,
    net_tokens: aggregated.tokens_spent - aggregated.tokens_refunded,
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
