const { Op } = require('sequelize');
const Reward = require('../models/Reward');
const ClaimedReward = require('../models/ClaimedReward');
const { UserProfile } = require('../models');
const Transaction = require('../models/Transaction');
const rewardCodeService = require('./reward-code-service');
const { Sequelize } = require('sequelize');

/**
 * Listar recompensas disponibles
 * @returns {Promise<Array>} Lista de recompensas disponibles
 */
const listarRecompensas = async () => {
  return await Reward.findAll({
    where: {
      available: true,
      stock: { [Op.gt]: 0 },
      start_date: { [Op.lte]: new Date() },
      finish_date: { [Op.gte]: new Date() }
    },
    order: [['cost', 'ASC']]
  });
};

/**
 * Canjear recompensa por tokens
 * @param {Object} data - Datos del canje
 * @param {number} data.id_user - ID del user_profile
 * @param {number} data.id_reward - ID de la recompensa
 * @param {number} data.id_gym - ID del gimnasio (opcional)
 * @returns {Promise<Object>} Resultado del canje
 */
const canjearRecompensa = async ({ id_user, id_reward, id_gym }) => {
  // id_user ahora es id_user_profile
  const idUserProfile = id_user;

  const reward = await Reward.findOne({
    where: {
      id_reward,
      available: true,
      stock: { [Op.gt]: 0 },
      start_date: { [Op.lte]: new Date() },
      finish_date: { [Op.gte]: new Date() }
    }
  });

  if (!reward) throw new Error('La recompensa no está disponible');

  const userProfile = await UserProfile.findByPk(idUserProfile);
  if (!userProfile) throw new Error('Usuario no encontrado');
  if (userProfile.tokens < reward.cost_tokens) throw new Error('Tokens insuficientes');

  // calcula nuevo saldo
  const result_balance = userProfile.tokens - reward.cost_tokens;

  // actualiza usuario y recompensa
  userProfile.tokens = result_balance;
  reward.stock -= 1;
  await userProfile.save();
  await reward.save();

  // genera codigo
  const codigoGenerado = await rewardCodeService.crearCodigoParaCanje({
    id_reward,
    id_gym
  });
  
  // crea registro en claimed_reward
  const claimed = await ClaimedReward.create({
    id_user: idUserProfile,
    id_reward,
    id_code: codigoGenerado.id_code,
    claimed_date: new Date(),
    status: true
  });

  // crea transaccion
  await Transaction.create({
    id_user: idUserProfile,
    id_reward,
    movement_type: 'GASTO',
    amount: reward.cost_tokens,
    date: new Date(),
    result_balance: result_balance
  });

  // devolver todo en la respuesta
  return {
    mensaje: 'Recompensa canjeada con éxito',
    claimed,
    codigo: codigoGenerado.code,
    nuevo_saldo: result_balance
  };
};

/**
 * Obtener historial de recompensas canjeadas por un usuario
 * @param {number} idUserProfile - ID del user_profile
 * @returns {Promise<Array>} Lista de recompensas canjeadas
 */
const obtenerHistorialRecompensas = async (idUserProfile) => {
  return await ClaimedReward.findAll({
    where: { id_user: idUserProfile },
    include: [
      {
        model: Reward,
        as: 'reward',
        attributes: ['name', 'description', 'cost_tokens']
      },
      {
        model: UserProfile,
        as: 'userProfile',
        attributes: ['name', 'lastname']
      }
    ],
    order: [['claimed_date', 'DESC']]
  });
};

/**
 * Obtener estadísticas de recompensas más canjeadas
 * @returns {Promise<Array>} Lista de recompensas con total de canjeos
 */
const obtenerEstadisticasDeRecompensas = async () => {
  return await ClaimedReward.findAll({
    attributes: [
      'id_reward',
      [Sequelize.fn('COUNT', Sequelize.col('ClaimedReward.id_reward')), 'total_canjeos']
    ],
    include: {
      model: Reward,
      as: 'reward',
      attributes: ['name', 'description', 'cost_tokens']
    },
    group: ['ClaimedReward.id_reward', 'Reward.id_reward'],
    order: [[Sequelize.literal('total_canjeos'), 'DESC']]
  });
};

/**
 * Crear nueva recompensa (admin)
 * @param {Object} data - Datos de la recompensa
 * @returns {Promise<Reward>} Recompensa creada
 */
const crearRecompensa = async ({ name, description, cost_tokens, type, stock, start_date, finish_date }) => {
  return await Reward.create({
    name,
    description,
    cost_tokens,
    type,
    stock,
    start_date,
    finish_date,
    available: true,
    creation_date: new Date()
  });
};

module.exports = {
  listarRecompensas,
  canjearRecompensa,
  obtenerHistorialRecompensas,
  obtenerEstadisticasDeRecompensas,
  crearRecompensa
};
