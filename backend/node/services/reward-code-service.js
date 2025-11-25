const RewardCode = require('../models/RewardCode');
const Reward = require('../models/Reward');
const Gym = require('../models/Gym');
const { Sequelize, Op } = require('sequelize');

const crearCodigoParaCanje = async ({ id_reward, id_gym }) => {
    const code = 'GP-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  
    const hoy = new Date();
    const expiracion = new Date();
    expiracion.setDate(hoy.getDate() + 90); //90 días de validez
  
    return await RewardCode.create({
      id_reward,
      id_gym,
      code,
      used: false,
      creation_date: hoy,
      expiration_date: expiracion
    });
};

const obtenerCodigosPorUsuario = async (id_user, usado) => {
    const where = {};

    if (usado !== undefined) {
      where.used = usado === 'true'; // query param viene como string
    }

    return await RewardCode.findAll({
      include: [
        {
          model: ClaimedReward,
          where: { id_user },
          attributes: [],
          required: true
        },
        {
          model: Reward,
          attributes: ['name', 'description']
        },
        {
          model: Gym,
          attributes: ['name', 'city']
        }
      ],
      where,
      order: [['creation_date', 'DESC']]
    });
};

const marcarComoUsado = async (id_code) => {
    const codigo = await RewardCode.findByPk(id_code);
  
    if (!codigo) throw new Error('Código no encontrado.');
    if (codigo.used) throw new Error('El código ya fue utilizado.');
  
    const hoy = new Date();
    if (codigo.expiration_date && new Date(codigo.expiration_date) < hoy) {
      throw new Error('El código ha expirado.');
    }
  
    codigo.used = true;
    await codigo.save();
  
    return codigo;
};

const obtenerEstadisticasPorGimnasio = async () => {
    return await RewardCode.findAll({
      attributes: [
        'id_gym',
        [Sequelize.fn('COUNT', Sequelize.col('RewardCode.id_code')), 'total_codigos']
      ],
      include: {
        model: Gym,
        attributes: ['name', 'city']
      },
      group: ['id_gym', 'Gym.id_gym'],
      order: [[Sequelize.literal('total_codigos'), 'DESC']]
    });
};

const obtenerCodigosActivos = async (id_user) => {
    const hoy = new Date();

    return await RewardCode.findAll({
      where: {
        used: false,
        expiration_date: {
          [Op.or]: [
            { [Op.gte]: hoy },
            { [Op.is]: null }
          ]
        }
      },
      include: [
        {
          model: ClaimedReward,
          where: { id_user },
          attributes: [],
          required: true
        },
        {
          model: Reward,
          attributes: ['name', 'description']
        },
        {
          model: Gym,
          attributes: ['name', 'city']
        }
      ],
      order: [['creation_date', 'DESC']]
    });
};
  
const obtenerCodigosExpirados = async (id_user) => {
    const hoy = new Date();
  
    return await RewardCode.findAll({
      where: {
        [Op.or]: [
          { used: true },
          {
            expiration_date: {
              [Op.lt]: hoy
            },
            used: false
          }
        ]
      },
      include: [
        {
          model: ClaimedReward,
          where: { id_user },
          attributes: [],
          required: true
        },
        {
          model: Reward,
          attributes: ['name', 'description']
        },
        {
          model: Gym,
          attributes: ['name', 'city']
        }
      ],
      order: [['expiration_date', 'DESC']]
    });
};
  
module.exports = {
    crearCodigoParaCanje,
    obtenerCodigosPorUsuario,
    marcarComoUsado,
    obtenerEstadisticasPorGimnasio,
    obtenerCodigosActivos,
    obtenerCodigosExpirados
};