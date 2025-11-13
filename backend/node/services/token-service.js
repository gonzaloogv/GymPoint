/**
 * Token Service - Lote 5
 * Maneja operaciones de tokens (añadir, gastar, balance, historial)
 */

const sequelize = require('../config/database');
const { rewardRepository, userProfileRepository } = require('../infra/db/repositories');
const { ValidationError, NotFoundError } = require('../utils/errors');

// ============================================================================
// TOKEN OPERATIONS
// ============================================================================

/**
 * Añade tokens a un usuario
 * @param {AddTokensCommand} command
 * @returns {Promise<Object>} Resultado con balance actualizado
 */
async function addTokens(command) {
  const transaction = await sequelize.transaction();
  try {
    // Validar cantidad
    if (command.amount <= 0) {
      throw new ValidationError('La cantidad de tokens debe ser positiva');
    }

    // Verificar que el usuario existe
    const user = await userProfileRepository.findById(command.userId, { transaction });
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Obtener balance actual
    const previousBalance = await rewardRepository.getTokenBalance(command.userId, { transaction });
    const newBalance = previousBalance + command.amount;

    // Crear entrada en ledger
    await rewardRepository.createTokenLedgerEntry(
      {
        id_user_profile: command.userId,
        delta: command.amount,
        balance_after: newBalance,
        reason: command.reason,
        ref_type: command.ref_type,
        ref_id: command.ref_id,
        metadata: command.metadata,
      },
      { transaction }
    );

    // Actualizar balance en UserProfile
    await userProfileRepository.updateTokensBalance(command.userId, newBalance, { transaction });

    await transaction.commit();

    return {
      userId: command.userId,
      previousBalance,
      newBalance,
      delta: command.amount,
      reason: command.reason,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Gasta tokens de un usuario
 * @param {SpendTokensCommand} command
 * @returns {Promise<Object>} Resultado con balance actualizado
 */
async function spendTokens(command) {
  const transaction = await sequelize.transaction();
  try {
    // Validar cantidad (debe ser positiva, se convertirá a negativa)
    const amount = Math.abs(command.amount);
    if (amount <= 0) {
      throw new ValidationError('La cantidad de tokens debe ser positiva');
    }

    // Verificar que el usuario existe
    const user = await userProfileRepository.findById(command.userId, { transaction });
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Obtener balance actual y validar saldo suficiente
    const previousBalance = await rewardRepository.getTokenBalance(command.userId, { transaction });
    if (previousBalance < amount) {
      throw new ValidationError('Saldo insuficiente de tokens');
    }

    const newBalance = previousBalance - amount;

    // Crear entrada en ledger (delta negativo)
    await rewardRepository.createTokenLedgerEntry(
      {
        id_user_profile: command.userId,
        delta: -amount,
        balance_after: newBalance,
        reason: command.reason,
        ref_type: command.ref_type,
        ref_id: command.ref_id,
        metadata: command.metadata,
      },
      { transaction }
    );

    // Actualizar balance en UserProfile
    await userProfileRepository.updateTokensBalance(command.userId, newBalance, { transaction });

    await transaction.commit();

    return {
      userId: command.userId,
      previousBalance,
      newBalance,
      delta: -amount,
      reason: command.reason,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ============================================================================
// TOKEN QUERIES
// ============================================================================

/**
 * Obtiene el balance de tokens de un usuario
 * @param {GetTokenBalanceQuery} query
 * @returns {Promise<Object>} Balance de tokens
 */
async function getTokenBalance(query) {
  // Verificar que el usuario existe
  const user = await userProfileRepository.findById(query.userId);
  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  const balance = await rewardRepository.getTokenBalance(query.userId);

  return {
    userId: query.userId,
    balance,
  };
}

/**
 * Lista el historial de movimientos de tokens (ledger)
 * @param {ListTokenLedgerQuery} query
 * @returns {Promise<Object>} Resultado paginado con historial de tokens
 */
async function listTokenLedger(query) {
  // Verificar que el usuario existe
  const user = await userProfileRepository.findById(query.userId);
  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  return rewardRepository.findTokenLedger(query);
}

/**
 * Obtiene estadísticas de tokens de un usuario
 * @param {GetTokenBalanceQuery} query
 * @returns {Promise<Object>} Estadísticas de tokens
 */
async function getTokenStats(query) {
  // Verificar que el usuario existe
  const user = await userProfileRepository.findById(query.userId);
  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  const [balance, totalEarned, totalSpent, totalClaimed] = await Promise.all([
    rewardRepository.getTokenBalance(query.userId),
    rewardRepository.getTotalTokensEarned(query.userId),
    rewardRepository.getTotalTokensSpent(query.userId),
    rewardRepository.countClaimedRewardsByUser(query.userId),
  ]);

  return {
    userId: query.userId,
    balance,
    totalEarned,
    totalSpent,
    totalClaimed,
  };
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

// Mantener nombres antiguos para compatibilidad
const otorgarTokens = addTokens;
const obtenerResumenTokens = getTokenStats;

module.exports = {
  // New API
  addTokens,
  spendTokens,
  getTokenBalance,
  listTokenLedger,
  getTokenStats,

  // Legacy API
  otorgarTokens,
  obtenerResumenTokens,
};
