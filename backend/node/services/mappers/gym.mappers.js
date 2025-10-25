/**
 * Mappers para el dominio Gyms
 *
 * Transforman entre DTOs (API) ↔ Commands/Queries ↔ Entidades (dominio)
 *
 * Flujo:
 * - Request: RequestDTO → Command/Query (toXCommand/toXQuery)
 * - Response: Entity/POJO → ResponseDTO (toXResponse)
 */

const {
  CreateGymCommand,
  UpdateGymCommand,
  DeleteGymCommand,
  AddFavoriteGymCommand,
  RemoveFavoriteGymCommand,
  SubscribeToGymCommand,
  UnsubscribeFromGymCommand,
} = require('../commands/gym.commands');

const {
  ListGymsQuery,
  GetGymDetailQuery,
  GetGymTypesQuery,
  GetGymAmenitiesQuery,
} = require('../queries/gym.queries');

const { normalizePagination } = require('../../utils/pagination');
const { normalizeSortParams, GYM_SORTABLE_FIELDS } = require('../../utils/sort-whitelist');

// ============================================================================
// RequestDTO → Command/Query
// ============================================================================

/**
 * Mapea CreateGymRequestDTO a CreateGymCommand
 *
 * @param {Object} dto - CreateGymRequestDTO del OpenAPI spec
 * @param {number} createdBy - ID del admin que crea el gym
 * @returns {CreateGymCommand}
 */
function toCreateGymCommand(dto, createdBy) {
  return new CreateGymCommand({
    name: dto.name,
    city: dto.city,
    address: dto.address,
    latitude: dto.latitude,
    longitude: dto.longitude,
    month_price: dto.month_price,
    geofence_radius_meters: dto.geofence_radius_meters || 100,
    min_stay_minutes: dto.min_stay_minutes || 30,
    description: dto.description || null,
    phone: dto.phone || null,
    email: dto.email || null,
    website: dto.website || null,
    is_active: dto.is_active !== undefined ? dto.is_active : true,
    verified: dto.verified || false,
    featured: dto.featured || false,
    auto_checkin_enabled: dto.auto_checkin_enabled || false,
    createdBy,
    id_types: dto.id_types || [],
    type_names: dto.type_names || [],
    amenities: dto.amenities || [],
    rules: dto.rules || [],
  });
}

/**
 * Mapea UpdateGymRequestDTO a UpdateGymCommand
 *
 * @param {Object} dto - UpdateGymRequestDTO del OpenAPI spec
 * @param {number} gymId - ID del gimnasio a actualizar
 * @param {number} updatedBy - ID del admin que actualiza el gym
 * @returns {UpdateGymCommand}
 */
function toUpdateGymCommand(dto, gymId, updatedBy) {
  return new UpdateGymCommand({
    gymId,
    name: dto.name,
    city: dto.city,
    address: dto.address,
    latitude: dto.latitude,
    longitude: dto.longitude,
    month_price: dto.month_price,
    geofence_radius_meters: dto.geofence_radius_meters,
    min_stay_minutes: dto.min_stay_minutes,
    description: dto.description,
    phone: dto.phone,
    email: dto.email,
    website: dto.website,
    is_active: dto.is_active,
    verified: dto.verified,
    featured: dto.featured,
    auto_checkin_enabled: dto.auto_checkin_enabled,
    updatedBy,
    id_types: dto.id_types,
    type_names: dto.type_names,
    amenities: dto.amenities,
    rules: dto.rules,
  });
}

/**
 * Mapea gymId a DeleteGymCommand
 *
 * @param {number} gymId - ID del gimnasio a eliminar
 * @param {number} deletedBy - ID del admin que elimina el gym
 * @returns {DeleteGymCommand}
 */
function toDeleteGymCommand(gymId, deletedBy) {
  return new DeleteGymCommand({ gymId, deletedBy });
}

/**
 * Mapea query params a ListGymsQuery
 *
 * @param {Object} queryParams - Query parameters del request
 * @param {number} [userId] - ID del usuario (opcional, para marcar favoritos)
 * @returns {ListGymsQuery}
 */
function toListGymsQuery(queryParams, userId = null) {
  // Normalizar paginación
  const { page, limit } = normalizePagination({
    page: queryParams.page,
    limit: queryParams.limit,
  });

  // Normalizar ordenamiento
  const { sortBy, order } = normalizeSortParams(
    queryParams.sortBy,
    queryParams.order,
    GYM_SORTABLE_FIELDS,
    'created_at',
    'DESC'
  );

  return new ListGymsQuery({
    page,
    limit,
    sortBy,
    order,
    city: queryParams.city || null,
    name: queryParams.name || null,
    latitude: queryParams.latitude ? parseFloat(queryParams.latitude) : null,
    longitude: queryParams.longitude ? parseFloat(queryParams.longitude) : null,
    radius: queryParams.radius ? parseFloat(queryParams.radius) : null,
    types: queryParams.types ? (Array.isArray(queryParams.types) ? queryParams.types : [queryParams.types]) : null,
    amenities: queryParams.amenities ? (Array.isArray(queryParams.amenities) ? queryParams.amenities : [queryParams.amenities]) : null,
    verified: queryParams.verified !== undefined ? queryParams.verified === 'true' : null,
    featured: queryParams.featured !== undefined ? queryParams.featured === 'true' : null,
    min_price: queryParams.min_price ? parseFloat(queryParams.min_price) : null,
    max_price: queryParams.max_price ? parseFloat(queryParams.max_price) : null,
    userId,
  });
}

/**
 * Mapea gymId a GetGymDetailQuery
 *
 * @param {number} gymId - ID del gimnasio
 * @param {number} [userId] - ID del usuario (opcional)
 * @returns {GetGymDetailQuery}
 */
function toGetGymDetailQuery(gymId, userId = null) {
  return new GetGymDetailQuery({ gymId, userId });
}

/**
 * Mapea a GetGymTypesQuery
 *
 * @param {Object} queryParams - Query parameters del request
 * @returns {GetGymTypesQuery}
 */
function toGetGymTypesQuery(queryParams = {}) {
  return new GetGymTypesQuery({
    activeOnly: queryParams.active_only !== 'false',
  });
}

/**
 * Mapea a GetGymAmenitiesQuery
 *
 * @param {Object} queryParams - Query parameters del request
 * @returns {GetGymAmenitiesQuery}
 */
function toGetGymAmenitiesQuery(queryParams = {}) {
  return new GetGymAmenitiesQuery({
    activeOnly: queryParams.active_only !== 'false',
  });
}

/**
 * Mapea a AddFavoriteGymCommand
 *
 * @param {number} userId - ID del usuario
 * @param {number} gymId - ID del gimnasio
 * @returns {AddFavoriteGymCommand}
 */
function toAddFavoriteGymCommand(userId, gymId) {
  return new AddFavoriteGymCommand({ userId, gymId });
}

/**
 * Mapea a RemoveFavoriteGymCommand
 *
 * @param {number} userId - ID del usuario
 * @param {number} gymId - ID del gimnasio
 * @returns {RemoveFavoriteGymCommand}
 */
function toRemoveFavoriteGymCommand(userId, gymId) {
  return new RemoveFavoriteGymCommand({ userId, gymId });
}

/**
 * Mapea SubscribeToGymRequestDTO a SubscribeToGymCommand
 *
 * @param {Object} dto - SubscribeToGymRequestDTO
 * @param {number} userId - ID del usuario
 * @param {number} gymId - ID del gimnasio
 * @returns {SubscribeToGymCommand}
 */
function toSubscribeToGymCommand(dto, userId, gymId) {
  return new SubscribeToGymCommand({
    userId,
    gymId,
    start_date: dto.start_date ? new Date(dto.start_date) : null,
    end_date: dto.end_date ? new Date(dto.end_date) : null,
    amount_paid: dto.amount_paid || null,
  });
}

/**
 * Mapea a UnsubscribeFromGymCommand
 *
 * @param {number} userId - ID del usuario
 * @param {number} gymId - ID del gimnasio
 * @returns {UnsubscribeFromGymCommand}
 */
function toUnsubscribeFromGymCommand(userId, gymId) {
  return new UnsubscribeFromGymCommand({ userId, gymId });
}

// ============================================================================
// Entity → ResponseDTO
// ============================================================================

/**
 * Mapea entidad Gym a GymResponseDTO
 *
 * @param {Object} gym - Gym entity/POJO
 * @param {Object} [options] - Opciones adicionales
 * @param {boolean} [options.isFavorite] - Si es favorito del usuario
 * @param {boolean} [options.isSubscribed] - Si el usuario está suscrito
 * @returns {Object} GymResponseDTO según OpenAPI spec
 */
function toGymResponse(gym, options = {}) {
  const response = {
    id_gym: gym.id_gym,
    name: gym.name,
    city: gym.city,
    address: gym.address,
    latitude: gym.latitude,
    longitude: gym.longitude,
    month_price: gym.month_price,
    geofence_radius_meters: gym.geofence_radius_meters,
    min_stay_minutes: gym.min_stay_minutes,
    description: gym.description || null,
    phone: gym.phone || null,
    email: gym.email || null,
    website: gym.website || null,
    is_active: gym.is_active,
    verified: gym.verified,
    featured: gym.featured,
    auto_checkin_enabled: gym.auto_checkin_enabled,
    created_at: gym.created_at.toISOString(),
    updated_at: gym.updated_at.toISOString(),
  };

  // Agregar campos opcionales si están presentes
  if (options.isFavorite !== undefined) {
    response.is_favorite = options.isFavorite;
  }
  if (options.isSubscribed !== undefined) {
    response.is_subscribed = options.isSubscribed;
  }
  if (gym.distance !== undefined) {
    response.distance = gym.distance;
  }

  return response;
}

/**
 * Mapea entidad GymType a GymTypeResponseDTO
 *
 * @param {Object} gymType - GymType entity/POJO
 * @returns {Object} GymTypeResponseDTO
 */
function toGymTypeResponse(gymType) {
  return {
    id_gym_type: gymType.id_gym_type,
    name: gymType.name,
    description: gymType.description || null,
    is_active: gymType.is_active,
    created_at: gymType.created_at.toISOString(),
    updated_at: gymType.updated_at.toISOString(),
  };
}

/**
 * Mapea entidad GymAmenity a GymAmenityResponseDTO
 *
 * @param {Object} amenity - GymAmenity entity/POJO
 * @returns {Object} GymAmenityResponseDTO
 */
function toGymAmenityResponse(amenity) {
  return {
    id_amenity: amenity.id_amenity,
    name: amenity.name,
    category: amenity.category || null,
    icon_name: amenity.icon_name || null,
    created_at: amenity.created_at ? amenity.created_at.toISOString() : null,
    updated_at: amenity.updated_at ? amenity.updated_at.toISOString() : null,
  };
}

/**
 * Mapea lista paginada de gyms a PaginatedGymsResponseDTO
 *
 * @param {Object} params - Parámetros
 * @param {Array} params.items - Array de Gym entities
 * @param {number} params.total - Total de items
 * @param {number} params.page - Página actual
 * @param {number} params.limit - Límite por página
 * @param {Object} [options] - Opciones para cada gym
 * @returns {Object} PaginatedGymsResponseDTO según OpenAPI spec
 */
function toPaginatedGymsResponse({ items, total, page, limit }, options = {}) {
  return {
    items: items.map(gym => toGymResponse(gym, options)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

module.exports = {
  // RequestDTO → Command/Query
  toCreateGymCommand,
  toUpdateGymCommand,
  toDeleteGymCommand,
  toListGymsQuery,
  toGetGymDetailQuery,
  toGetGymTypesQuery,
  toGetGymAmenitiesQuery,
  toAddFavoriteGymCommand,
  toRemoveFavoriteGymCommand,
  toSubscribeToGymCommand,
  toUnsubscribeFromGymCommand,

  // Entity → ResponseDTO
  toGymResponse,
  toGymTypeResponse,
  toGymAmenityResponse,
  toPaginatedGymsResponse,
};
