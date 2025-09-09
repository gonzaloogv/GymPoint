const Transaction = require('../models/Transaction');
const Reward = require('../models/Reward');

const obtenerTransaccionesPorUsuario = async (id_user) => {
    return await Transaction.findAll({
      where: { id_user },
      include: {
        model: Reward,
        attributes: ['name']
      },
      order: [['date', 'DESC']]
    });
};  

module.exports = {
  obtenerTransaccionesPorUsuario
};
