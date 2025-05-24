const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ClaimedReward = require('../models/ClaimedReward');

const otorgarTokens = async ({ id_user, amount, motivo }) => {
  const user = await User.findByPk(id_user);
  if (!user) throw new Error('Usuario no encontrado');

  const nuevoSaldo = user.tokens + amount;
  user.tokens = nuevoSaldo;
  await user.save();

  await Transaction.create({
    id_user,
    id_reward: null, // indica que no fue un canje, sino una ganancia
    movement_type: 'GANANCIA',
    amount,
    result_balance: nuevoSaldo,
    date: new Date()
  });

  return {
    id_user,
    tokens_antes: nuevoSaldo - amount,
    tokens_actuales: nuevoSaldo,
    motivo,
    fecha: new Date()
  };
};

const obtenerResumenTokens = async (id_user) => {
    const user = await User.findByPk(id_user);
    if (!user) throw new Error('Usuario no encontrado');
  
    const transacciones = await Transaction.findAll({ where: { id_user } });
  
    let ganados = 0;
    let gastados = 0;
  
    transacciones.forEach(tx => {
      if (tx.movement_type === 'GANANCIA') ganados += tx.amount;
      if (tx.movement_type === 'GASTO' || tx.movement_type === 'COMPRA') gastados += tx.amount;
    });
  
    const cantidadCanjes = await ClaimedReward.count({ where: { id_user } });
  
    return {
      id_user,
      tokens_actuales: user.tokens,
      total_ganados: ganados,
      total_gastados: gastados,
      canjes_realizados: cantidadCanjes
    };
};

module.exports = {
    otorgarTokens,
    obtenerResumenTokens
  };
  