const { Op } = require('sequelize');
const Reward = require('../models/Reward');
const ClaimedReward = require('../models/ClaimedReward');
const { UserProfile } = require('../models');
const tokenLedgerService = require('./token-ledger-service');
const rewardCodeService = require('./reward-code-service');
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const { NotFoundError, ConflictError } = require('../utils/errors');

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
    order: [['cost_tokens', 'ASC']]
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
  const idUserProfile = id_user;
  const t = await sequelize.transaction();

  try {
    const reward = await Reward.findOne({
      where: {
        id_reward,
        available: true,
        stock: { [Op.gt]: 0 },
        start_date: { [Op.lte]: new Date() },
        finish_date: { [Op.gte]: new Date() }
      },
      transaction: t
    });

    if (!reward) throw new NotFoundError('Recompensa disponible');

    // Verificar idempotencia: si ya existe el canje, retornar el existente
    const existingClaim = await tokenLedgerService.existeMovimiento('claimed_reward', id_reward);
    if (existingClaim) {
      await t.rollback();
      throw new ConflictError('Esta recompensa ya fue canjeada anteriormente');
    }

    // Generar código primero
    const codigoGenerado = await rewardCodeService.crearCodigoParaCanje({
      id_reward,
      id_gym
    });

    // Crear registro en claimed_reward
    const claimed = await ClaimedReward.create({
      id_user: idUserProfile,
      id_reward,
      id_code: codigoGenerado.id_code,
      claimed_date: new Date(),
      status: true
    }, { transaction: t });

    // Registrar movimiento de tokens (validará saldo y actualizará user_profile)
    const { newBalance } = await tokenLedgerService.registrarMovimiento({
      userId: idUserProfile,
      delta: -reward.cost_tokens,
      reason: 'REWARD_CLAIM',
      refType: 'claimed_reward',
      refId: claimed.id_claim,
      transaction: t
    });

    // Actualizar stock de recompensa
    reward.stock -= 1;
    await reward.save({ transaction: t });

    await t.commit();

    return {
      mensaje: 'Recompensa canjeada con éxito',
      claimed,
      codigo: codigoGenerado.code,
      nuevo_saldo: newBalance
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
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
        as: 'user',
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
