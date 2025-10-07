/**
 * Servicio de gestión de Token Ledger
 *
 * Implementa el patrón Ledger para rastrear todos los movimientos
 * de tokens de usuarios. Garantiza:
 * - Balance nunca negativo
 * - Auditoría completa de movimientos
 * - Idempotencia mediante ref_type/ref_id
 * - Consistencia con SELECT FOR UPDATE
 *
 * @module services/token-ledger-service
 */

const { TokenLedger, UserProfile } = require('../models');
const sequelize = require('../config/database');
const { NotFoundError, BusinessError } = require('../utils/errors');

/**
 * Registra un movimiento de tokens en el ledger
 *
 * Esta función es el corazón del sistema de tokens. Utiliza SELECT FOR UPDATE
 * para evitar race conditions y garantizar la consistencia del balance.
 *
 * @async
 * @param {Object} params - Parámetros del movimiento
 * @param {number} params.userId - ID del user_profile
 * @param {number} params.delta - Cantidad (positivo=ganancia, negativo=gasto)
 * @param {string} params.reason - Motivo del movimiento (ATTENDANCE, REWARD_CLAIM, WEEKLY_BONUS, etc.)
 * @param {string} [params.refType=null] - Tipo de referencia opcional (ej: 'assistance', 'claimed_reward')
 * @param {number} [params.refId=null] - ID de referencia opcional
 * @param {Transaction} [params.transaction=null] - Transacción Sequelize externa (opcional)
 *
 * @returns {Promise<Object>} Resultado del movimiento
 * @returns {Object} returns.ledgerEntry - Entrada creada en el ledger
 * @returns {number} returns.previousBalance - Balance anterior
 * @returns {number} returns.newBalance - Balance nuevo
 *
 * @throws {NotFoundError} Si el usuario no existe
 * @throws {BusinessError} Si el saldo quedaría negativo (código: INSUFFICIENT_BALANCE)
 *
 * @example
 * // Registrar asistencia a gimnasio
 * const result = await registrarMovimiento({
 *   userId: 123,
 *   delta: 10,
 *   reason: 'ATTENDANCE',
 *   refType: 'assistance',
 *   refId: 456
 * });
 * console.log(result.newBalance); // 110
 *
 * @example
 * // Gastar tokens en recompensa (con transacción externa)
 * const t = await sequelize.transaction();
 * try {
 *   const result = await registrarMovimiento({
 *     userId: 123,
 *     delta: -50,
 *     reason: 'REWARD_CLAIM',
 *     refType: 'claimed_reward',
 *     refId: 789,
 *     transaction: t
 *   });
 *   await t.commit();
 * } catch (error) {
 *   await t.rollback();
 *   throw error;
 * }
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
      throw new NotFoundError('Usuario');
    }

    const currentBalance = userProfile.tokens;
    const newBalance = currentBalance + delta;

    // 2. Validar que no quede negativo
    if (newBalance < 0) {
      throw new BusinessError(
        `Saldo insuficiente. Balance actual: ${currentBalance} tokens, intentando gastar: ${Math.abs(delta)} tokens`,
        'INSUFFICIENT_BALANCE'
      );
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
 * Obtiene el historial completo de movimientos de tokens de un usuario
 *
 * Los resultados están ordenados cronológicamente (más recientes primero).
 * Utiliza paginación para manejar grandes volúmenes de datos.
 *
 * @async
 * @param {number} userId - ID del user_profile
 * @param {Object} [options={}] - Opciones de paginación
 * @param {number} [options.limit=50] - Límite de resultados por página
 * @param {number} [options.offset=0] - Offset para paginación
 *
 * @returns {Promise<Array<Object>>} Lista de movimientos ordenada por fecha descendente
 *
 * @example
 * // Obtener últimos 10 movimientos
 * const history = await obtenerHistorial(123, { limit: 10, offset: 0 });
 *
 * @example
 * // Paginación - segunda página
 * const page2 = await obtenerHistorial(123, { limit: 20, offset: 20 });
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
 * Obtiene el balance actual de tokens de un usuario
 *
 * Consulta directamente el campo `tokens` en `user_profile`.
 * Retorna 0 si el usuario no existe.
 *
 * @async
 * @param {number} userId - ID del user_profile
 *
 * @returns {Promise<number>} Balance actual de tokens (0 si usuario no existe)
 *
 * @example
 * const balance = await obtenerBalance(123);
 * console.log(`Usuario tiene ${balance} tokens`);
 */
const obtenerBalance = async (userId) => {
  const userProfile = await UserProfile.findByPk(userId, {
    attributes: ['tokens']
  });
  return userProfile ? userProfile.tokens : 0;
};

/**
 * Verifica si existe un movimiento con la referencia dada
 *
 * Utilizado para implementar idempotencia y evitar movimientos duplicados.
 * Por ejemplo, evita que se otorguen tokens dos veces por la misma asistencia.
 *
 * @async
 * @param {string} refType - Tipo de referencia (ej: 'assistance', 'claimed_reward')
 * @param {number} refId - ID de la entidad referenciada
 *
 * @returns {Promise<boolean>} true si ya existe un movimiento con esa referencia
 *
 * @example
 * // Verificar antes de otorgar tokens por asistencia
 * const yaOtorgado = await existeMovimiento('assistance', 456);
 * if (yaOtorgado) {
 *   throw new Error('Tokens ya otorgados para esta asistencia');
 * }
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
 * Obtiene estadísticas agregadas de tokens de un usuario
 *
 * Calcula totales de tokens ganados, gastados y número de movimientos
 * mediante consultas agregadas en la base de datos.
 *
 * @async
 * @param {number} userId - ID del user_profile
 *
 * @returns {Promise<Object>} Estadísticas del usuario
 * @returns {number} returns.total_ganado - Total de tokens ganados (suma de deltas positivos)
 * @returns {number} returns.total_gastado - Total de tokens gastados (suma de valores absolutos de deltas negativos)
 * @returns {number} returns.total_movimientos - Número total de movimientos registrados
 *
 * @example
 * const stats = await obtenerEstadisticas(123);
 * console.log(`Ganados: ${stats.total_ganado}, Gastados: ${stats.total_gastado}`);
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
