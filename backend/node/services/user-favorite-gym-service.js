/**
 * UserFavoriteGym Service - Lote 9
 * Business logic for user favorite gyms
 */

const { userFavoriteGymRepository, gymRepository } = require('../infra/db/repositories');
const { NotFoundError, ConflictError } = require('../utils/errors');

// ============================================================================
// ADD FAVORITE GYM
// ============================================================================

async function addFavoriteGym(command) {
  // Verify gym exists
  const gym = await gymRepository.findById(command.gymId);
  if (!gym) {
    throw new NotFoundError('Gimnasio');
  }

  const result = await userFavoriteGymRepository.addFavoriteGym(
    command.userProfileId,
    command.gymId
  );

  if (!result.created) {
    throw new ConflictError('Este gimnasio ya está en favoritos');
  }

  return result.favorite;
}

// ============================================================================
// REMOVE FAVORITE GYM
// ============================================================================

async function removeFavoriteGym(command) {
  const removed = await userFavoriteGymRepository.removeFavoriteGym(
    command.userProfileId,
    command.gymId
  );

  if (!removed) {
    throw new NotFoundError('Gimnasio favorito');
  }

  return { success: true };
}

// ============================================================================
// LIST FAVORITE GYMS
// ============================================================================

async function listFavoriteGyms(query) {
  return userFavoriteGymRepository.findFavoriteGyms(query.userProfileId, {
    includeGymDetails: query.includeGymDetails,
  });
}

// ============================================================================
// CHECK IF FAVORITE
// ============================================================================

async function isFavoriteGym(query) {
  return userFavoriteGymRepository.isFavoriteGym(
    query.userProfileId,
    query.gymId
  );
}

// ============================================================================
// COUNT FAVORITES
// ============================================================================

async function countFavoriteGyms(query) {
  return userFavoriteGymRepository.countFavoriteGyms(query.userProfileId);
}

// ============================================================================
// LIST USERS WHO FAVORITED (Admin)
// ============================================================================

async function listUsersWhoFavoritedGym(query) {
  return userFavoriteGymRepository.findUsersWhoFavoritedGym(query.gymId, {
    page: query.page,
    limit: query.limit,
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  addFavoriteGym,
  removeFavoriteGym,
  listFavoriteGyms,
  isFavoriteGym,
  countFavoriteGyms,
  listUsersWhoFavoritedGym,
};
