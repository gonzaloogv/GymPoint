/**
 * UserFavoriteGym Mappers - Lote 9
 * Transformaciones entre DTOs, Commands/Queries y Entities para gimnasios favoritos
 */

const {
  AddFavoriteGymCommand,
  RemoveFavoriteGymCommand,
} = require('../commands/user-favorite-gym.commands');

const {
  ListFavoriteGymsQuery,
  IsFavoriteGymQuery,
  CountFavoriteGymsQuery,
  ListUsersWhoFavoritedGymQuery,
} = require('../queries/user-favorite-gym.queries');

// ============================================================================
// DTO → Command
// ============================================================================

function toAddFavoriteGymCommand(dto) {
  return new AddFavoriteGymCommand({
    userProfileId: dto.userProfileId,
    gymId: dto.gymId,
  });
}

function toRemoveFavoriteGymCommand(dto) {
  return new RemoveFavoriteGymCommand({
    userProfileId: dto.userProfileId,
    gymId: dto.gymId,
  });
}

// ============================================================================
// DTO → Query
// ============================================================================

function toListFavoriteGymsQuery(dto) {
  return new ListFavoriteGymsQuery({
    userProfileId: dto.userProfileId,
    includeGymDetails: dto.includeGymDetails !== false,
  });
}

function toIsFavoriteGymQuery(dto) {
  return new IsFavoriteGymQuery({
    userProfileId: dto.userProfileId,
    gymId: dto.gymId,
  });
}

function toCountFavoriteGymsQuery(dto) {
  return new CountFavoriteGymsQuery({
    userProfileId: dto.userProfileId,
  });
}

function toListUsersWhoFavoritedGymQuery(dto) {
  return new ListUsersWhoFavoritedGymQuery({
    gymId: dto.gymId,
    page: dto.page || 1,
    limit: dto.limit || 20,
  });
}

// ============================================================================
// Entity → DTO
// ============================================================================

function toFavoriteGymDTO(favorite) {
  if (!favorite) return null;

  const dto = {
    userProfileId: favorite.id_user_profile,
    gymId: favorite.id_gym,
    createdAt: favorite.created_at,
  };

  // Include gym details if available (from join)
  if (favorite.gym || favorite.Gym) {
    const gym = favorite.gym || favorite.Gym;
    dto.gym = {
      id: gym.id_gym,
      name: gym.name,
      city: gym.city,
      address: gym.address,
      latitude: gym.latitude ? parseFloat(gym.latitude) : null,
      longitude: gym.longitude ? parseFloat(gym.longitude) : null,
      monthPrice: gym.month_price ? parseFloat(gym.month_price) : null,
      weekPrice: gym.week_price ? parseFloat(gym.week_price) : null,
    };
  }

  return dto;
}

function toFavoriteGymsDTO(favorites) {
  return favorites.map(toFavoriteGymDTO);
}

function toIsFavoriteDTO(isFavorite) {
  return {
    isFavorite: Boolean(isFavorite),
  };
}

function toFavoriteCountDTO(count) {
  return {
    favoriteCount: count || 0,
  };
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // DTO → Command
  toAddFavoriteGymCommand,
  toRemoveFavoriteGymCommand,

  // DTO → Query
  toListFavoriteGymsQuery,
  toIsFavoriteGymQuery,
  toCountFavoriteGymsQuery,
  toListUsersWhoFavoritedGymQuery,

  // Entity → DTO
  toFavoriteGymDTO,
  toFavoriteGymsDTO,
  toIsFavoriteDTO,
  toFavoriteCountDTO,
};
