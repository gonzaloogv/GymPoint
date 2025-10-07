const { Op, literal } = require('sequelize');
const { Gym, GymType } = require('../models');
const Joi = require('joi');
const { NotFoundError, ValidationError } = require('../utils/errors');

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

  // creal gimnasio
  const gym = await Gym.create(gymData);

  // asociar tipos si vienen
  if (Array.isArray(id_types) && id_types.length > 0) {
    await gym.addGymTypes(id_types);
  }

  return gym;
};

const updateGym = async (id, data) => {
  const { id_types, ...gymData } = data;

  const gym = await Gym.findByPk(id);
  if (!gym) throw new NotFoundError('Gimnasio');

  // actualiza los datos del gimnasio
  await gym.update(gymData);

  // si se pasa nuevos tipos, reemplazarlos
  if (Array.isArray(id_types)) {
    await gym.setGymTypes(id_types); // reemplaza todas las asociaciones anteriores
  }

  return gym;
};

const deleteGym = async (id) => {
  const gym = await Gym.findByPk(id);
  if (!gym) throw new NotFoundError('Gimnasio');
  return await gym.destroy();
};

// funcion que calcula la distancia ubicada
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

/**
 * Calcular bounding box para pre-filtrado
 * @param {number} lat - Latitud central
 * @param {number} lng - Longitud central
 * @param {number} km - Radio en kilómetros
 * @returns {Object} Bounding box {minLat, maxLat, minLng, maxLng}
 */
const calculateBoundingBox = (lat, lng, km) => {
  const d = km / 111; // 1 grado ≈ 111 km
  return {
    minLat: lat - d,
    maxLat: lat + d,
    minLng: lng - d,
    maxLng: lng + d
  };
};

/**
 * Buscar gimnasios cercanos usando bounding box + Haversine
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @param {number} radiusKm - Radio de búsqueda en km (default: 5)
 * @param {number} limit - Límite de resultados (default: 50)
 * @param {number} offset - Offset para paginación (default: 0)
 * @returns {Promise<Array>} Gimnasios dentro del radio ordenados por distancia
 */
const buscarGimnasiosCercanos = async (lat, lng, radiusKm = 5, limit = 50, offset = 0) => {
  // Validar parámetros con Joi
  const schema = Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    radiusKm: Joi.number().min(0.1).max(100).default(5),
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0)
  });

  const { error, value } = schema.validate({ lat, lng, radiusKm, limit, offset });
  if (error) {
    throw new ValidationError('Parámetros inválidos', error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message
    })));
  }

  const { lat: validLat, lng: validLng, radiusKm: validRadius } = value;

  // Paso 1: Pre-filtro con bounding box
  const bbox = calculateBoundingBox(validLat, validLng, validRadius);

  // Paso 2: Expresión Haversine para calcular distancia exacta
  const distanceExpr = literal(`
    6371 * 2 * ASIN(SQRT(
      POWER(SIN(RADIANS((${validLat}) - latitude) / 2), 2) +
      COS(RADIANS(${validLat})) * COS(RADIANS(latitude)) *
      POWER(SIN(RADIANS((${validLng}) - longitude) / 2), 2)
    ))
  `);

  // Paso 3: Query optimizada con bounding box + Haversine
  const gimnasios = await Gym.findAll({
    where: {
      latitude: { [Op.between]: [bbox.minLat, bbox.maxLat] },
      longitude: { [Op.between]: [bbox.minLng, bbox.maxLng] }
    },
    attributes: {
      include: [[distanceExpr, 'distance_km']]
    },
    having: literal(`distance_km <= ${validRadius}`),
    order: literal('distance_km ASC'),
    limit: value.limit,
    offset: value.offset,
    raw: true
  });

  return gimnasios.map(gym => ({
    ...gym,
    distance_km: parseFloat(gym.distance_km).toFixed(2)
  }));
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
