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
    id_user_gym: userGym.id_user_gym,
    id_user_profile: userGym.id_user_profile,
    id_gym: userGym.id_gym,
    subscription_plan: userGym.subscription_plan,
    subscription_start: userGym.subscription_start,
    subscription_end: userGym.subscription_end,
    is_active: userGym.is_active,
    trial_used: userGym.trial_used || false,
    trial_date: userGym.trial_date || null,
    created_at: userGym.created_at,
    updated_at: userGym.updated_at,
  };

  // Include gym details if available (from join)
  if (userGym.gym || userGym.Gym) {
    const gym = userGym.gym || userGym.Gym;
    dto.gym = {
      id_gym: gym.id_gym,
      name: gym.name,
      address: gym.address,
      latitude: gym.latitude,
      longitude: gym.longitude,
      profile_image_url: gym.profile_image_url || null,
      trial_allowed: gym.trial_allowed || false,
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
