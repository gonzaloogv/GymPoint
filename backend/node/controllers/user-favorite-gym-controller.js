/**
 * UserFavoriteGym Controller - Lote 9
 * HTTP layer for favorite gyms using CQRS pattern
 */

const userFavoriteGymService = require('../services/user-favorite-gym-service');
const { userFavoriteGymMappers } = require('../services/mappers');
const { asyncHandler } = require('../middlewares/error-handler');

// ============================================================================
// HELPER
// ============================================================================

const requireUserProfile = (req, res) => {
  const profile = req.account?.userProfile;
  if (!profile) {
    res.status(403).json({
      error: {
        code: 'USER_PROFILE_REQUIRED',
        message: 'Perfil de usuario requerido',
      },
    });
    return null;
  }
  return profile;
};

// ============================================================================
// ADD FAVORITE GYM
// ============================================================================

const addFavoriteGym = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const { gymId } = req.body;

  const command = userFavoriteGymMappers.toAddFavoriteGymCommand({
    userProfileId: profile.id_user_profile,
    gymId,
  });

  const favorite = await userFavoriteGymService.addFavoriteGym(command);
  const dto = userFavoriteGymMappers.toFavoriteGymDTO(favorite);

  res.status(201).json({
    message: 'Gimnasio añadido a favoritos',
    data: dto,
  });
});

// ============================================================================
// REMOVE FAVORITE GYM
// ============================================================================

const removeFavoriteGym = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const { gymId } = req.params;

  const command = userFavoriteGymMappers.toRemoveFavoriteGymCommand({
    userProfileId: profile.id_user_profile,
    gymId: parseInt(gymId, 10),
  });

  await userFavoriteGymService.removeFavoriteGym(command);

  res.json({
    message: 'Gimnasio eliminado de favoritos',
  });
});

// ============================================================================
// LIST FAVORITE GYMS
// ============================================================================

const listFavoriteGyms = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const query = userFavoriteGymMappers.toListFavoriteGymsQuery({
    userProfileId: profile.id_user_profile,
    includeGymDetails: true,
  });

  const favorites = await userFavoriteGymService.listFavoriteGyms(query);
  const dto = userFavoriteGymMappers.toFavoriteGymsDTO(favorites);

  res.json({
    message: 'Gimnasios favoritos obtenidos',
    data: dto,
  });
});

// ============================================================================
// CHECK IF FAVORITE
// ============================================================================

const checkIsFavorite = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const { gymId } = req.params;

  const query = userFavoriteGymMappers.toIsFavoriteGymQuery({
    userProfileId: profile.id_user_profile,
    gymId: parseInt(gymId, 10),
  });

  const isFavorite = await userFavoriteGymService.isFavoriteGym(query);
  const dto = userFavoriteGymMappers.toIsFavoriteDTO(isFavorite);

  res.json(dto);
});

// ============================================================================
// COUNT FAVORITE GYMS
// ============================================================================

const countFavoriteGyms = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const query = userFavoriteGymMappers.toCountFavoriteGymsQuery({
    userProfileId: profile.id_user_profile,
  });

  const count = await userFavoriteGymService.countFavoriteGyms(query);
  const dto = userFavoriteGymMappers.toFavoriteCountDTO(count);

  res.json(dto);
});

// ============================================================================
// LIST USERS WHO FAVORITED (Admin)
// ============================================================================

const listUsersWhoFavorited = asyncHandler(async (req, res) => {
  const { gymId } = req.params;
  const { page, limit } = req.query;

  const query = userFavoriteGymMappers.toListUsersWhoFavoritedGymQuery({
    gymId: parseInt(gymId, 10),
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 20,
  });

  const result = await userFavoriteGymService.listUsersWhoFavoritedGym(query);
  const dto = userFavoriteGymMappers.toFavoriteGymsDTO(result.items);

  res.json({
    message: 'Usuarios que marcaron como favorito obtenidos',
    data: dto,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  addFavoriteGym,
  removeFavoriteGym,
  listFavoriteGyms,
  checkIsFavorite,
  countFavoriteGyms,
  listUsersWhoFavorited,
};
