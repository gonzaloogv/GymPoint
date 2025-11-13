const { TokenLedger, UserProfile } = require('../models');
const tokenLedgerService = require('./token-ledger-service');

/**
 * Obtener historial de movimientos de tokens por usuario
 * @param {number} idUserProfile - ID del user_profile
 * @returns {Promise<Array>} Lista de movimientos de tokens
 */
const obtenerTransaccionesPorUsuario = async (idUserProfile) => {
  return await tokenLedgerService.obtenerHistorial(idUserProfile);
};

module.exports = {
  obtenerTransaccionesPorUsuario
};
