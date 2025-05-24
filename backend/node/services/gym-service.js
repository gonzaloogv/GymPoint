const { Op } = require('sequelize');
const Gym = require('../models/Gym');
const User = require('../models/User');

const tiposValidos = [
  'completo',
  'crossfit',
  'powerlifting',
  'femenino',
  'boxeo',
  'express',
  'exclusivo'
];

const getAllGyms = async () => {
  return await Gym.findAll();
};

const getGymById = async (id) => {
  return await Gym.findByPk(id);
};

const createGym = async (data) => {
  return await Gym.create(data);
};

const updateGym = async (id, data) => {
  const gym = await Gym.findByPk(id);
  if (!gym) throw new Error('Gym not found');
  return await gym.update(data);
};

const deleteGym = async (id) => {
  const gym = await Gym.findByPk(id);
  if (!gym) throw new Error('Gym not found');
  return await gym.destroy();
};
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const buscarGimnasiosCercanos = async (lat, lon) => {
  const gimnasios = await Gym.findAll();
  return gimnasios
    .map(gym => {
      const distancia = calcularDistancia(lat, lon, gym.latitude, gym.longitude);
      return {
        ...gym.toJSON(),
        distancia: Math.round(distancia)
      };
    })
    .sort((a, b) => a.distancia - b.distancia);
};

const getGymsByCity = async (city) => {
  return await Gym.findAll({
    where: {
      city
    }
  });
};

const filtrarGimnasios = async ({ id_user, city, type, minPrice, maxPrice }) => {
  const user = await User.findByPk(id_user);
  if (!user) throw new Error('Usuario no encontrado');

  const filtros = {};
  let advertencia = null;

  // Filtro común
  if (city) filtros.city = city;

  // Filtro por precio (permitido para todos)
  if (minPrice && maxPrice) {
    filtros.month_price = { [Op.between]: [minPrice, maxPrice] };
  } else if (minPrice) {
    filtros.month_price = { [Op.gte]: minPrice };
  } else if (maxPrice) {
    filtros.month_price = { [Op.lte]: maxPrice };
  }

  // Filtro por tipo SOLO si es premium
  if (type) {
    if (!tiposValidos.includes(type)) {
      throw new Error(`Tipo de gimnasio inválido. Tipos válidos: ${tiposValidos.join(', ')}`);
    }
    if (user.subscription === 'PREMIUM') {
      filtros.gym_type = type;
    } else {
      advertencia = "Los usuarios FREE no pueden filtrar por tipo de gimnasio.";
    }
  }  

  const resultados = await Gym.findAll({
    where: filtros,
    order: [['month_price', 'ASC']]
  });

  return {
    resultados,
    advertencia
  };
};

const getGymTypes = () => {
  return [
    'completo',
    'crossfit',
    'powerlifting',
    'femenino',
    'boxeo',
    'express',
    'exclusivo'
  ];
};

module.exports = {
  getAllGyms,
  getGymById,
  createGym,
  updateGym,
  deleteGym,
  buscarGimnasiosCercanos,
  getGymsByCity,
  filtrarGimnasios,
  getGymTypes
};
