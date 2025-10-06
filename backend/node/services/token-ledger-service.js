const { TokenLedger, UserProfile } = require('../models');
const sequelize = require('../config/database');

/**
 * Registrar movimiento de tokens en el ledger
 *
 * @param {Object} params - Parámetros del movimiento
 * @param {number} params.userId - ID del user_profile
 * @param {number} params.delta - Cantidad (positivo=ganancia, negativo=gasto)
 * @param {string} params.reason - Motivo (ATTENDANCE, REWARD_CLAIM, etc.)
 * @param {string} [params.refType] - Tipo de referencia (opcional)
 * @param {number} [params.refId] - ID de referencia (opcional)
 * @param {Object} [params.transaction] - Transacción Sequelize (opcional)
 * @returns {Promise<Object>} Resultado con ledgerEntry, previousBalance, newBalance
 */
const registrarMovimiento = async ({ userId, delta, reason, refType = null, refId = null, transaction = null }) => {
  const t = transaction || await sequelize.transaction();

  try {
    // 1. Obtener balance actual con SELECT FOR UPDATE (evita race conditions)
    const userProfile = await UserProfile.findByPk(userId, {
      attributes: ['tokens'],
      lock: true,
      transaction: t
    });

    if (!userProfile) {
      throw new Error(`UserProfile ${userId} no encontrado`);
    }

    const currentBalance = userProfile.tokens;
    const newBalance = currentBalance + delta;

    // 2. Validar que no quede negativo
    if (newBalance < 0) {
      throw new Error(`Saldo insuficiente. Actual: ${currentBalance}, Intento: ${delta}`);
    }

    // 3. Crear registro en ledger
    const ledgerEntry = await TokenLedger.create({
      id_user_profile: userId,
      delta,
      reason,
      ref_type: refType,
      ref_id: refId,
      balance_after: newBalance
    }, { transaction: t });

    // 4. Actualizar balance en user_profile
    await userProfile.update({ tokens: newBalance }, { transaction: t });

    // 5. Commit si no es transacción externa
    if (!transaction) {
      await t.commit();
    }

    return {
      ledgerEntry,
      previousBalance: currentBalance,
      newBalance
    };
  } catch (error) {
    if (!transaction) {
      await t.rollback();
    }
    throw error;
  }
};

/**
 * Obtener historial de movimientos de un usuario
 *
 * @param {number} userId - ID del user_profile
 * @param {Object} options - Opciones de paginación
 * @param {number} [options.limit=50] - Límite de resultados
 * @param {number} [options.offset=0] - Offset para paginación
 * @returns {Promise<Array>} Lista de movimientos
 */
const obtenerHistorial = async (userId, { limit = 50, offset = 0 } = {}) => {
  return await TokenLedger.findAll({
    where: { id_user_profile: userId },
    order: [['created_at', 'DESC']],
    limit,
    offset
  });
};

/**
 * Obtener balance actual de un usuario
 *
 * @param {number} userId - ID del user_profile
 * @returns {Promise<number>} Balance actual
 */
const obtenerBalance = async (userId) => {
  const userProfile = await UserProfile.findByPk(userId, {
    attributes: ['tokens']
  });
  return userProfile ? userProfile.tokens : 0;
};

/**
 * Verificar si existe un movimiento con la referencia dada (idempotencia)
 *
 * @param {string} refType - Tipo de referencia
 * @param {number} refId - ID de referencia
 * @returns {Promise<boolean>} true si existe
 */
const existeMovimiento = async (refType, refId) => {
  const existing = await TokenLedger.findOne({
    where: {
      ref_type: refType,
      ref_id: refId
    }
  });
  return !!existing;
};

/**
 * Obtener estadísticas de tokens de un usuario
 *
 * @param {number} userId - ID del user_profile
 * @returns {Promise<Object>} Estadísticas
 */
const obtenerEstadisticas = async (userId) => {
  const { fn, col, literal } = require('sequelize');

  const stats = await TokenLedger.findOne({
    where: { id_user_profile: userId },
    attributes: [
      [fn('SUM', literal('CASE WHEN delta > 0 THEN delta ELSE 0 END')), 'total_ganado'],
      [fn('SUM', literal('CASE WHEN delta < 0 THEN ABS(delta) ELSE 0 END')), 'total_gastado'],
      [fn('COUNT', col('id_ledger')), 'total_movimientos']
    ],
    raw: true
  });

  const balance = await obtenerBalance(userId);

  return {
    balance_actual: balance,
    total_ganado: parseInt(stats?.total_ganado || 0),
    total_gastado: parseInt(stats?.total_gastado || 0),
    total_movimientos: parseInt(stats?.total_movimientos || 0)
  };
};

module.exports = {
  registrarMovimiento,
  obtenerHistorial,
  obtenerBalance,
  existeMovimiento,
  obtenerEstadisticas
};
