/**
 * UserGym Queries - Lote 9
 * Consultas para operaciones de lectura en suscripciones de gimnasios
 */

// ============================================================================
// USER GYM QUERIES
// ============================================================================

/**
 * ListUserGymsQuery
 * Lista los gimnasios suscritos de un usuario
 */
class ListUserGymsQuery {
  constructor({
    userProfileId,
    isActive = null,
    page = 1,
    limit = 20,
  }) {
    this.userProfileId = userProfileId;
    this.isActive = isActive;
    this.page = page;
    this.limit = limit;
  }
}

/**
 * GetUserGymByIdQuery
 * Obtiene una suscripción específica
 */
class GetUserGymByIdQuery {
  constructor({ userGymId }) {
    this.userGymId = userGymId;
  }
}

/**
 * GetActiveSubscriptionQuery
 * Obtiene la suscripción activa de un usuario en un gimnasio
 */
class GetActiveSubscriptionQuery {
  constructor({
    userProfileId,
    gymId,
  }) {
    this.userProfileId = userProfileId;
    this.gymId = gymId;
  }
}

/**
 * ListGymMembersQuery
 * Lista los miembros de un gimnasio
 */
class ListGymMembersQuery {
  constructor({
    gymId,
    isActive = null,
    page = 1,
    limit = 20,
  }) {
    this.gymId = gymId;
    this.isActive = isActive;
    this.page = page;
    this.limit = limit;
  }
}

/**
 * CountGymMembersQuery
 * Cuenta los miembros activos de un gimnasio
 */
class CountGymMembersQuery {
  constructor({ gymId }) {
    this.gymId = gymId;
  }
}

/**
 * ListExpiring SubscriptionsQuery
 * Lista suscripciones que están por vencer
 */
class ListExpiringSubscriptionsQuery {
  constructor({
    daysBeforeExpiry = 7,
    limit = 100,
  }) {
    this.daysBeforeExpiry = daysBeforeExpiry;
    this.limit = limit;
  }
}

module.exports = {
  ListUserGymsQuery,
  GetUserGymByIdQuery,
  GetActiveSubscriptionQuery,
  ListGymMembersQuery,
  CountGymMembersQuery,
  ListExpiringSubscriptionsQuery,
};
