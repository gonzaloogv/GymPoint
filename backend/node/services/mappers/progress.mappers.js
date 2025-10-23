/**
 * Progress Service Mappers
 * Transformaciones entre DTOs, Commands/Queries y Entities
 */

// ==================== Request → Command/Query ====================

function toRegisterProgressCommand(dto, idUserProfile) {
  return {
    idUserProfile: idUserProfile || dto.id_user_profile || dto.idUserProfile,
    date: dto.date,
    totalWeightLifted: dto.total_weight_lifted || dto.totalWeightLifted || null,
    totalReps: dto.total_reps || dto.totalReps || null,
    totalSets: dto.total_sets || dto.totalSets || null,
    notes: dto.notes || null,
    exercises: dto.exercises || dto.ejercicios || []
  };
}

function toUpdateProgressCommand(dto, idProgress) {
  return {
    idProgress: idProgress || dto.id_progress || dto.idProgress,
    date: dto.date,
    totalWeightLifted: dto.total_weight_lifted || dto.totalWeightLifted,
    totalReps: dto.total_reps || dto.totalReps,
    totalSets: dto.total_sets || dto.totalSets,
    notes: dto.notes
  };
}

function toDeleteProgressCommand(idProgress) {
  return { idProgress };
}

function toGetProgressByIdQuery(idProgress) {
  return { idProgress };
}

function toGetUserProgressQuery(dto) {
  return {
    idUserProfile: dto.id_user_profile || dto.idUserProfile,
    limit: dto.limit ? parseInt(dto.limit, 10) : undefined,
    offset: dto.offset ? parseInt(dto.offset, 10) : undefined,
    includeExercises: dto.include_exercises === 'true' || dto.includeExercises === true
  };
}

function toGetWeightStatsQuery(dto) {
  return {
    idUserProfile: dto.id_user_profile || dto.idUserProfile,
    startDate: dto.start_date || dto.startDate,
    endDate: dto.end_date || dto.endDate
  };
}

function toGetExerciseHistoryQuery(dto) {
  return {
    idUserProfile: dto.id_user_profile || dto.idUserProfile,
    idExercise: dto.id_exercise || dto.idExercise,
    limit: dto.limit ? parseInt(dto.limit, 10) : 100
  };
}

function toGetPersonalRecordQuery(idUserProfile, idExercise) {
  return {
    idUserProfile,
    idExercise
  };
}

function toGetExerciseAveragesQuery(idUserProfile, idExercise) {
  return {
    idUserProfile,
    idExercise
  };
}

// ==================== Entity → Response ====================

function toProgressResponse(progress) {
  if (!progress) return null;

  return {
    id_progress: progress.id_progress,
    id_user_profile: progress.id_user_profile,
    date: progress.date,
    total_weight_lifted: progress.total_weight_lifted,
    total_reps: progress.total_reps,
    total_sets: progress.total_sets,
    notes: progress.notes,
    created_at: progress.created_at,
    user_profile: progress.userProfile ? {
      id_user_profile: progress.userProfile.id_user_profile,
      name: progress.userProfile.name,
      lastname: progress.userProfile.lastname
    } : undefined,
    exercises: progress.exercises ? progress.exercises.map(ex => ({
      id_exercise: ex.id_exercise,
      exercise_name: ex.exercise_name,
      muscular_group: ex.muscular_group,
      used_weight: ex.ProgressExercise?.used_weight,
      reps: ex.ProgressExercise?.reps,
      sets: ex.ProgressExercise?.sets
    })) : undefined
  };
}

function toProgressListResponse(progressList) {
  if (!progressList || !Array.isArray(progressList)) return [];
  return progressList.map(toProgressResponse).filter(Boolean);
}

function toWeightStatsResponse(stats) {
  if (!stats || !Array.isArray(stats)) return [];

  return stats.map(stat => ({
    date: stat.date,
    total_weight_lifted: stat.total_weight_lifted,
    total_reps: stat.total_reps,
    total_sets: stat.total_sets,
    notes: stat.notes
  }));
}

function toExerciseHistoryResponse(history) {
  if (!history || !Array.isArray(history)) return [];

  return history.map(item => ({
    date: item.date,
    id_exercise: item.idExercise,
    exercise_name: item.exerciseName,
    muscular_group: item.muscularGroup,
    used_weight: item.usedWeight,
    reps: item.reps,
    sets: item.sets
  }));
}

function toPersonalRecordResponse(pr) {
  if (!pr) return null;

  return {
    date: pr.date,
    used_weight: pr.usedWeight,
    reps: pr.reps,
    sets: pr.sets
  };
}

function toExerciseAveragesResponse(averages) {
  if (!averages) return null;

  return {
    average_weight: averages.averageWeight,
    average_reps: averages.averageReps,
    average_sets: averages.averageSets,
    total_records: averages.totalRecords
  };
}

module.exports = {
  // Request → Command/Query
  toRegisterProgressCommand,
  toUpdateProgressCommand,
  toDeleteProgressCommand,
  toGetProgressByIdQuery,
  toGetUserProgressQuery,
  toGetWeightStatsQuery,
  toGetExerciseHistoryQuery,
  toGetPersonalRecordQuery,
  toGetExerciseAveragesQuery,

  // Entity → Response
  toProgressResponse,
  toProgressListResponse,
  toWeightStatsResponse,
  toExerciseHistoryResponse,
  toPersonalRecordResponse,
  toExerciseAveragesResponse
};
