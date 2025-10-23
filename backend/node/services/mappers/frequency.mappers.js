/**
 * Mappers para Frequency (Frecuencia semanal)
 * Transformaciones entre DTOs, Commands/Queries y Entidades
 */

const {
  CreateWeeklyGoalCommand,
  UpdateWeeklyGoalCommand,
  IncrementAssistanceCommand,
  ResetWeekCommand
} = require('../commands/frequency.commands');

const {
  GetUserFrequencyQuery,
  GetFrequencyByIdQuery,
  ListFrequencyHistoryQuery,
  GetFrequencyStatsQuery
} = require('../queries/frequency.queries');

// ==================== RequestDTO → Command/Query ====================

function toCreateWeeklyGoalCommand(dto, idUserProfile) {
  return new CreateWeeklyGoalCommand({
    idUserProfile,
    goal: dto.goal
  });
}

function toUpdateWeeklyGoalCommand(dto, idUserProfile) {
  return new UpdateWeeklyGoalCommand({
    idUserProfile,
    goal: dto.goal
  });
}

function toIncrementAssistanceCommand(idUserProfile) {
  return new IncrementAssistanceCommand({ idUserProfile });
}

function toResetWeekCommand(idFrequency) {
  return new ResetWeekCommand({ idFrequency });
}

function toGetUserFrequencyQuery(idUserProfile) {
  return new GetUserFrequencyQuery({ idUserProfile });
}

function toGetFrequencyByIdQuery(idFrequency) {
  return new GetFrequencyByIdQuery({ idFrequency });
}

function toListFrequencyHistoryQuery(dto, idUserProfile) {
  return new ListFrequencyHistoryQuery({
    idUserProfile,
    page: dto.page ? parseInt(dto.page, 10) : 1,
    limit: dto.limit ? parseInt(dto.limit, 10) : 20,
    startDate: dto.start_date || dto.startDate || null,
    endDate: dto.end_date || dto.endDate || null
  });
}

function toGetFrequencyStatsQuery(idUserProfile) {
  return new GetFrequencyStatsQuery({ idUserProfile });
}

// ==================== Entity → ResponseDTO ====================

function toFrequencyResponse(frequency) {
  if (!frequency) return null;

  return {
    id_frequency: frequency.id_frequency || frequency.idFrequency,
    id_user_profile: frequency.id_user_profile || frequency.idUserProfile,
    goal: frequency.goal || 3,
    assist: frequency.assist || 0,
    achieved_goal: frequency.achieved_goal || frequency.achievedGoal || 0,
    week_start_date: frequency.week_start_date || frequency.weekStartDate,
    week_number: frequency.week_number || frequency.weekNumber,
    year: frequency.year,
    created_at: frequency.created_at || frequency.createdAt,
    updated_at: frequency.updated_at || frequency.updatedAt
  };
}

function toFrequencyHistoryResponse(history) {
  if (!history) return null;

  return {
    id_frequency_history: history.id_frequency_history || history.idFrequencyHistory,
    id_user_profile: history.id_user_profile || history.idUserProfile,
    week_start_date: history.week_start_date || history.weekStartDate,
    week_number: history.week_number || history.weekNumber,
    year: history.year,
    goal: history.goal,
    assist: history.assist,
    achieved: history.achieved || false,
    created_at: history.created_at || history.createdAt
  };
}

function toFrequencyStatsResponse(stats) {
  return {
    total_weeks: stats.totalWeeks || stats.total_weeks || 0,
    weeks_achieved: stats.weeksAchieved || stats.weeks_achieved || 0,
    achievement_rate: stats.achievementRate || stats.achievement_rate || 0,
    current_week: {
      goal: stats.currentWeek?.goal || stats.current_week?.goal || 0,
      assist: stats.currentWeek?.assist || stats.current_week?.assist || 0,
      progress_percentage: stats.currentWeek?.progressPercentage ||
                           stats.current_week?.progress_percentage || 0
    }
  };
}

function toPaginatedFrequencyHistoryResponse({ items, total, page, limit }) {
  return {
    items: items.map((history) => toFrequencyHistoryResponse(history)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
}

module.exports = {
  // Request → Command/Query
  toCreateWeeklyGoalCommand,
  toUpdateWeeklyGoalCommand,
  toIncrementAssistanceCommand,
  toResetWeekCommand,
  toGetUserFrequencyQuery,
  toGetFrequencyByIdQuery,
  toListFrequencyHistoryQuery,
  toGetFrequencyStatsQuery,

  // Entity → Response
  toFrequencyResponse,
  toFrequencyHistoryResponse,
  toFrequencyStatsResponse,
  toPaginatedFrequencyHistoryResponse
};
