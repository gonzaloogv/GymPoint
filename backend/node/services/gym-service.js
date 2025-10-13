const { Op, literal } = require('sequelize');
const { Gym, GymType, UserFavoriteGym, GymAmenity } = require('../models');
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

const amenityInclude = {
  model: GymAmenity,
  as: 'amenities',
  through: { attributes: [] }
};

const getAllGyms = async () => {
  return await Gym.findAll({
    include: [amenityInclude]
  });
};

const getGymById = async (id) => {
  return await Gym.findByPk(id, {
    include: [amenityInclude]
  });
};

const normalizeAmenityIds = (list) => {
  if (!Array.isArray(list)) return [];
  const unique = new Set();
  list.forEach((value) => {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
      unique.add(parsed);
    }
  });
  return Array.from(unique);
};

const createGym = async (data) => {
  const { id_types, amenities, ...gymData } = data;

  // creal gimnasio
  const gym = await Gym.create(gymData);

  // asociar tipos si vienen
  if (Array.isArray(id_types) && id_types.length > 0) {
    await gym.addGymTypes(id_types);
  }

  const amenityIds = normalizeAmenityIds(amenities);
  if (amenityIds.length > 0) {
    await gym.setAmenities(amenityIds);
  }

  await gym.reload({ include: [amenityInclude] });

  return gym;
};

const updateGym = async (id, data) => {
  const { id_types, amenities, ...gymData } = data;

  const gym = await Gym.findByPk(id);
  if (!gym) throw new NotFoundError('Gimnasio');

  // actualiza los datos del gimnasio
  await gym.update(gymData);

  // si se pasa nuevos tipos, reemplazarlos
  if (Array.isArray(id_types)) {
    await gym.setGymTypes(id_types); // reemplaza todas las asociaciones anteriores
  }

  if (amenities !== undefined) {
    const amenityIds = normalizeAmenityIds(Array.isArray(amenities) ? amenities : []);
    await gym.setAmenities(amenityIds);
  }

  await gym.reload({ include: [amenityInclude] });

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
    },
    include: [amenityInclude]
  });
};

const filtrarGimnasios = async ({ city, type, minPrice, maxPrice, amenities }) => {
  const include = [];

  if (type) {
    include.push({
      model: GymType,
      where: {
        name: { [Op.like]: `%${type}%` }
      }
    });
  }

  const amenityIds = Array.isArray(amenities) ? amenities : [];
  const amenityFilter = normalizeAmenityIds(amenityIds);

  include.push(amenityInclude);

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

  let filtrados = resultados;
  let advertencia = null;

  if (amenityFilter.length > 0) {
    filtrados = resultados.filter((gym) => {
      const gymAmenityIds = new Set((gym.amenities || []).map((amenity) => amenity.id_amenity));
      return amenityFilter.every((id) => gymAmenityIds.has(id));
    });

    if (filtrados.length === 0) {
      advertencia = 'No se encontraron gimnasios con todas las amenidades solicitadas.';
    } else if (filtrados.length < resultados.length) {
      advertencia = 'Se filtraron gimnasios que no cumplían todas las amenidades solicitadas.';
    }
  }

  return { resultados: filtrados, advertencia };
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

const obtenerFavoritos = async (id_user_profile) => {
  const favoritos = await UserFavoriteGym.findAll({
    where: { id_user_profile },
    include: [
      {
        model: Gym,
        as: 'gym',
        required: true,
        include: [amenityInclude]
      }
    ],
    order: [['created_at', 'DESC']]
  });
  return favoritos.map((fav) => ({
    id_gym: fav.id_gym,
    created_at: fav.created_at,
    gym: fav.gym
  }));
};
const toggleFavorito = async (id_user_profile, id_gym) => {
  const gym = await Gym.findByPk(id_gym, { attributes: ['id_gym', 'name', 'city'] });
  if (!gym) {
    throw new NotFoundError('Gimnasio');
  }
  const existing = await UserFavoriteGym.findOne({
    where: { id_user_profile, id_gym }
  });
  if (existing) {
    await existing.destroy();
    return {
      id_gym,
      favorite: false
    };
  }
  await UserFavoriteGym.create({ id_user_profile, id_gym });
  return {
    id_gym,
    favorite: true
  };
};

const listarAmenidades = async () => {
  return GymAmenity.findAll({
    order: [
      ['category', 'ASC'],
      ['name', 'ASC']
    ]
  });
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
  getGymTypes,
  obtenerFavoritos,
  toggleFavorito,
  listarAmenidades
};
