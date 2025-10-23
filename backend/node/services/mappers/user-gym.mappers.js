/**
 * UserGym Mappers - Lote 9
 * Transformaciones entre DTOs, Commands/Queries y Entities para suscripciones de gimnasios
 */

const {
  SubscribeToGymCommand,
  UnsubscribeFromGymCommand,
  UpdateSubscriptionCommand,
  RenewSubscriptionCommand,
} = require('../commands/user-gym.commands');

const {
  ListUserGymsQuery,
  GetUserGymByIdQuery,
  GetActiveSubscriptionQuery,
  ListGymMembersQuery,
  CountGymMembersQuery,
} = require('../queries/user-gym.queries');

// ============================================================================
// DTO → Command
// ============================================================================

function toSubscribeToGymCommand(dto) {
  return new SubscribeToGymCommand({
    userProfileId: dto.userProfileId,
    gymId: dto.gymId,
    subscriptionPlan: dto.subscriptionPlan || 'MONTHLY',
    subscriptionStart: dto.subscriptionStart || null,
    subscriptionEnd: dto.subscriptionEnd || null,
  });
}

function toUnsubscribeFromGymCommand(dto) {
  return new UnsubscribeFromGymCommand({
    userProfileId: dto.userProfileId,
    gymId: dto.gymId,
  });
}

function toUpdateSubscriptionCommand(dto) {
  return new UpdateSubscriptionCommand({
    userGymId: dto.userGymId,
    subscriptionPlan: dto.subscriptionPlan || null,
    subscriptionEnd: dto.subscriptionEnd || null,
    isActive: dto.isActive ?? null,
  });
}

function toRenewSubscriptionCommand(dto) {
  return new RenewSubscriptionCommand({
    userGymId: dto.userGymId,
    subscriptionPlan: dto.subscriptionPlan || null,
  });
}

// ============================================================================
// DTO → Query
// ============================================================================

function toListUserGymsQuery(dto) {
  return new ListUserGymsQuery({
    userProfileId: dto.userProfileId,
    isActive: dto.isActive ?? null,
    page: dto.page || 1,
    limit: dto.limit || 20,
  });
}

function toGetUserGymByIdQuery(dto) {
  return new GetUserGymByIdQuery({
    userGymId: dto.userGymId,
  });
}

function toGetActiveSubscriptionQuery(dto) {
  return new GetActiveSubscriptionQuery({
    userProfileId: dto.userProfileId,
    gymId: dto.gymId,
  });
}

function toListGymMembersQuery(dto) {
  return new ListGymMembersQuery({
    gymId: dto.gymId,
    isActive: dto.isActive ?? null,
    page: dto.page || 1,
    limit: dto.limit || 20,
  });
}

function toCountGymMembersQuery(dto) {
  return new CountGymMembersQuery({
    gymId: dto.gymId,
  });
}

// ============================================================================
// Entity → DTO
// ============================================================================

function toUserGymDTO(userGym) {
  if (!userGym) return null;

  const dto = {
    id: userGym.id_user_gym,
    userProfileId: userGym.id_user_profile,
    gymId: userGym.id_gym,
    subscriptionPlan: userGym.subscription_plan,
    subscriptionStart: userGym.subscription_start,
    subscriptionEnd: userGym.subscription_end,
    isActive: userGym.is_active,
    createdAt: userGym.created_at,
    updatedAt: userGym.updated_at,
  };

  // Include gym details if available (from join)
  if (userGym.gym || userGym.Gym) {
    const gym = userGym.gym || userGym.Gym;
    dto.gym = {
      id: gym.id_gym,
      name: gym.name,
      city: gym.city,
      address: gym.address,
      monthPrice: gym.month_price ? parseFloat(gym.month_price) : null,
      weekPrice: gym.week_price ? parseFloat(gym.week_price) : null,
    };
  }

  // Include user profile details if available (from join)
  if (userGym.userProfile || userGym.UserProfile) {
    const profile = userGym.userProfile || userGym.UserProfile;
    dto.userProfile = {
      id: profile.id_user_profile,
      name: profile.name,
      lastname: profile.lastname,
      email: profile.email,
    };
  }

  return dto;
}

function toUserGymsDTO(userGyms) {
  return userGyms.map(toUserGymDTO);
}

function toPaginatedUserGymsDTO(result) {
  return {
    items: toUserGymsDTO(result.items || result.rows || []),
    total: result.total || result.count || 0,
    page: result.page || 1,
    limit: result.limit || 20,
    totalPages: result.totalPages || Math.ceil((result.total || result.count || 0) / (result.limit || 20)),
  };
}

function toMemberCountDTO(count) {
  return {
    activeMembers: count || 0,
  };
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // DTO → Command
  toSubscribeToGymCommand,
  toUnsubscribeFromGymCommand,
  toUpdateSubscriptionCommand,
  toRenewSubscriptionCommand,

  // DTO → Query
  toListUserGymsQuery,
  toGetUserGymByIdQuery,
  toGetActiveSubscriptionQuery,
  toListGymMembersQuery,
  toCountGymMembersQuery,

  // Entity → DTO
  toUserGymDTO,
  toUserGymsDTO,
  toPaginatedUserGymsDTO,
  toMemberCountDTO,
};
