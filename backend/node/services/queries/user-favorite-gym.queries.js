/**
 * UserFavoriteGym Queries - Lote 9
 * Consultas para operaciones de lectura en gimnasios favoritos
 */

// ============================================================================
// USER FAVORITE GYM QUERIES
// ============================================================================

/**
 * ListFavoriteGymsQuery
 * Lista los gimnasios favoritos de un usuario
 */
class ListFavoriteGymsQuery {
  constructor({
    userProfileId,
    includeGymDetails = true,
  }) {
    this.userProfileId = userProfileId;
    this.includeGymDetails = includeGymDetails;
  }
}

/**
 * IsFavoriteGymQuery
 * Verifica si un gimnasio es favorito del usuario
 */
class IsFavoriteGymQuery {
  constructor({
    userProfileId,
    gymId,
  }) {
    this.userProfileId = userProfileId;
    this.gymId = gymId;
  }
}

/**
 * CountFavoriteGymsQuery
 * Cuenta los gimnasios favoritos de un usuario
 */
class CountFavoriteGymsQuery {
  constructor({ userProfileId }) {
    this.userProfileId = userProfileId;
  }
}

/**
 * ListUsersWhoFavoritedGymQuery
 * Lista usuarios que marcaron un gimnasio como favorito
 */
class ListUsersWhoFavoritedGymQuery {
  constructor({
    gymId,
    page = 1,
    limit = 20,
  }) {
    this.gymId = gymId;
    this.page = page;
    this.limit = limit;
  }
}

module.exports = {
  ListFavoriteGymsQuery,
  IsFavoriteGymQuery,
  CountFavoriteGymsQuery,
  ListUsersWhoFavoritedGymQuery,
};
