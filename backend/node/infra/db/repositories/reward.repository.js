/**
 * Repository para Rewards & Tokens
 * Proporciona acceso a datos de recompensas, códigos, canjes, tokens y estadísticas
 */

const { Op } = require('sequelize');
const sequelize = require('../../../config/database');
const {
  Reward,
  RewardCode,
  ClaimedReward,
  TokenLedger,
  RewardGymStatsDaily,
  Gym,
  UserProfile,
} = require('../../../models');
const {
  toReward,
  toRewards,
  toRewardCode,
  toRewardCodes,
  toClaimedReward,
  toClaimedRewards,
  toTokenLedger,
  toTokenLedgers,
  toRewardGymStatsDaily,
  toRewardGymStatsDailies,
} = require('../mappers/reward.mapper');

// ============================================================================
// REWARD (Recompensas)
// ============================================================================

/**
 * Lista recompensas con filtros y paginación
 */
async function findRewards(filters = {}, options = {}) {
  const where = {};

  // Filtro por gimnasio (null = globales)
  if (filters.gymId !== undefined) {
    where.id_gym = filters.gymId;
  }

  // Filtro por activo
  if (filters.is_active !== undefined) {
    where.is_active = filters.is_active;
  }

  // Filtro por rango de costo
  if (filters.min_cost !== null && filters.min_cost !== undefined) {
    where.token_cost = where.token_cost || {};
    where.token_cost[Op.gte] = filters.min_cost;
  }
  if (filters.max_cost !== null && filters.max_cost !== undefined) {
    where.token_cost = where.token_cost || {};
    where.token_cost[Op.lte] = filters.max_cost;
  }

  // Filtro por stock disponible
  if (filters.available_only) {
    where[Op.or] = [
      { stock: { [Op.gt]: 0 } },
      { stock: null }, // Ilimitado
    ];
  }

  // Ordenamiento
  const order = [[filters.sortBy || 'created_at', filters.order || 'DESC']];

  // Include Gym si es necesario
  const include = [
    {
      model: Gym,
      as: 'gym',
      attributes: ['id_gym', 'name', 'city'],
      required: false,
    },
  ];

  const { page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const { count, rows } = await Reward.findAndCountAll({
    where,
    include,
    order,
    limit,
    offset,
    transaction: options.transaction,
  });

  return {
    items: toRewards(rows),
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

/**
 * Busca recompensa por ID
 */
async function findRewardById(rewardId, options = {}) {
  const reward = await Reward.findByPk(rewardId, {
    include: [
      {
        model: Gym,
        as: 'gym',
        attributes: ['id_gym', 'name', 'city'],
        required: false,
      },
    ],
    transaction: options.transaction,
  });
  return toReward(reward);
}

/**
 * Crea una nueva recompensa
 */
async function createReward(payload, options = {}) {
  const reward = await Reward.create(payload, {
    transaction: options.transaction,
  });
  return findRewardById(reward.id_reward, options);
}

/**
 * Actualiza una recompensa
 */
async function updateReward(rewardId, payload, options = {}) {
  await Reward.update(payload, {
    where: { id_reward: rewardId },
    transaction: options.transaction,
  });
  return findRewardById(rewardId, options);
}

/**
 * Elimina una recompensa (soft delete)
 */
async function deleteReward(rewardId, options = {}) {
  return Reward.destroy({
    where: { id_reward: rewardId },
    transaction: options.transaction,
  });
}

/**
 * Decrementa el stock de una recompensa
 */
async function decrementRewardStock(rewardId, quantity = 1, options = {}) {
  const reward = await Reward.findByPk(rewardId, {
    transaction: options.transaction,
  });

  if (!reward) return null;
  if (reward.stock === null) return toReward(reward); // Stock ilimitado

  reward.stock -= quantity;
  if (reward.stock < 0) reward.stock = 0;
  await reward.save({ transaction: options.transaction });

  return toReward(reward);
}

// ============================================================================
// REWARD CODE (Códigos de recompensa)
// ============================================================================

/**
 * Lista códigos de una recompensa
 */
async function findRewardCodes(rewardId, filters = {}, options = {}) {
  const where = { id_reward: rewardId };

  if (filters.unused_only) {
    where.is_used = false;
  }

  const codes = await RewardCode.findAll({
    where,
    include: [
      {
        model: Reward,
        as: 'Reward',
        attributes: ['id_reward', 'name', 'token_cost'],
        required: false,
      },
    ],
    order: [['created_at', 'DESC']],
    transaction: options.transaction,
  });

  return toRewardCodes(codes);
}

/**
 * Busca código por su string
 */
async function findRewardCodeByString(code, options = {}) {
  const rewardCode = await RewardCode.findOne({
    where: { code: code.toUpperCase() },
    include: [
      {
        model: Reward,
        as: 'Reward',
        required: false,
      },
    ],
    transaction: options.transaction,
  });
  return toRewardCode(rewardCode);
}

/**
 * Busca código por ID
 */
async function findRewardCodeById(codeId, options = {}) {
  const rewardCode = await RewardCode.findByPk(codeId, {
    include: [
      {
        model: Reward,
        as: 'Reward',
        required: false,
      },
    ],
    transaction: options.transaction,
  });
  return toRewardCode(rewardCode);
}

/**
 * Crea un código de recompensa
 */
async function createRewardCode(payload, options = {}) {
  const code = await RewardCode.create(
    {
      ...payload,
      code: payload.code.toUpperCase(),
    },
    {
      transaction: options.transaction,
    }
  );
  return findRewardCodeById(code.id_code, options);
}

/**
 * Marca un código como usado
 */
async function markRewardCodeAsUsed(codeId, options = {}) {
  await RewardCode.update(
    { is_used: true },
    {
      where: { id_code: codeId },
      transaction: options.transaction,
    }
  );
  return findRewardCodeById(codeId, options);
}

// ============================================================================
// CLAIMED REWARD (Recompensas canjeadas)
// ============================================================================

/**
 * Lista recompensas canjeadas con filtros y paginación
 */
async function findClaimedRewards(filters = {}, options = {}) {
  const where = {};

  if (filters.userId) {
    where.id_user_profile = filters.userId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.gymId) {
    where['$Reward.id_gym$'] = filters.gymId;
  }

  if (filters.from_date) {
    where.claimed_date = where.claimed_date || {};
    where.claimed_date[Op.gte] = filters.from_date;
  }

  if (filters.to_date) {
    where.claimed_date = where.claimed_date || {};
    where.claimed_date[Op.lte] = filters.to_date;
  }

  const { page = 1, limit = 20, sortBy = 'claimed_date', order = 'DESC' } = filters;
  const offset = (page - 1) * limit;

  const include = [
    {
      model: Reward,
      as: 'Reward',
      include: [
        {
          model: Gym,
          as: 'gym',
          attributes: ['id_gym', 'name', 'city'],
          required: false,
        },
      ],
      required: false,
    },
    {
      model: RewardCode,
      as: 'RewardCode',
      required: false,
    },
  ];

  const { count, rows } = await ClaimedReward.findAndCountAll({
    where,
    include,
    order: [[sortBy, order]],
    limit,
    offset,
    transaction: options.transaction,
  });

  return {
    items: toClaimedRewards(rows),
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

/**
 * Busca recompensa canjeada por ID
 */
async function findClaimedRewardById(claimedRewardId, options = {}) {
  const claimedReward = await ClaimedReward.findByPk(claimedRewardId, {
    include: [
      {
        model: Reward,
        as: 'Reward',
        include: [
          {
            model: Gym,
            as: 'gym',
            attributes: ['id_gym', 'name', 'city'],
            required: false,
          },
        ],
        required: false,
      },
      {
        model: RewardCode,
        as: 'RewardCode',
        required: false,
      },
    ],
    transaction: options.transaction,
  });
  return toClaimedReward(claimedReward);
}

/**
 * Crea un registro de recompensa canjeada
 */
async function createClaimedReward(payload, options = {}) {
  const claimed = await ClaimedReward.create(payload, {
    transaction: options.transaction,
  });
  return findClaimedRewardById(claimed.id_claimed_reward, options);
}

/**
 * Marca una recompensa canjeada como usada
 */
async function markClaimedRewardAsUsed(claimedRewardId, options = {}) {
  await ClaimedReward.update(
    { status: 'USED', used_at: new Date() },
    {
      where: { id_claimed_reward: claimedRewardId },
      transaction: options.transaction,
    }
  );
  return findClaimedRewardById(claimedRewardId, options);
}

/**
 * Cuenta recompensas canjeadas por usuario
 */
async function countClaimedRewardsByUser(userId, options = {}) {
  return ClaimedReward.count({
    where: { id_user_profile: userId },
    transaction: options.transaction,
  });
}

// ============================================================================
// TOKEN LEDGER (Historial de tokens)
// ============================================================================

/**
 * Lista entradas del ledger de tokens con filtros y paginación
 */
async function findTokenLedger(filters = {}, options = {}) {
  const where = {};

  if (filters.userId) {
    where.id_user_profile = filters.userId;
  }

  if (filters.from_date) {
    where.created_at = where.created_at || {};
    where.created_at[Op.gte] = filters.from_date;
  }

  if (filters.to_date) {
    where.created_at = where.created_at || {};
    where.created_at[Op.lte] = filters.to_date;
  }

  if (filters.ref_type) {
    where.ref_type = filters.ref_type;
  }

  const { page = 1, limit = 50, sortBy = 'created_at', order = 'DESC' } = filters;
  const offset = (page - 1) * limit;

  const { count, rows } = await TokenLedger.findAndCountAll({
    where,
    order: [[sortBy, order]],
    limit,
    offset,
    transaction: options.transaction,
  });

  return {
    items: toTokenLedgers(rows),
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

/**
 * Crea una entrada en el ledger de tokens
 */
async function createTokenLedgerEntry(payload, options = {}) {
  const entry = await TokenLedger.create(payload, {
    transaction: options.transaction,
  });
  return toTokenLedger(entry);
}

/**
 * Obtiene el balance actual de tokens de un usuario
 * (último balance_after del ledger)
 */
async function getTokenBalance(userId, options = {}) {
  const lastEntry = await TokenLedger.findOne({
    where: { id_user_profile: userId },
    order: [['id_ledger', 'DESC']],
    attributes: ['balance_after'],
    transaction: options.transaction,
  });

  return lastEntry ? lastEntry.balance_after : 0;
}

/**
 * Suma total de tokens ganados por un usuario
 */
async function getTotalTokensEarned(userId, options = {}) {
  const result = await TokenLedger.sum('delta', {
    where: {
      id_user_profile: userId,
      delta: { [Op.gt]: 0 },
    },
    transaction: options.transaction,
  });
  return result || 0;
}

/**
 * Suma total de tokens gastados por un usuario (valor absoluto)
 */
async function getTotalTokensSpent(userId, options = {}) {
  const result = await TokenLedger.sum('delta', {
    where: {
      id_user_profile: userId,
      delta: { [Op.lt]: 0 },
    },
    transaction: options.transaction,
  });
  return result ? Math.abs(result) : 0;
}

// ============================================================================
// REWARD GYM STATS DAILY (Estadísticas diarias)
// ============================================================================

/**
 * Lista estadísticas diarias de un gimnasio
 */
async function findRewardStatsDaily(gymId, filters = {}, options = {}) {
  const where = { id_gym: gymId };

  if (filters.from_date) {
    where.day = where.day || {};
    where.day[Op.gte] = filters.from_date;
  }

  if (filters.to_date) {
    where.day = where.day || {};
    where.day[Op.lte] = filters.to_date;
  }

  const stats = await RewardGymStatsDaily.findAll({
    where,
    order: [['day', 'DESC']],
    transaction: options.transaction,
  });

  return toRewardGymStatsDailies(stats);
}

/**
 * Obtiene estadísticas agregadas de un gimnasio
 */
async function getAggregatedRewardStats(gymId, filters = {}, options = {}) {
  const where = { id_gym: gymId };

  if (filters.from_date) {
    where.day = where.day || {};
    where.day[Op.gte] = filters.from_date;
  }

  if (filters.to_date) {
    where.day = where.day || {};
    where.day[Op.lte] = filters.to_date;
  }

  const stats = await RewardGymStatsDaily.findAll({
    where,
    attributes: [
      [sequelize.fn('SUM', sequelize.col('total_rewards_claimed')), 'total_rewards_claimed'],
      [sequelize.fn('SUM', sequelize.col('total_tokens_spent')), 'total_tokens_spent'],
      [sequelize.fn('SUM', sequelize.col('unique_users')), 'total_users'], // Aproximado
    ],
    transaction: options.transaction,
    raw: true,
  });

  return stats[0] || {
    total_rewards_claimed: 0,
    total_tokens_spent: 0,
    total_users: 0,
  };
}

/**
 * Crea o actualiza estadísticas diarias
 */
async function upsertRewardStatsDaily(payload, options = {}) {
  const [stat, created] = await RewardGymStatsDaily.upsert(
    payload,
    {
      transaction: options.transaction,
    }
  );
  return toRewardGymStatsDaily(stat);
}

module.exports = {
  // Reward
  findRewards,
  findRewardById,
  createReward,
  updateReward,
  deleteReward,
  decrementRewardStock,

  // RewardCode
  findRewardCodes,
  findRewardCodeByString,
  findRewardCodeById,
  createRewardCode,
  markRewardCodeAsUsed,

  // ClaimedReward
  findClaimedRewards,
  findClaimedRewardById,
  createClaimedReward,
  markClaimedRewardAsUsed,
  countClaimedRewardsByUser,

  // TokenLedger
  findTokenLedger,
  createTokenLedgerEntry,
  getTokenBalance,
  getTotalTokensEarned,
  getTotalTokensSpent,

  // RewardGymStatsDaily
  findRewardStatsDaily,
  getAggregatedRewardStats,
  upsertRewardStatsDaily,
};
