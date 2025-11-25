/**
 * UserFavoriteGym Commands - Lote 9
 * Comandos para operaciones de escritura en gimnasios favoritos
 */

// ============================================================================
// USER FAVORITE GYM COMMANDS
// ============================================================================

/**
 * AddFavoriteGymCommand
 * Añade un gimnasio a favoritos del usuario
 */
class AddFavoriteGymCommand {
  constructor({
    userProfileId,
    gymId,
  }) {
    this.userProfileId = userProfileId;
    this.gymId = gymId;
  }
}

/**
 * RemoveFavoriteGymCommand
 * Elimina un gimnasio de favoritos del usuario
 */
class RemoveFavoriteGymCommand {
  constructor({
    userProfileId,
    gymId,
  }) {
    this.userProfileId = userProfileId;
    this.gymId = gymId;
  }
}

module.exports = {
  AddFavoriteGymCommand,
  RemoveFavoriteGymCommand,
};
