const Joi = require('joi');
const { NotFoundError, ValidationError } = require('../utils/errors');
const {
  gymRepository,
  // gymTypeRepository - ELIMINADO
  gymAmenityRepository,
} = require('../infra/db/repositories');
const {
  CreateGymCommand,
  UpdateGymCommand,
  DeleteGymCommand,
} = require('./commands/gym.commands');
const {
  ListGymsQuery,
  GetGymDetailQuery,
  // GetGymTypesQuery - ELIMINADO
  GetGymAmenitiesQuery,
} = require('./queries/gym.queries');
const {
  buildPaginatedResponse,
  normalizePagination,
} = require('../utils/pagination');
const { normalizeSortParams, GYM_SORTABLE_FIELDS } = require('../utils/sort-whitelist');

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const ensureListGymsQuery = (input = {}) =>
  input instanceof ListGymsQuery
    ? input
    : new ListGymsQuery({
        page: input.page,
        limit: input.limit,
        sortBy: input.sortBy,
        order: input.order,
        city: input.city ?? null,
        name: input.name ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        radius: input.radius ?? null,
        types: input.types ?? null,
        amenities: input.amenities ?? null,
        verified: input.verified ?? null,
        featured: input.featured ?? null,
        min_price: input.min_price ?? null,
        max_price: input.max_price ?? null,
        userId: input.userId ?? null,
      });

const ensureGetGymDetailQuery = (input) =>
  input instanceof GetGymDetailQuery
    ? input
    : new GetGymDetailQuery({
        gymId: input?.gymId ?? input?.id ?? input?.id_gym ?? input,
        userId: input?.userId ?? null,
      });

const ensureCreateGymCommand = (input = {}) =>
  input instanceof CreateGymCommand
    ? input
    : new CreateGymCommand({
        name: input.name,
        city: input.city,
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
        month_price: input.month_price,
        geofence_radius_meters: input.geofence_radius_meters,
        min_stay_minutes: input.min_stay_minutes,
        description: input.description,
        phone: input.phone,
        email: input.email,
        website: input.website,
        is_active: input.is_active,
        verified: input.verified,
        featured: input.featured,
        auto_checkin_enabled: input.auto_checkin_enabled,
        createdBy: input.createdBy ?? null,
        amenities: input.amenities || [],
        rules: input.rules || [],
        services: input.services || [],
        equipment: input.equipment || {},
      });

const ensureUpdateGymCommand = (gymId, input = {}) =>
  input instanceof UpdateGymCommand
    ? input
    : new UpdateGymCommand({
        gymId: input.gymId ?? gymId,
        name: input.name,
        city: input.city,
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
        month_price: input.month_price,
        geofence_radius_meters: input.geofence_radius_meters,
        min_stay_minutes: input.min_stay_minutes,
        description: input.description,
        phone: input.phone,
        email: input.email,
        website: input.website,
        is_active: input.is_active,
        verified: input.verified,
        featured: input.featured,
        auto_checkin_enabled: input.auto_checkin_enabled,
        updatedBy: input.updatedBy ?? null,
        amenities: input.amenities,
        rules: input.rules,
        services: input.services,
        equipment: input.equipment,
      });

const ensureDeleteGymCommand = (input) =>
  input instanceof DeleteGymCommand
    ? input
    : new DeleteGymCommand({
        gymId: input?.gymId ?? input?.id ?? input?.id_gym ?? input,
        deletedBy: input?.deletedBy ?? null,
      });

const parseActiveFlag = (value, defaultValue = true) => {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'string') return value.toLowerCase() !== 'false';
  return Boolean(value);
};

// ensureGetGymTypesQuery - ELIMINADO

const ensureGetGymAmenitiesQuery = (input = {}) =>
  input instanceof GetGymAmenitiesQuery
    ? input
    : new GetGymAmenitiesQuery({
        activeOnly: parseActiveFlag(input.activeOnly ?? input.active_only, true),
      });

const normalizeRules = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  if (value == null) return [];

  throw new ValidationError('El campo rules debe ser una lista de strings');
};

const normalizeAmenityIds = (list) => {
  if (!Array.isArray(list)) return [];
  const unique = new Set();
  list.forEach((value) => {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) unique.add(parsed);
  });
  return Array.from(unique);
};

// -----------------------------------------------------------------------------
// Use cases
// -----------------------------------------------------------------------------

const listGyms = async (input = {}) => {
  const query = ensureListGymsQuery(input);
  const { page, limit, offset } = normalizePagination({
    page: query.page,
    limit: query.limit,
  });

  const { sortBy, order } = normalizeSortParams(
    query.sortBy,
    query.order,
    GYM_SORTABLE_FIELDS,
    'created_at',
    'DESC'
  );

  const { rows, count } = await gymRepository.searchGyms({
    filters: {
      city: query.city,
      name: query.name,
      verified: query.verified,
      featured: query.featured,
      minPrice: query.min_price,
      maxPrice: query.max_price,
      type: Array.isArray(query.types) ? query.types[0] : query.types,
      amenityIds: normalizeAmenityIds(query.amenities),
    },
    pagination: { limit, offset },
    sort: { field: sortBy, direction: order },
  });

  return buildPaginatedResponse({ items: rows, total: count, page, limit });
};

const getAllGyms = async (input = {}) => {
  const result = await listGyms(input);
  return result.items;
};

const getGymById = async (input) => {
  const query = ensureGetGymDetailQuery(input);
  return gymRepository.findById(query.gymId);
};

const createGym = async (input) => {
  const command = ensureCreateGymCommand(input);

  const payload = {
    name: command.name,
    city: command.city,
    address: command.address,
    latitude: command.latitude,
    longitude: command.longitude,
    month_price: command.month_price,
    geofence_radius_meters: command.geofence_radius_meters ?? 100,
    min_stay_minutes: command.min_stay_minutes ?? 30,
    description: command.description,
    phone: command.phone,
    email: command.email,
    website: command.website,
    is_active: command.is_active !== undefined ? command.is_active : true,
    verified: command.verified || false,
    featured: command.featured || false,
    auto_checkin_enabled: command.auto_checkin_enabled || false,
    rules: normalizeRules(command.rules),
    equipment: command.equipment || {},
    services: command.services || [],
  };

  console.log('=== SERVICE createGym ===');
  console.log('Payload services:', JSON.stringify(payload.services));
  console.log('Payload equipment:', JSON.stringify(payload.equipment));

  const gym = await gymRepository.createGym(payload);

  // setGymTypes eliminado - los tipos ahora están en services array

  const amenityIds = normalizeAmenityIds(command.amenities);
  if (amenityIds.length > 0) {
    await gymRepository.setAmenities(gym.id_gym, amenityIds);
  }

  return gymRepository.findById(gym.id_gym);
};

const updateGym = async (id, data = {}) => {
  const command = ensureUpdateGymCommand(id, data);

  const existing = await gymRepository.findById(command.gymId);
  if (!existing) {
    throw new NotFoundError('Gimnasio');
  }

  const payload = {
    name: command.name,
    city: command.city,
    address: command.address,
    latitude: command.latitude,
    longitude: command.longitude,
    month_price: command.month_price,
    geofence_radius_meters: command.geofence_radius_meters,
    min_stay_minutes: command.min_stay_minutes,
    description: command.description,
    phone: command.phone,
    email: command.email,
    website: command.website,
    is_active: command.is_active,
    verified: command.verified,
    featured: command.featured,
    auto_checkin_enabled: command.auto_checkin_enabled,
  };

  if (command.rules !== undefined) {
    payload.rules = normalizeRules(command.rules);
  }
  if (command.equipment !== undefined) {
    payload.equipment = command.equipment;
  }
  if (command.services !== undefined) {
    payload.services = command.services;
  }

  await gymRepository.updateGym(command.gymId, payload, { returning: false });

  // setGymTypes eliminado - los tipos ahora están en services array

  if (command.amenities !== undefined) {
    const amenityIds = normalizeAmenityIds(command.amenities);
    await gymRepository.setAmenities(command.gymId, amenityIds);
  }

  return gymRepository.findById(command.gymId);
};

const deleteGym = async (input) => {
  const command = ensureDeleteGymCommand(input);
  const existing = await gymRepository.findById(command.gymId);
  if (!existing) throw new NotFoundError('Gimnasio');
  await gymRepository.deleteGym(command.gymId);
};

// -----------------------------------------------------------------------------
// Advanced queries
// -----------------------------------------------------------------------------

const nearbySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  radiusKm: Joi.number().positive().max(50).default(5),
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
});

const buscarGimnasiosCercanos = async (queryParams = {}) => {
  const { error, value } = nearbySchema.validate(queryParams, { abortEarly: false });
  if (error) {
    throw new ValidationError('Parámetros inválidos: ' + error.message);
  }

  return gymRepository.findNearby({
    lat: value.lat,
    lng: value.lng,
    radiusKm: value.radiusKm,
    limit: value.limit,
    offset: value.offset,
  });
};

const getGymsByCity = async (city) => gymRepository.findByCity(city);

const filtrarGimnasios = async ({ city, type, minPrice, maxPrice, amenities }) => {
  const amenityIds = normalizeAmenityIds(amenities);
  const { rows } = await gymRepository.searchGyms({
    filters: {
      city,
      type,
      minPrice,
      maxPrice,
      amenityIds,
    },
    pagination: { limit: 100, offset: 0 },
    sort: { field: 'month_price', direction: 'ASC' },
  });

  let filtrados = rows;
  let advertencia = null;

  if (amenityIds.length > 0) {
    filtrados = rows.filter((gym) => {
      const gymAmenityIds = new Set((gym.amenities || []).map((a) => a.id_amenity));
      return amenityIds.every((id) => gymAmenityIds.has(id));
    });
    if (filtrados.length === 0) {
      advertencia = 'No se encontraron gimnasios con todas las amenidades solicitadas.';
    } else if (filtrados.length < rows.length) {
      advertencia = 'Se filtraron gimnasios que no cumplían todas las amenidades solicitadas.';
    }
  }

  return { resultados: filtrados, advertencia };
};

// getGymTypes - ELIMINADO: Ya no se usa, los tipos están en services array

const obtenerFavoritos = async (id_user_profile) => {
  const favoritos = await gymRepository.findFavorites(id_user_profile);
  return favoritos.map((fav) => ({
    id_gym: fav.id_gym,
    created_at: fav.created_at,
    gym: fav.gym,
  }));
};

const toggleFavorito = async (id_user_profile, id_gym) => {
  const gym = await gymRepository.findById(id_gym);
  if (!gym) {
    throw new NotFoundError('Gimnasio');
  }

  const existente = await gymRepository.findFavorite(id_user_profile, id_gym);
  if (existente) {
    await gymRepository.deleteFavorite(id_user_profile, id_gym);
    return { id_gym, favorite: false };
  }

  await gymRepository.createFavorite({
    id_user_profile,
    id_gym,
  });
  return { id_gym, favorite: true };
};

const listarAmenidades = async (input = {}) => {
  // GymAmenity no tiene campo is_active, devolvemos todas
  return gymAmenityRepository.findAll({});
};

module.exports = {
  listGyms,
  getAllGyms,
  getGymById,
  createGym,
  updateGym,
  deleteGym,
  buscarGimnasiosCercanos,
  getGymsByCity,
  filtrarGimnasios,
  // getGymTypes - ELIMINADO
  obtenerFavoritos,
  toggleFavorito,
  listarAmenidades,
};
