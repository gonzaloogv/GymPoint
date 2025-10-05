const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');
const ClaimedReward = require('../models/ClaimedReward');
const Transaction = require('../models/Transaction');
const Gym = require('../models/Gym');

/**
 * Obtener estadísticas de recompensas por gimnasio (rango de fechas)
 * @param {Date} from - Fecha de inicio
 * @param {Date} to - Fecha de fin
 * @returns {Promise<Array>} Array de stats por gym_id
 */
const getGymStatsRange = async (from, to) => {
  // Validar fechas
  const fromDate = new Date(from);
  const toDate = new Date(to);
  
  if (isNaN(fromDate) || isNaN(toDate)) {
    throw new Error('Fechas inválidas');
  }
  
  if (fromDate > toDate) {
    throw new Error('La fecha de inicio debe ser menor que la fecha de fin');
  }
  
  // Query agregado sobre claimed_reward
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
    replacements: { from: fromDate, to: toDate },
    type: sequelize.QueryTypes.SELECT
  });
  
  // Query agregado sobre transaction (ledger)
  const ledgerStats = await sequelize.query(`
    SELECT 
      r.id_gym as gym_id,
      SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) as tokens_spent,
      SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as tokens_refunded
    FROM transaction t
    JOIN reward r ON t.id_reward = r.id_reward
    WHERE 
      r.provider = 'gym'
      AND r.id_gym IS NOT NULL
      AND t.date BETWEEN :from AND :to
    GROUP BY r.id_gym
  `, {
    replacements: { from: fromDate, to: toDate },
    type: sequelize.QueryTypes.SELECT
  });
  
  // Combinar resultados
  const gymIds = new Set([
    ...claimStats.map(s => s.gym_id),
    ...ledgerStats.map(s => s.gym_id)
  ]);
  
  const results = [];
  
  for (const gymId of gymIds) {
    const claims = claimStats.find(s => s.gym_id === gymId) || {
      total_claims: 0,
      redeemed: 0,
      revoked: 0,
      pending: 0
    };
    
    const ledger = ledgerStats.find(s => s.gym_id === gymId) || {
      tokens_spent: 0,
      tokens_refunded: 0
    };
    
    // Obtener nombre del gym
    const gym = await Gym.findByPk(gymId, {
      attributes: ['id_gym', 'name', 'city']
    });
    
    results.push({
      gym_id: parseInt(gymId),
      gym_name: gym ? gym.name : null,
      gym_city: gym ? gym.city : null,
      claims: parseInt(claims.total_claims),
      redeemed: parseInt(claims.redeemed),
      revoked: parseInt(claims.revoked),
      pending: parseInt(claims.pending),
      tokens_spent: parseInt(ledger.tokens_spent) || 0,
      tokens_refunded: parseInt(ledger.tokens_refunded) || 0,
      net_tokens: (parseInt(ledger.tokens_spent) || 0) - (parseInt(ledger.tokens_refunded) || 0)
    });
  }
  
  return results.sort((a, b) => b.claims - a.claims);
};

/**
 * Obtener estadísticas de un gimnasio específico
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
  
  // Verificar que el gym existe
  const gym = await Gym.findByPk(gymId);
  if (!gym) {
    throw new Error('Gimnasio no encontrado');
  }
  
  // Stats de claims
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
    replacements: { gymId, from: fromDate, to: toDate },
    type: sequelize.QueryTypes.SELECT
  });
  
  // Stats de ledger
  const ledgerStats = await sequelize.query(`
    SELECT 
      SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) as tokens_spent,
      SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as tokens_refunded
    FROM transaction t
    JOIN reward r ON t.id_reward = r.id_reward
    WHERE 
      r.provider = 'gym'
      AND r.id_gym = :gymId
      AND t.date BETWEEN :from AND :to
  `, {
    replacements: { gymId, from: fromDate, to: toDate },
    type: sequelize.QueryTypes.SELECT
  });
  
  const claims = claimStats[0] || {
    total_claims: 0,
    redeemed: 0,
    revoked: 0,
    pending: 0
  };
  
  const ledger = ledgerStats[0] || {
    tokens_spent: 0,
    tokens_refunded: 0
  };
  
  return {
    gym_id: gym.id_gym,
    gym_name: gym.name,
    gym_city: gym.city,
    claims: parseInt(claims.total_claims),
    redeemed: parseInt(claims.redeemed),
    revoked: parseInt(claims.revoked),
    pending: parseInt(claims.pending),
    tokens_spent: parseInt(ledger.tokens_spent) || 0,
    tokens_refunded: parseInt(ledger.tokens_refunded) || 0,
    net_tokens: (parseInt(ledger.tokens_spent) || 0) - (parseInt(ledger.tokens_refunded) || 0),
    period: {
      from: fromDate.toISOString(),
      to: toDate.toISOString()
    }
  };
};

module.exports = {
  getGymStatsRange,
  getGymStatsById
};
