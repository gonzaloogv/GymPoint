const { Op } = require('sequelize');
const User = require('../models/User');
const Gym = require('../models/Gym');
const GymType = require('../models/GymType')(require('../config/database'), require('sequelize').DataTypes);


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
  const { id_types, ...gymData } = data;

  // Crear el gimnasio
  const gym = await Gym.create(gymData);

  // Asociar tipos si vienen
  if (Array.isArray(id_types) && id_types.length > 0) {
    await gym.addGymTypes(id_types);
  }

  return gym;
};

const updateGym = async (id, data) => {
  const { id_types, ...gymData } = data;

  const gym = await Gym.findByPk(id);
  if (!gym) throw new Error('Gym not found');

  // Actualizar los datos del gimnasio
  await gym.update(gymData);

  // Si se pasan nuevos tipos, reemplazarlos
  if (Array.isArray(id_types)) {
    await gym.setGymTypes(id_types); // reemplaza todas las asociaciones anteriores
  }

  return gym;
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

const filtrarGimnasios = async ({ city, type, minPrice, maxPrice }) => {
  const include = [];

  if (type) {
    include.push({
      model: GymType,
      where: {
        name: { [Op.like]: `%${type}%` }
      }
    });
  }

  const where = {};

  if (city) where.city = city;
  if (minPrice || maxPrice) {
    where.month_price = {};
    if (minPrice) where.month_price[Op.gte] = minPrice;
    if (maxPrice) where.month_price[Op.lte] = maxPrice;
  }

  const resultados = await Gym.findAll({
    where,
    include,
    order: [['month_price', 'ASC']]
  });

  return { resultados, advertencia: null };
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
