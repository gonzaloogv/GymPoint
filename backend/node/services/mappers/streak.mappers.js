/**
 * Mappers para Streaks (Rachas)
 * Transformaciones entre DTOs, Commands/Queries y Entidades
 */

const {
  UseRecoveryItemCommand,
  UpdateStreakCommand,
  ResetStreakCommand
} = require('../commands/streak.commands');

const {
  GetUserStreakQuery,
  GetStreakByIdQuery,
  GetStreakStatsQuery,
  ListTopStreaksQuery
} = require('../queries/streak.queries');

// ==================== RequestDTO → Command/Query ====================

function toUseRecoveryItemCommand(idUserProfile) {
  return new UseRecoveryItemCommand({ idUserProfile });
}

function toUpdateStreakCommand(dto, idStreak) {
  return new UpdateStreakCommand({
    idStreak,
    value: dto.value,
    lastValue: dto.last_value || dto.lastValue,
    maxValue: dto.max_value || dto.maxValue,
    recoveryItems: dto.recovery_items || dto.recoveryItems,
    lastAssistanceDate: dto.last_assistance_date || dto.lastAssistanceDate
  });
}

function toResetStreakCommand(idUserProfile) {
  return new ResetStreakCommand({ idUserProfile });
}

function toGetUserStreakQuery(idUserProfile) {
  return new GetUserStreakQuery({ idUserProfile });
}

function toGetStreakByIdQuery(idStreak) {
  return new GetStreakByIdQuery({ idStreak });
}

function toGetStreakStatsQuery() {
  return new GetStreakStatsQuery();
}

function toListTopStreaksQuery(dto) {
  return new ListTopStreaksQuery({
    limit: dto.limit ? parseInt(dto.limit, 10) : 10
  });
}

// ==================== Entity → ResponseDTO ====================

function toStreakResponse(streak) {
  if (!streak) return null;

  return {
    id_streak: streak.id_streak || streak.idStreak,
    id_user_profile: streak.id_user_profile || streak.idUserProfile,
    id_frequency: streak.id_frequency || streak.idFrequency,
    value: streak.value || 0,
    last_value: streak.last_value || streak.lastValue || 0,
    max_value: streak.max_value || streak.maxValue || 0,
    recovery_items: streak.recovery_items || streak.recoveryItems || 0,
    last_assistance_date: streak.last_assistance_date || streak.lastAssistanceDate || null,
    created_at: streak.created_at || streak.createdAt,
    updated_at: streak.updated_at || streak.updatedAt
  };
}

function toStreakWithUserResponse(streak) {
  if (!streak) return null;

  const response = toStreakResponse(streak);

  if (streak.userProfile) {
    response.user = {
      id_user_profile: streak.userProfile.id_user_profile || streak.userProfile.idUserProfile,
      name: streak.userProfile.name,
      lastname: streak.userProfile.lastname
    };
  }

  if (streak.frequency) {
    response.frequency = {
      goal: streak.frequency.goal,
      assist: streak.frequency.assist,
      achieved_goal: streak.frequency.achieved_goal || streak.frequency.achievedGoal
    };
  }

  return response;
}

function toStreakStatsResponse(stats) {
  return {
    total_streaks: stats.totalStreaks || stats.total_streaks || 0,
    average_streak: stats.averageStreak || stats.average_streak || 0,
    max_streak: stats.maxStreak || stats.max_streak || 0,
    total_recovery_items: stats.totalRecoveryItems || stats.total_recovery_items || 0
  };
}

function toTopStreaksResponse(streaks) {
  return streaks.map((streak) => toStreakWithUserResponse(streak));
}

module.exports = {
  // Request → Command/Query
  toUseRecoveryItemCommand,
  toUpdateStreakCommand,
  toResetStreakCommand,
  toGetUserStreakQuery,
  toGetStreakByIdQuery,
  toGetStreakStatsQuery,
  toListTopStreaksQuery,

  // Entity → Response
  toStreakResponse,
  toStreakWithUserResponse,
  toStreakStatsResponse,
  toTopStreaksResponse
};
