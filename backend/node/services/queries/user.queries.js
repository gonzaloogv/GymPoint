/**
 * Queries para el dominio Users & Profiles
 *
 * Las Queries son objetos puros (POJOs) que representan una solicitud
 * de lectura de datos. No modifican el estado del sistema.
 *
 * Basado en: backend/plan/codex_prompt_openapi_refactor.md
 * - Lote 2: UserProfile, Presence, UserNotificationSetting
 */

/**
 * Query para obtener perfil de usuario por ID de cuenta
 * (Nota: Esta query ya existe en auth.queries como GetUserProfileQuery)
 *
 * @typedef {Object} GetUserByAccountIdQuery
 * @property {number} accountId - ID de la cuenta
 */
class GetUserByAccountIdQuery {
  constructor({ accountId }) {
    this.accountId = accountId;
  }
}

/**
 * Query para obtener perfil de usuario por ID de perfil
 *
 * @typedef {Object} GetUserProfileByIdQuery
 * @property {number} userProfileId - ID del user_profile
 */
class GetUserProfileByIdQuery {
  constructor({ userProfileId }) {
    this.userProfileId = userProfileId;
  }
}

/**
 * Query para obtener estado de solicitud de eliminación de cuenta
 *
 * @typedef {Object} GetAccountDeletionStatusQuery
 * @property {number} accountId - ID de la cuenta
 */
class GetAccountDeletionStatusQuery {
  constructor({ accountId }) {
    this.accountId = accountId;
  }
}

/**
 * Query para obtener configuración de notificaciones de un usuario
 *
 * @typedef {Object} GetNotificationSettingsQuery
 * @property {number} userProfileId - ID del user_profile
 */
class GetNotificationSettingsQuery {
  constructor({ userProfileId }) {
    this.userProfileId = userProfileId;
  }
}

/**
 * Query para obtener presencia activa de un usuario en un gym
 *
 * @typedef {Object} GetActivePresenceQuery
 * @property {number} userProfileId - ID del user_profile
 * @property {number} gymId - ID del gimnasio
 */
class GetActivePresenceQuery {
  constructor({ userProfileId, gymId }) {
    this.userProfileId = userProfileId;
    this.gymId = gymId;
  }
}

/**
 * Query para listar presencias de un usuario
 *
 * @typedef {Object} ListUserPresencesQuery
 * @property {number} userProfileId - ID del user_profile
 * @property {string} [status] - Filtrar por estado (DETECTING, CONFIRMED, EXITED)
 * @property {number} [gymId] - Filtrar por gimnasio
 * @property {Date} [startDate] - Fecha de inicio
 * @property {Date} [endDate] - Fecha de fin
 * @property {number} [page] - Número de página (default: 1)
 * @property {number} [limit] - Cantidad de resultados por página (default: 20)
 */
class ListUserPresencesQuery {
  constructor({ userProfileId, status = null, gymId = null, startDate = null, endDate = null, page = 1, limit = 20 }) {
    this.userProfileId = userProfileId;
    this.status = status;
    this.gymId = gymId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.page = page;
    this.limit = limit;
  }
}

/**
 * Query para listar usuarios (admin)
 *
 * @typedef {Object} ListUsersQuery
 * @property {number} [page] - Número de página (default: 1)
 * @property {number} [limit] - Cantidad de resultados por página (default: 20)
 * @property {string} [sortBy] - Campo para ordenar (name, email, created_at, tokens)
 * @property {string} [order] - Orden (ASC, DESC)
 * @property {string} [subscription] - Filtrar por suscripción (FREE, PREMIUM)
 * @property {string} [search] - Búsqueda por nombre o email
 */
class ListUsersQuery {
  constructor({
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    order = 'DESC',
    subscription = null,
    search = null,
  }) {
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.order = order;
    this.subscription = subscription;
    this.search = search;
  }
}

module.exports = {
  GetUserByAccountIdQuery,
  GetUserProfileByIdQuery,
  GetAccountDeletionStatusQuery,
  GetNotificationSettingsQuery,
  GetActivePresenceQuery,
  ListUserPresencesQuery,
  ListUsersQuery,
};
