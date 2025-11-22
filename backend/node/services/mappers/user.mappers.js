/**
 * Mappers para el dominio Users & Profiles
 *
 * Transforman entre DTOs (API) ↔ Commands/Queries ↔ Entidades (dominio)
 *
 * Flujo:
 * - Request: RequestDTO → Command/Query (toXCommand/toXQuery)
 * - Response: Entity/POJO → ResponseDTO (toXResponse)
 */

const {
  UpdateUserProfileCommand,
  UpdateEmailCommand,
  UpdateUserTokensCommand,
  UpdateUserSubscriptionCommand,
  RequestAccountDeletionCommand,
  CancelAccountDeletionCommand,
  UpdateNotificationSettingsCommand,
  CreatePresenceCommand,
  UpdatePresenceCommand,
} = require('../commands/user.commands');

const {
  GetUserByAccountIdQuery,
  GetUserProfileByIdQuery,
  GetAccountDeletionStatusQuery,
  GetNotificationSettingsQuery,
  GetActivePresenceQuery,
  ListUserPresencesQuery,
  ListUsersQuery,
} = require('../queries/user.queries');

const { normalizePagination } = require('../../utils/pagination');
const { normalizeSortParams, USER_SORTABLE_FIELDS } = require('../../utils/sort-whitelist');

// ============================================================================
// RequestDTO → Command/Query
// ============================================================================

/**
 * Mapea UpdateUserProfileRequestDTO a UpdateUserProfileCommand
 *
 * @param {Object} dto - UpdateUserProfileRequestDTO del OpenAPI spec
 * @param {number} userProfileId - ID del user_profile
 * @returns {UpdateUserProfileCommand}
 */
function toUpdateUserProfileCommand(dto, userProfileId) {
  return new UpdateUserProfileCommand({
    userProfileId,
    name: dto.name,
    lastname: dto.lastname,
    gender: dto.gender,
    birthDate: dto.birth_date ?? dto.birthDate ?? null,
    locality: dto.locality,
    profilePictureUrl: dto.profile_picture_url ?? dto.profilePictureUrl,
    preferredLanguage: dto.preferred_language ?? dto.preferredLanguage,
    timezone: dto.timezone,
    onboardingCompleted: dto.onboarding_completed ?? dto.onboardingCompleted,
  });
}

/**
 * Mapea UpdateEmailRequestDTO a UpdateEmailCommand
 *
 * @param {Object} dto - UpdateEmailRequestDTO
 * @param {number} accountId - ID de la cuenta
 * @returns {UpdateEmailCommand}
 */
function toUpdateEmailCommand(dto, accountId) {
  return new UpdateEmailCommand({
    accountId,
    newEmail: dto.email ?? dto.newEmail,
  });
}

/**
 * Mapea UpdateTokensRequestDTO a UpdateUserTokensCommand
 *
 * @param {Object} dto - UpdateTokensRequestDTO
 * @param {number} userProfileId - ID del user_profile
 * @returns {UpdateUserTokensCommand}
 */
function toUpdateUserTokensCommand(dto, userProfileId) {
  return new UpdateUserTokensCommand({
    userProfileId,
    delta: dto.delta,
    reason: dto.reason,
    refType: dto.ref_type ?? dto.refType ?? null,
    refId: dto.ref_id ?? dto.refId ?? null,
  });
}

/**
 * Mapea UpdateSubscriptionRequestDTO a UpdateUserSubscriptionCommand
 *
 * @param {Object} dto - UpdateSubscriptionRequestDTO
 * @param {number} userProfileId - ID del user_profile
 * @returns {UpdateUserSubscriptionCommand}
 */
function toUpdateUserSubscriptionCommand(dto, userProfileId) {
  return new UpdateUserSubscriptionCommand({
    userProfileId,
    subscription: dto.subscription,
    premiumSince: dto.premium_since ? new Date(dto.premium_since) : null,
    premiumExpires: dto.premium_expires ? new Date(dto.premium_expires) : null,
  });
}

/**
 * Mapea RequestAccountDeletionDTO a RequestAccountDeletionCommand
 *
 * @param {Object} dto - RequestAccountDeletionDTO
 * @param {number} accountId - ID de la cuenta
 * @returns {RequestAccountDeletionCommand}
 */
function toRequestAccountDeletionCommand(dto, accountId) {
  return new RequestAccountDeletionCommand({
    accountId,
    reason: dto.reason ?? null,
  });
}

/**
 * Mapea accountId a CancelAccountDeletionCommand
 *
 * @param {number} accountId - ID de la cuenta
 * @returns {CancelAccountDeletionCommand}
 */
function toCancelAccountDeletionCommand(accountId) {
  return new CancelAccountDeletionCommand({ accountId });
}

/**
 * Mapea GetAccountDeletionStatusDTO a GetAccountDeletionStatusQuery
 *
 * @param {number} accountId - ID de la cuenta
 * @returns {GetAccountDeletionStatusQuery}
 */
function toGetAccountDeletionStatusQuery(accountId) {
  return new GetAccountDeletionStatusQuery({ accountId });
}

/**
 * Mapea UpdateNotificationSettingsDTO a UpdateNotificationSettingsCommand
 *
 * @param {Object} dto - UpdateNotificationSettingsDTO
 * @param {number} userProfileId - ID del user_profile
 * @returns {UpdateNotificationSettingsCommand}
 */
function toUpdateNotificationSettingsCommand(dto, userProfileId) {
  return new UpdateNotificationSettingsCommand({
    userProfileId,
    remindersEnabled: dto.reminders_enabled ?? dto.remindersEnabled,
    achievementsEnabled: dto.achievements_enabled ?? dto.achievementsEnabled,
    rewardsEnabled: dto.rewards_enabled ?? dto.rewardsEnabled,
    gymUpdatesEnabled: dto.gym_updates_enabled ?? dto.gymUpdatesEnabled,
    paymentEnabled: dto.payment_enabled ?? dto.paymentEnabled,
    socialEnabled: dto.social_enabled ?? dto.socialEnabled,
    systemEnabled: dto.system_enabled ?? dto.systemEnabled,
    challengeEnabled: dto.challenge_enabled ?? dto.challengeEnabled,
    pushEnabled: dto.push_enabled ?? dto.pushEnabled,
    emailEnabled: dto.email_enabled ?? dto.emailEnabled,
    quietHoursStart: dto.quiet_hours_start ?? dto.quietHoursStart,
    quietHoursEnd: dto.quiet_hours_end ?? dto.quietHoursEnd,
  });
}

/**
 * Mapea GetNotificationSettingsQuery
 *
 * @param {number} userProfileId - ID del user_profile
 * @returns {GetNotificationSettingsQuery}
 */
function toGetNotificationSettingsQuery(userProfileId) {
  return new GetNotificationSettingsQuery({ userProfileId });
}

/**
 * Mapea CreatePresenceDTO a CreatePresenceCommand
 *
 * @param {Object} dto - CreatePresenceDTO
 * @param {number} userProfileId - ID del user_profile
 * @returns {CreatePresenceCommand}
 */
function toCreatePresenceCommand(dto, userProfileId) {
  return new CreatePresenceCommand({
    userProfileId,
    gymId: dto.gym_id ?? dto.gymId,
    distanceMeters: dto.distance_meters ?? dto.distanceMeters,
    accuracyMeters: dto.accuracy_meters ?? dto.accuracyMeters ?? null,
  });
}

/**
 * Mapea UpdatePresenceDTO a UpdatePresenceCommand
 *
 * @param {Object} dto - UpdatePresenceDTO
 * @param {number} presenceId - ID de la presencia
 * @returns {UpdatePresenceCommand}
 */
function toUpdatePresenceCommand(dto, presenceId) {
  return new UpdatePresenceCommand({
    presenceId,
    status: dto.status,
    lastSeenAt: dto.last_seen_at ? new Date(dto.last_seen_at) : undefined,
    exitedAt: dto.exited_at ? new Date(dto.exited_at) : undefined,
    distanceMeters: dto.distance_meters ?? dto.distanceMeters,
    accuracyMeters: dto.accuracy_meters ?? dto.accuracyMeters,
    convertedToAssistance: dto.converted_to_assistance ?? dto.convertedToAssistance,
    assistanceId: dto.assistance_id ?? dto.assistanceId,
  });
}

/**
 * Mapea GetUserByAccountIdQuery
 *
 * @param {number} accountId - ID de la cuenta
 * @returns {GetUserByAccountIdQuery}
 */
function toGetUserByAccountIdQuery(accountId) {
  return new GetUserByAccountIdQuery({ accountId });
}

/**
 * Mapea GetUserProfileByIdQuery
 *
 * @param {number} userProfileId - ID del user_profile
 * @returns {GetUserProfileByIdQuery}
 */
function toGetUserProfileByIdQuery(userProfileId) {
  return new GetUserProfileByIdQuery({ userProfileId });
}

/**
 * Mapea GetActivePresenceQuery
 *
 * @param {number} userProfileId - ID del user_profile
 * @param {number} gymId - ID del gimnasio
 * @returns {GetActivePresenceQuery}
 */
function toGetActivePresenceQuery(userProfileId, gymId) {
  return new GetActivePresenceQuery({ userProfileId, gymId });
}

/**
 * Mapea query params a ListUserPresencesQuery
 *
 * @param {Object} queryParams - Query parameters del request
 * @param {number} userProfileId - ID del user_profile
 * @returns {ListUserPresencesQuery}
 */
function toListUserPresencesQuery(queryParams, userProfileId) {
  const { page, limit } = normalizePagination({
    page: queryParams.page,
    limit: queryParams.limit,
  });

  return new ListUserPresencesQuery({
    userProfileId,
    status: queryParams.status || null,
    gymId: queryParams.gym_id ? parseInt(queryParams.gym_id) : null,
    startDate: queryParams.start_date ? new Date(queryParams.start_date) : null,
    endDate: queryParams.end_date ? new Date(queryParams.end_date) : null,
    page,
    limit,
  });
}

/**
 * Mapea query params a ListUsersQuery
 *
 * @param {Object} queryParams - Query parameters del request
 * @returns {ListUsersQuery}
 */
function toListUsersQuery(queryParams) {
  const { page, limit } = normalizePagination({
    page: queryParams.page,
    limit: queryParams.limit,
  });

  const { sortBy, order } = normalizeSortParams(
    queryParams.sortBy ?? queryParams.sort_by,
    queryParams.order,
    USER_SORTABLE_FIELDS,
    'created_at',
    'DESC'
  );

  return new ListUsersQuery({
    page,
    limit,
    sortBy,
    order,
    subscription: queryParams.subscription || null,
    search: queryParams.search || null,
  });
}

// ============================================================================
// Entity → ResponseDTO
// ============================================================================

/**
 * Helper para normalizar fechas
 */
function normalizeDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  try {
    return new Date(value).toISOString();
  } catch (err) {
    return null;
  }
}

function normalizeDateOnly(value) {
  const iso = normalizeDate(value);
  return iso ? iso.split('T')[0] : null;
}

/**
 * Mapea entidad UserProfile a UserProfileResponseDTO
 *
 * @param {Object} userProfile - UserProfile entity/POJO
 * @returns {Object} UserProfileResponseDTO según OpenAPI spec
 */
function toUserProfileResponse(userProfile) {
  return {
    id_user_profile: userProfile.id_user_profile ?? userProfile.idUserProfile,
    id_account: userProfile.id_account ?? userProfile.idAccount,
    email: userProfile.email,
    name: userProfile.name,
    lastname: userProfile.lastname,
    gender: userProfile.gender,
    birth_date: normalizeDateOnly(userProfile.birth_date ?? userProfile.birthDate),
    locality: userProfile.locality || null,
    subscription: userProfile.subscription || userProfile.app_tier || 'FREE',
    premium_since: normalizeDate(userProfile.premium_since ?? userProfile.premiumSince),
    premium_expires: normalizeDate(userProfile.premium_expires ?? userProfile.premiumExpires),
    tokens: userProfile.tokens || 0,
    profile_picture_url: userProfile.profile_picture_url ?? userProfile.profilePictureUrl ?? null,
    preferred_language: userProfile.preferred_language ?? userProfile.preferredLanguage ?? 'es',
    timezone: userProfile.timezone || null,
    onboarding_completed: Boolean(userProfile.onboarding_completed ?? userProfile.onboardingCompleted),
    created_at: normalizeDate(userProfile.created_at ?? userProfile.createdAt),
    updated_at: normalizeDate(userProfile.updated_at ?? userProfile.updatedAt),
  };
}

/**
 * Mapea entidad NotificationSettings a NotificationSettingsResponseDTO
 *
 * @param {Object} settings - UserNotificationSetting entity/POJO
 * @returns {Object} NotificationSettingsResponseDTO
 */
function toNotificationSettingsResponse(settings) {
  return {
    id_user_profile: settings.id_user_profile ?? settings.idUserProfile,
    reminders_enabled: Boolean(settings.reminders_enabled ?? settings.remindersEnabled ?? true),
    achievements_enabled: Boolean(settings.achievements_enabled ?? settings.achievementsEnabled ?? true),
    rewards_enabled: Boolean(settings.rewards_enabled ?? settings.rewardsEnabled ?? true),
    gym_updates_enabled: Boolean(settings.gym_updates_enabled ?? settings.gymUpdatesEnabled ?? true),
    payment_enabled: Boolean(settings.payment_enabled ?? settings.paymentEnabled ?? true),
    social_enabled: Boolean(settings.social_enabled ?? settings.socialEnabled ?? true),
    system_enabled: Boolean(settings.system_enabled ?? settings.systemEnabled ?? true),
    challenge_enabled: Boolean(settings.challenge_enabled ?? settings.challengeEnabled ?? true),
    push_enabled: Boolean(settings.push_enabled ?? settings.pushEnabled ?? true),
    email_enabled: Boolean(settings.email_enabled ?? settings.emailEnabled ?? false),
    quiet_hours_start: settings.quiet_hours_start ?? settings.quietHoursStart ?? null,
    quiet_hours_end: settings.quiet_hours_end ?? settings.quietHoursEnd ?? null,
  };
}

/**
 * Mapea entidad Presence a PresenceResponseDTO
 *
 * @param {Object} presence - Presence entity/POJO
 * @returns {Object} PresenceResponseDTO
 */
function toPresenceResponse(presence) {
  return {
    id_presence: presence.id_presence ?? presence.idPresence,
    id_user_profile: presence.id_user_profile ?? presence.idUserProfile,
    id_gym: presence.id_gym ?? presence.idGym,
    first_seen_at: normalizeDate(presence.first_seen_at ?? presence.firstSeenAt),
    last_seen_at: normalizeDate(presence.last_seen_at ?? presence.lastSeenAt),
    exited_at: normalizeDate(presence.exited_at ?? presence.exitedAt),
    status: presence.status || 'DETECTING',
    converted_to_assistance: Boolean(presence.converted_to_assistance ?? presence.convertedToAssistance),
    id_assistance: presence.id_assistance ?? presence.idAssistance ?? null,
    distance_meters: presence.distance_meters ?? presence.distanceMeters ?? null,
    accuracy_meters: presence.accuracy_meters ?? presence.accuracyMeters ?? null,
    location_updates_count: presence.location_updates_count ?? presence.locationUpdatesCount ?? 0,
    created_at: normalizeDate(presence.created_at ?? presence.createdAt),
    updated_at: normalizeDate(presence.updated_at ?? presence.updatedAt),
  };
}

/**
 * Mapea entidad AccountDeletionRequest a AccountDeletionResponseDTO
 *
 * @param {Object} request - AccountDeletionRequest entity/POJO
 * @returns {Object} AccountDeletionResponseDTO
 */
function toAccountDeletionResponse(request) {
  if (!request) return null;

  return {
    id_request: request.id_request ?? request.idRequest ?? request.id_deletion_request,
    id_account: request.id_account ?? request.idAccount,
    reason: request.reason || null,
    status: request.status,
    scheduled_deletion_date: normalizeDateOnly(request.scheduled_deletion_date ?? request.scheduledDeletionDate),
    requested_at: normalizeDate(request.requested_at ?? request.requestedAt),
    cancelled_at: normalizeDate(request.cancelled_at ?? request.cancelledAt),
    completed_at: normalizeDate(request.completed_at ?? request.completedAt),
    metadata: request.metadata || null,
    can_cancel: request.can_cancel ?? (request.status === 'PENDING'),
  };
}

/**
 * Mapea lista paginada de users a PaginatedUsersResponseDTO
 *
 * @param {Object} params - Parámetros
 * @param {Array} params.items - Array de UserProfile entities
 * @param {number} params.total - Total de items
 * @param {number} params.page - Página actual
 * @param {number} params.limit - Límite por página
 * @returns {Object} PaginatedUsersResponseDTO según OpenAPI spec
 */
function toPaginatedUsersResponse({ items, total, page, limit }) {
  return {
    items: items.map((user) => toUserProfileResponse(user)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Mapea lista paginada de presences a PaginatedPresencesResponseDTO
 *
 * @param {Object} params - Parámetros
 * @param {Array} params.items - Array de Presence entities
 * @param {number} params.total - Total de items
 * @param {number} params.page - Página actual
 * @param {number} params.limit - Límite por página
 * @returns {Object} PaginatedPresencesResponseDTO
 */
function toPaginatedPresencesResponse({ items, total, page, limit }) {
  return {
    items: items.map((presence) => toPresenceResponse(presence)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

module.exports = {
  // RequestDTO → Command/Query
  toUpdateUserProfileCommand,
  toUpdateEmailCommand,
  toUpdateUserTokensCommand,
  toUpdateUserSubscriptionCommand,
  toRequestAccountDeletionCommand,
  toCancelAccountDeletionCommand,
  toGetAccountDeletionStatusQuery,
  toUpdateNotificationSettingsCommand,
  toGetNotificationSettingsQuery,
  toCreatePresenceCommand,
  toUpdatePresenceCommand,
  toGetUserByAccountIdQuery,
  toGetUserProfileByIdQuery,
  toGetActivePresenceQuery,
  toListUserPresencesQuery,
  toListUsersQuery,

  // Entity → ResponseDTO
  toUserProfileResponse,
  toNotificationSettingsResponse,
  toPresenceResponse,
  toAccountDeletionResponse,
  toPaginatedUsersResponse,
  toPaginatedPresencesResponse,
};
