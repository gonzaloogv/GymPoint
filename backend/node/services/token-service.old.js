const { UserProfile } = require('../models');
const tokenLedgerService = require('./token-ledger-service');
const ClaimedReward = require('../models/ClaimedReward');

/**
 * Otorgar tokens a un usuario
 * @param {Object} params - Parámetros
 * @param {number} params.id_user - ID del user_profile
 * @param {number} params.amount - Cantidad de tokens a otorgar
 * @param {string} params.motive - Motivo del otorgamiento
 * @returns {Promise<Object>} Resultado del otorgamiento
 */
const otorgarTokens = async ({ id_user, amount, motive }) => {
  const value = Number(amount);
  if (Number.isNaN(value) || value <= 0) {
    throw new Error('Monto de tokens inválido');
  }

  const { previousBalance, newBalance } = await tokenLedgerService.registrarMovimiento({
    userId: id_user,
    delta: value,
    reason: motive || 'MANUAL_GRANT',
    refType: null,
    refId: null
  });

  return {
    id_user,
    tokens_antes: previousBalance,
    tokens_actuales: newBalance,
    motive: motive || 'MANUAL_GRANT',
    fecha: new Date()
  };
};

/**
 * Obtener resumen de tokens de un usuario
 * @param {number} id_user - ID del user_profile
 * @returns {Promise<Object>} Resumen de tokens
 */
const obtenerResumenTokens = async (id_user) => {
  const estadisticas = await tokenLedgerService.obtenerEstadisticas(id_user);
  const cantidadCanjes = await ClaimedReward.count({ where: { id_user } });

  return {
    id_user,
    tokens_actuales: estadisticas.balance_actual,
    total_ganados: estadisticas.total_ganado,
    total_gastados: estadisticas.total_gastado,
    canjes_realizados: cantidadCanjes
  };
};

module.exports = {
  otorgarTokens,
  obtenerResumenTokens
};
  