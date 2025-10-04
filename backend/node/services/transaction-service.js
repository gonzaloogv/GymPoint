const Transaction = require('../models/Transaction');
const Reward = require('../models/Reward');
const { UserProfile } = require('../models');

/**
 * Obtener transacciones por usuario
 * @param {number} idUserProfile - ID del user_profile
 * @returns {Promise<Array>} Lista de transacciones
 */
const obtenerTransaccionesPorUsuario = async (idUserProfile) => {
  return await Transaction.findAll({
    where: { id_user: idUserProfile }, // id_user apunta a user_profiles
    include: [
      {
        model: Reward,
        as: 'reward',
        attributes: ['name'],
        required: false
      },
      {
        model: UserProfile,
        as: 'userProfile',
        attributes: ['name', 'lastname'],
        required: false
      }
    ],
    order: [['date', 'DESC']]
  });
};  

module.exports = {
  obtenerTransaccionesPorUsuario
};
