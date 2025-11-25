/**
 * UserFavoriteGym Repository - Lote 9
 * Data access layer for user favorite gyms
 */

const { UserFavoriteGym, Gym, UserProfile } = require('../../../models');
const { toUserFavoriteGym, toUserFavoriteGyms } = require('../mappers/user-favorite-gym.mapper');

// ============================================================================
// CREATE
// ============================================================================

async function addFavoriteGym(userProfileId, gymId, options = {}) {
  const [favorite, created] = await UserFavoriteGym.findOrCreate({
    where: {
      id_user_profile: userProfileId,
      id_gym: gymId,
    },
    defaults: {
      id_user_profile: userProfileId,
      id_gym: gymId,
      created_at: new Date(),
    },
    transaction: options.transaction,
  });

  return {
    favorite: toUserFavoriteGym(favorite),
    created,
  };
}

// ============================================================================
// READ
// ============================================================================

async function findFavoriteGym(userProfileId, gymId, options = {}) {
  const favorite = await UserFavoriteGym.findOne({
    where: {
      id_user_profile: userProfileId,
      id_gym: gymId,
    },
    transaction: options.transaction,
  });

  return toUserFavoriteGym(favorite);
}

async function isFavoriteGym(userProfileId, gymId, options = {}) {
  const count = await UserFavoriteGym.count({
    where: {
      id_user_profile: userProfileId,
      id_gym: gymId,
    },
    transaction: options.transaction,
  });

  return count > 0;
}

async function findFavoriteGyms(userProfileId, options = {}) {
  const include = options.includeGymDetails ? [{ model: Gym, as: 'gym' }] : [];

  const favorites = await UserFavoriteGym.findAll({
    where: { id_user_profile: userProfileId },
    include,
    order: [['created_at', 'DESC']],
    transaction: options.transaction,
  });

  return toUserFavoriteGyms(favorites);
}

async function countFavoriteGyms(userProfileId, options = {}) {
  return UserFavoriteGym.count({
    where: { id_user_profile: userProfileId },
    transaction: options.transaction,
  });
}

async function findUsersWhoFavoritedGym(gymId, filters = {}, options = {}) {
  const { page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const { count, rows } = await UserFavoriteGym.findAndCountAll({
    where: { id_gym: gymId },
    include: [{ model: UserProfile, as: 'userProfile' }],
    limit,
    offset,
    order: [['created_at', 'DESC']],
    transaction: options.transaction,
  });

  return {
    items: toUserFavoriteGyms(rows),
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

// ============================================================================
// DELETE
// ============================================================================

async function removeFavoriteGym(userProfileId, gymId, options = {}) {
  const deleted = await UserFavoriteGym.destroy({
    where: {
      id_user_profile: userProfileId,
      id_gym: gymId,
    },
    transaction: options.transaction,
  });

  return deleted > 0;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  addFavoriteGym,
  findFavoriteGym,
  isFavoriteGym,
  findFavoriteGyms,
  countFavoriteGyms,
  findUsersWhoFavoritedGym,
  removeFavoriteGym,
};
