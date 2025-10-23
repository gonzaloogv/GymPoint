/**
 * Reward Service - Lote 5
 * Maneja recompensas, códigos y canjes usando Commands/Queries
 */

const sequelize = require('../config/database');
const { rewardRepository } = require('../infra/db/repositories');
const { userProfileRepository } = require('../infra/db/repositories');
const { NotFoundError, ConflictError, ValidationError } = require('../utils/errors');

// ============================================================================
// REWARDS
// ============================================================================

/**
 * Lista recompensas con filtros y paginación
 * @param {ListRewardsQuery} query
 * @returns {Promise<Object>} Resultado paginado con recompensas (POJOs)
 */
async function listRewards(query) {
  return rewardRepository.findRewards(query);
}

/**
 * Obtiene una recompensa por ID
 * @param {GetRewardByIdQuery} query
 * @returns {Promise<Object|null>} Recompensa (POJO)
 */
async function getReward(query) {
  const reward = await rewardRepository.findRewardById(query.rewardId);
  if (!reward) {
    throw new NotFoundError('Recompensa no encontrada');
  }
  return reward;
}

/**
 * Crea una nueva recompensa
 * @param {CreateRewardCommand} command
 * @returns {Promise<Object>} Recompensa creada (POJO)
 */
async function createReward(command) {
  const transaction = await sequelize.transaction();
  try {
    // Validaciones
    if (!command.is_closed && command.token_cost < 0) {
      throw new ValidationError('El costo en tokens debe ser positivo');
    }

    if (command.discount_percentage && (command.discount_percentage < 0 || command.discount_percentage > 100)) {
      throw new ValidationError('El porcentaje de descuento debe estar entre 0 y 100');
    }

    const payload = {
      id_gym: command.gymId,
      name: command.name,
      description: command.description,
      token_cost: command.token_cost,
      discount_percentage: command.discount_percentage,
      discount_amount: command.discount_amount,
      stock: command.stock,
      valid_from: command.valid_from,
      valid_until: command.valid_until,
      is_active: command.is_active,
      image_url: command.image_url,
      terms: command.terms,
    };

    const reward = await rewardRepository.createReward(payload, { transaction });
    await transaction.commit();
    return reward;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Actualiza una recompensa
 * @param {UpdateRewardCommand} command
 * @returns {Promise<Object>} Recompensa actualizada (POJO)
 */
async function updateReward(command) {
  const transaction = await sequelize.transaction();
  try {
    // Verificar que existe
    const reward = await rewardRepository.findRewardById(command.rewardId, { transaction });
    if (!reward) {
      throw new NotFoundError('Recompensa no encontrada');
    }

    const payload = {};
    if (command.name !== undefined) payload.name = command.name;
    if (command.description !== undefined) payload.description = command.description;
    if (command.token_cost !== undefined) payload.token_cost = command.token_cost;
    if (command.discount_percentage !== undefined) payload.discount_percentage = command.discount_percentage;
    if (command.discount_amount !== undefined) payload.discount_amount = command.discount_amount;
    if (command.stock !== undefined) payload.stock = command.stock;
    if (command.valid_from !== undefined) payload.valid_from = command.valid_from;
    if (command.valid_until !== undefined) payload.valid_until = command.valid_until;
    if (command.is_active !== undefined) payload.is_active = command.is_active;
    if (command.image_url !== undefined) payload.image_url = command.image_url;
    if (command.terms !== undefined) payload.terms = command.terms;

    const updated = await rewardRepository.updateReward(command.rewardId, payload, { transaction });
    await transaction.commit();
    return updated;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Elimina una recompensa (soft delete)
 * @param {DeleteRewardCommand} command
 * @returns {Promise<number>} Número de registros eliminados
 */
async function deleteReward(command) {
  const transaction = await sequelize.transaction();
  try {
    const reward = await rewardRepository.findRewardById(command.rewardId, { transaction });
    if (!reward) {
      throw new NotFoundError('Recompensa no encontrada');
    }

    const deleted = await rewardRepository.deleteReward(command.rewardId, { transaction });
    await transaction.commit();
    return deleted;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ============================================================================
// REWARD CODES
// ============================================================================

/**
 * Lista códigos de una recompensa
 * @param {ListRewardCodesQuery} query
 * @returns {Promise<Array>} Array de códigos (POJOs)
 */
async function listRewardCodes(query) {
  return rewardRepository.findRewardCodes(query.rewardId, { unused_only: query.unused_only });
}

/**
 * Obtiene un código por su string
 * @param {GetRewardCodeByStringQuery} query
 * @returns {Promise<Object|null>} Código (POJO)
 */
async function getRewardCodeByString(query) {
  return rewardRepository.findRewardCodeByString(query.code);
}

/**
 * Crea un código de recompensa
 * @param {CreateRewardCodeCommand} command
 * @returns {Promise<Object>} Código creado (POJO)
 */
async function createRewardCode(command) {
  const transaction = await sequelize.transaction();
  try {
    // Verificar que la recompensa existe
    const reward = await rewardRepository.findRewardById(command.rewardId, { transaction });
    if (!reward) {
      throw new NotFoundError('Recompensa no encontrada');
    }

    // Verificar que el código no existe
    const existingCode = await rewardRepository.findRewardCodeByString(command.code, { transaction });
    if (existingCode) {
      throw new ConflictError('El código ya existe');
    }

    const payload = {
      id_reward: command.rewardId,
      code: command.code,
    };

    const code = await rewardRepository.createRewardCode(payload, { transaction });
    await transaction.commit();
    return code;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ============================================================================
// CLAIMED REWARDS
// ============================================================================

/**
 * Lista recompensas canjeadas
 * @param {ListClaimedRewardsQuery} query
 * @returns {Promise<Object>} Resultado paginado con recompensas canjeadas (POJOs)
 */
async function listClaimedRewards(query) {
  return rewardRepository.findClaimedRewards(query);
}

/**
 * Obtiene una recompensa canjeada por ID
 * @param {GetClaimedRewardByIdQuery} query
 * @returns {Promise<Object|null>} Recompensa canjeada (POJO)
 */
async function getClaimedReward(query) {
  const claimed = await rewardRepository.findClaimedRewardById(query.claimedRewardId);
  if (!claimed) {
    throw new NotFoundError('Recompensa canjeada no encontrada');
  }

  // Validar ownership si se proporciona userId
  if (query.userId && claimed.id_user_profile !== query.userId) {
    throw new NotFoundError('Recompensa canjeada no encontrada');
  }

  return claimed;
}

/**
 * Canjea una recompensa por tokens
 * @param {ClaimRewardCommand} command
 * @returns {Promise<Object>} Recompensa canjeada (POJO)
 */
async function claimReward(command) {
  const transaction = await sequelize.transaction();
  try {
    // 1. Verificar recompensa existe y está disponible
    const reward = await rewardRepository.findRewardById(command.rewardId, { transaction });
    if (!reward) {
      throw new NotFoundError('Recompensa no encontrada');
    }

    if (!reward.is_active) {
      throw new ValidationError('La recompensa no está activa');
    }

    // Validar fechas de validez
    const now = new Date();
    if (reward.valid_from && new Date(reward.valid_from) > now) {
      throw new ValidationError('La recompensa aún no está disponible');
    }
    if (reward.valid_until && new Date(reward.valid_until) < now) {
      throw new ValidationError('La recompensa ha expirado');
    }

    // Validar stock
    if (reward.stock !== null && reward.stock <= 0) {
      throw new ValidationError('La recompensa no tiene stock disponible');
    }

    // 2. Verificar que el usuario tiene suficientes tokens
    const balance = await rewardRepository.getTokenBalance(command.userId, { transaction });
    if (balance < command.tokens_spent) {
      throw new ValidationError('Saldo insuficiente de tokens');
    }

    // 3. Validar código si se proporciona
    let codeToUse = null;
    if (command.codeId) {
      codeToUse = await rewardRepository.findRewardCodeById(command.codeId, { transaction });
      if (!codeToUse || codeToUse.is_used) {
        throw new ValidationError('Código no válido o ya utilizado');
      }
      if (codeToUse.id_reward !== command.rewardId) {
        throw new ValidationError('El código no corresponde a esta recompensa');
      }
    }

    // 4. Crear claimed reward
    const claimedPayload = {
      id_user_profile: command.userId,
      id_reward: command.rewardId,
      id_code: command.codeId,
      claimed_date: new Date(),
      status: 'ACTIVE',
      tokens_spent: command.tokens_spent,
      expires_at: command.expires_at,
    };

    const claimed = await rewardRepository.createClaimedReward(claimedPayload, { transaction });

    // 5. Crear entrada en token ledger (gasto)
    const previousBalance = await rewardRepository.getTokenBalance(command.userId, { transaction });
    const newBalance = previousBalance - command.tokens_spent;

    await rewardRepository.createTokenLedgerEntry(
      {
        id_user_profile: command.userId,
        delta: -command.tokens_spent,
        balance_after: newBalance,
        reason: 'REWARD_CLAIM',
        ref_type: 'ClaimedReward',
        ref_id: claimed.id_claimed_reward,
        metadata: {
          reward_name: reward.name,
          reward_id: reward.id_reward,
        },
      },
      { transaction }
    );

    // 6. Actualizar balance en UserProfile
    await userProfileRepository.updateTokensBalance(command.userId, newBalance, { transaction });

    // 7. Decrementar stock si no es ilimitado
    if (reward.stock !== null) {
      await rewardRepository.decrementRewardStock(command.rewardId, 1, { transaction });
    }

    // 8. Marcar código como usado si se usó
    if (codeToUse) {
      await rewardRepository.markRewardCodeAsUsed(command.codeId, { transaction });
    }

    await transaction.commit();

    // Retornar claimed reward con todas las relaciones
    return rewardRepository.findClaimedRewardById(claimed.id_claimed_reward);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Marca una recompensa canjeada como usada
 * @param {MarkClaimedRewardUsedCommand} command
 * @returns {Promise<Object>} Recompensa canjeada actualizada (POJO)
 */
async function markClaimedRewardAsUsed(command) {
  const transaction = await sequelize.transaction();
  try {
    // Verificar que existe y pertenece al usuario
    const claimed = await rewardRepository.findClaimedRewardById(command.claimedRewardId, { transaction });
    if (!claimed) {
      throw new NotFoundError('Recompensa canjeada no encontrada');
    }

    if (claimed.id_user_profile !== command.userId) {
      throw new NotFoundError('Recompensa canjeada no encontrada');
    }

    if (claimed.status === 'USED') {
      throw new ConflictError('La recompensa ya fue utilizada');
    }

    if (claimed.status === 'EXPIRED') {
      throw new ValidationError('La recompensa ha expirado');
    }

    const updated = await rewardRepository.markClaimedRewardAsUsed(command.claimedRewardId, { transaction });
    await transaction.commit();
    return updated;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

// Mantener nombres antiguos para compatibilidad con código existente
const listarRecompensas = listRewards;
const obtenerRecompensaPorId = getReward;
const crearRecompensa = createReward;
const actualizarRecompensa = updateReward;
const eliminarRecompensa = deleteReward;
const canjearRecompensa = claimReward;

module.exports = {
  // New API
  listRewards,
  getReward,
  createReward,
  updateReward,
  deleteReward,
  listRewardCodes,
  getRewardCodeByString,
  createRewardCode,
  listClaimedRewards,
  getClaimedReward,
  claimReward,
  markClaimedRewardAsUsed,

  // Legacy API
  listarRecompensas,
  obtenerRecompensaPorId,
  crearRecompensa,
  actualizarRecompensa,
  eliminarRecompensa,
  canjearRecompensa,
};
