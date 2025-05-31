const { Op } = require('sequelize');
const Reward = require('../models/Reward');
const ClaimedReward = require('../models/ClaimedReward');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const rewardCodeService = require('./reward-code-service'); // ✅ nuevo
const { Sequelize } = require('sequelize');

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

const canjearRecompensa = async ({ id_user, id_reward, id_gym }) => {
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

  const user = await User.findByPk(id_user);
  if (!user) throw new Error('Usuario no encontrado');
  if (user.tokens < reward.cost_tokens) throw new Error('Tokens insuficientes');

  // Calcular nuevo saldo
  const result_balance = user.tokens - reward.cost_tokens;

  // Actualizar usuario y recompensa
  user.tokens = result_balance;
  reward.stock -= 1;
  await user.save();
  await reward.save();

  // ✅ Generar código
  const codigoGenerado = await rewardCodeService.crearCodigoParaCanje({
    id_reward,
    id_gym
  });
  
  // Crear registro en claimed_reward
  const claimed = await ClaimedReward.create({
    id_user,
    id_reward,
    id_code: codigoGenerado.id_code,
    claimed_date: new Date(),
    status: true
  });

  // Crear transacción
  await Transaction.create({
    id_user,
    id_reward,
    movement_type: 'GASTO',
    amount: reward.cost_tokens,
    date: new Date(),
    result_balance: result_balance
  });



  // ✅ Devolver todo en la respuesta
  return {
    mensaje: 'Recompensa canjeada con éxito',
    claimed,
    codigo: codigoGenerado.code
  };
};

const obtenerHistorialRecompensas = async (id_user) => {
  return await ClaimedReward.findAll({
    where: { id_user },
    include: {
      model: Reward,
      attributes: ['name', 'description']
    },
    order: [['claimed_date', 'DESC']]
  });
};

const obtenerEstadisticasDeRecompensas = async () => {
  return await ClaimedReward.findAll({
    attributes: [
      'id_reward',
      [Sequelize.fn('COUNT', Sequelize.col('ClaimedReward.id_reward')), 'total_canjeos']
    ],
    include: {
      model: Reward,
      attributes: ['name', 'description', 'cost_tokens']
    },
    group: ['ClaimedReward.id_reward', 'Reward.id_reward'],
    order: [[Sequelize.literal('total_canjeos'), 'DESC']]
  });
};

const crearRecompensa = async ({ name, description, cost_tokens, type, stock, start_date, finish_date }) => {
  return await Reward.create({
    name,
    description,
    cost_tokens,
    type, // ahora sí, correctamente definido
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
