const { Op, literal } = require('sequelize');
const { Gym, GymAmenity, UserFavoriteGym } = require('../../../models');
const { toGym, toGyms } = require('../../db/mappers/gym.mapper');
const { toUserFavoriteGyms } = require('../../db/mappers/user-favorite-gym.mapper');

const AMENITY_ASSOC = {
  model: GymAmenity,
  as: 'amenities',
  through: { attributes: [] },
};

// TYPE_ASSOC - ELIMINADO: Ya no se usa, los tipos están en services array

const FAVORITE_GYM_ASSOC = {
  model: Gym,
  as: 'gym',
  include: [AMENITY_ASSOC],
};

const defaultInclude = (options = {}) => {
  const include = [];
  if (options.includeAmenities !== false) include.push(AMENITY_ASSOC);
  // includeTypes eliminado - ya no se usa
  return include.length ? include : undefined;
};

async function findById(idGym, options = {}) {
  const gym = await Gym.findByPk(idGym, {
    include: defaultInclude(options),
    paranoid: options.paranoid ?? true,
    transaction: options.transaction,
  });
  return toGym(gym, {
    includeAmenities: options.includeAmenities !== false,
  });
}

async function createGym(payload, options = {}) {
  const gym = await Gym.create(payload, {
    transaction: options.transaction,
  });
  return toGym(gym);
}

async function updateGym(idGym, payload, options = {}) {
  await Gym.update(payload, {
    where: { id_gym: idGym },
    transaction: options.transaction,
  });
  console.log('Update payload:', payload);

  if (options.returning === false) {
    return null;
  }

  return findById(idGym, options);
}

async function deleteGym(idGym, options = {}) {
  return Gym.destroy({
    where: { id_gym: idGym },
    transaction: options.transaction,
  });
}

async function setGymTypes(idGym, typeIds = [], options = {}) {
  const gym = await Gym.findByPk(idGym, {
    transaction: options.transaction,
  });
  if (!gym) return false;
  await gym.setTypes(typeIds, { transaction: options.transaction });
  return true;
}

async function setAmenities(idGym, amenityIds = [], options = {}) {
  const gym = await Gym.findByPk(idGym, {
    transaction: options.transaction,
  });
  if (!gym) return false;
  await gym.setAmenities(amenityIds, { transaction: options.transaction });
  return true;
}

async function searchGyms({
  filters = {},
  pagination = {},
  sort = {},
  options = {},
} = {}) {
  const where = {};
  const include = [];

  if (filters.city) {
    where.city = filters.city;
  }
  if (filters.name) {
    where.name = { [Op.like]: `%${filters.name}%` };
  }
  if (filters.verified !== undefined && filters.verified !== null) {
    where.verified = Boolean(filters.verified);
  }
  if (filters.featured !== undefined && filters.featured !== null) {
    where.featured = Boolean(filters.featured);
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    where.month_price = {};
    if (filters.minPrice != null) {
      where.month_price[Op.gte] = filters.minPrice;
    }
    if (filters.maxPrice != null) {
      where.month_price[Op.lte] = filters.maxPrice;
    }
  }
  if (filters.type) {
    include.push({
      ...TYPE_ASSOC,
      where: {
        name: { [Op.like]: `%${filters.type}%` },
      },
    });
  }

  if (filters.amenityIds?.length) {
    include.push({
      ...AMENITY_ASSOC,
      where: {
        id_amenity: filters.amenityIds,
      },
      required: true,
    });
  }

  const limit = pagination.limit ?? 20;
  const offset = pagination.offset ?? 0;
  const order = [[sort.field || 'created_at', sort.direction || 'DESC']];

  const { rows, count } = await Gym.findAndCountAll({
    where,
    include: include.length ? include : defaultInclude(options),
    limit,
    offset,
    distinct: true,
  });

  return {
    rows: toGyms(rows, {
      includeAmenities: options.includeAmenities !== false,
    }),
    count,
  };
}

async function findByCity(city, options = {}) {
  const gyms = await Gym.findAll({
    where: { city },
    include: defaultInclude(options),
  });
  return toGyms(gyms, {
    includeAmenities: options.includeAmenities !== false,
  });
}

async function findNearby({ lat, lng, radiusKm, limit, offset }) {
  const earthRadiusKm = 6378.137; // WGS84 - usado por Mapbox y GPS

  const latMin = lat - (radiusKm / earthRadiusKm) * (180 / Math.PI);
  const latMax = lat + (radiusKm / earthRadiusKm) * (180 / Math.PI);
  const lngMin =
    lng -
    ((radiusKm / earthRadiusKm) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);
  const lngMax =
    lng +
    ((radiusKm / earthRadiusKm) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);

  const gyms = await Gym.findAll({
    attributes: {
      include: [
        [
          literal(
            `(6378.137 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude))))`
          ),
          'distance_km',
        ],
      ],
    },
    where: {
      latitude: { [Op.between]: [latMin, latMax] },
      longitude: { [Op.between]: [lngMin, lngMax] },
    },
    include: defaultInclude({}),
    having: literal(`distance_km <= ${radiusKm}`),
    order: [[literal('distance_km'), 'ASC']],
    limit,
    offset,
  });

  return toGyms(gyms);
}

async function findFavorites(idUserProfile, options = {}) {
  const favorites = await UserFavoriteGym.findAll({
    where: { id_user_profile: idUserProfile },
    include: options.includeGym === false ? undefined : [FAVORITE_GYM_ASSOC],
    order: options.order || [['created_at', 'DESC']],
    transaction: options.transaction,
  });

  return toUserFavoriteGyms(favorites, {
    includeGym: options.includeGym !== false,
  });
}

async function findFavorite(idUserProfile, idGym, options = {}) {
  const favorite = await UserFavoriteGym.findOne({
    where: { id_user_profile: idUserProfile, id_gym: idGym },
    include: options.includeGym === false ? undefined : [FAVORITE_GYM_ASSOC],
    transaction: options.transaction,
  });

  return favorite
    ? toUserFavoriteGyms([favorite], {
        includeGym: options.includeGym !== false,
      })[0]
    : null;
}

async function createFavorite(payload, options = {}) {
  const favorite = await UserFavoriteGym.create(
    {
      id_user_profile: payload.id_user_profile,
      id_gym: payload.id_gym,
      created_at: payload.created_at || new Date(),
    },
    { transaction: options.transaction }
  );

  return toUserFavoriteGyms([favorite])[0];
}

async function deleteFavorite(idUserProfile, idGym, options = {}) {
  return UserFavoriteGym.destroy({
    where: { id_user_profile: idUserProfile, id_gym: idGym },
    transaction: options.transaction,
  });
}

module.exports = {
  findById,
  createGym,
  updateGym,
  deleteGym,
  setGymTypes,
  setAmenities,
  searchGyms,
  findByCity,
  findNearby,
  findFavorites,
  findFavorite,
  createFavorite,
  deleteFavorite,
};
