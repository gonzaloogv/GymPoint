/**
 * Queries para el dominio Gyms
 *
 * Las Queries son objetos puros (POJOs) que representan una solicitud
 * de lectura de datos. No modifican el estado del sistema.
 *
 * Basado en: backend/plan/gym_point_contexto_de_logica_de_negocio_consolidado_p_1_p_35.md
 * - UC-GYM-01: Listar gyms con filtros
 */

/**
 * Query para listar gimnasios con filtros y paginación
 *
 * UC-GYM-01: Filtros disponibles:
 * - Por ciudad ✅
 * - Por nombre (búsqueda parcial) ✅
 * - Por distancia (latitude, longitude, radius) ✅
 * - Por tipo (FUNCIONAL, CROSSFIT) ✅
 * - Por servicios (WiFi, Ducha, Estacionamiento) ✅
 * - Solo verificados ✅
 * - Solo featured ✅
 * - Por rango de precio (min_price, max_price) ✅
 *
 * @typedef {Object} ListGymsQuery
 * @property {number} [page=1] - Número de página
 * @property {number} [limit=20] - Cantidad de resultados por página
 * @property {string} [sortBy='created_at'] - Campo para ordenar (name, city, created_at, distance)
 * @property {string} [order='DESC'] - Orden (ASC, DESC)
 * @property {string} [city] - Filtrar por ciudad
 * @property {string} [name] - Búsqueda parcial por nombre
 * @property {number} [latitude] - Latitud para búsqueda por distancia
 * @property {number} [longitude] - Longitud para búsqueda por distancia
 * @property {number} [radius] - Radio en metros para búsqueda por distancia
 * @property {string[]} [types] - Array de tipos de gimnasio
 * @property {string[]} [amenities] - Array de servicios/amenidades
 * @property {boolean} [verified] - Solo gimnasios verificados
 * @property {boolean} [featured] - Solo gimnasios destacados
 * @property {number} [min_price] - Precio mínimo
 * @property {number} [max_price] - Precio máximo
 * @property {number} [userId] - ID del usuario (para marcar favoritos y suscripciones)
 */
class ListGymsQuery {
  constructor({
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    order = 'DESC',
    city = null,
    name = null,
    latitude = null,
    longitude = null,
    radius = null,
    types = null,
    amenities = null,
    verified = null,
    featured = null,
    min_price = null,
    max_price = null,
    userId = null,
  }) {
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.order = order;
    this.city = city;
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.radius = radius;
    this.types = types;
    this.amenities = amenities;
    this.verified = verified;
    this.featured = featured;
    this.min_price = min_price;
    this.max_price = max_price;
    this.userId = userId;
  }
}

/**
 * Query para obtener detalle de un gimnasio
 *
 * UC-GYM-02: Incluir datos básicos, tipos, amenities, fotos, equipamiento,
 * horarios y especiales, precios, rating y reviews, si tiene auto-checkin,
 * verificado, si el usuario está suscrito, si es favorito
 *
 * @typedef {Object} GetGymDetailQuery
 * @property {number} gymId - ID del gimnasio
 * @property {number} [userId] - ID del usuario (para verificar favorito y suscripción)
 */
class GetGymDetailQuery {
  constructor({ gymId, userId = null }) {
    this.gymId = gymId;
    this.userId = userId;
  }
}

/**
 * Query para obtener tipos de gimnasio
 *
 * @typedef {Object} GetGymTypesQuery
 * @property {boolean} [activeOnly=true] - Solo tipos activos
 */
class GetGymTypesQuery {
  constructor({ activeOnly = true }) {
    this.activeOnly = activeOnly;
  }
}

/**
 * Query para obtener amenidades/servicios de gimnasio
 *
 * @typedef {Object} GetGymAmenitiesQuery
 * @property {boolean} [activeOnly=true] - Solo amenidades activas
 */
class GetGymAmenitiesQuery {
  constructor({ activeOnly = true }) {
    this.activeOnly = activeOnly;
  }
}

/**
 * Query para listar gimnasios favoritos de un usuario
 *
 * UC-GYM-03: Solo usuarios autenticados, límite: 5
 *
 * @typedef {Object} ListUserFavoriteGymsQuery
 * @property {number} userId - ID del usuario
 */
class ListUserFavoriteGymsQuery {
  constructor({ userId }) {
    this.userId = userId;
  }
}

/**
 * Query para verificar si un usuario tiene un gym como favorito
 *
 * @typedef {Object} IsGymFavoriteQuery
 * @property {number} userId - ID del usuario
 * @property {number} gymId - ID del gimnasio
 */
class IsGymFavoriteQuery {
  constructor({ userId, gymId }) {
    this.userId = userId;
    this.gymId = gymId;
  }
}

/**
 * Query para obtener suscripciones activas de un usuario
 *
 * UC-GYM-06: Usuario puede asociarse a máximo 2 gyms en paralelo
 *
 * @typedef {Object} GetUserActiveSubscriptionsQuery
 * @property {number} userId - ID del usuario
 */
class GetUserActiveSubscriptionsQuery {
  constructor({ userId }) {
    this.userId = userId;
  }
}

/**
 * Query para verificar si un usuario está suscrito a un gym
 *
 * @typedef {Object} IsUserSubscribedToGymQuery
 * @property {number} userId - ID del usuario
 * @property {number} gymId - ID del gimnasio
 */
class IsUserSubscribedToGymQuery {
  constructor({ userId, gymId }) {
    this.userId = userId;
    this.gymId = gymId;
  }
}

module.exports = {
  ListGymsQuery,
  GetGymDetailQuery,
  GetGymTypesQuery,
  GetGymAmenitiesQuery,
  ListUserFavoriteGymsQuery,
  IsGymFavoriteQuery,
  GetUserActiveSubscriptionsQuery,
  IsUserSubscribedToGymQuery,
};
