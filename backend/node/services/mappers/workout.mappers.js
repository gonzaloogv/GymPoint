/**
 * Mappers para Workout (Lote 7)
 * Transformaciones entre DTOs, Commands/Queries y Entidades
 */

const {
  StartWorkoutSessionCommand,
  RegisterWorkoutSetCommand,
  UpdateWorkoutSetCommand,
  DeleteWorkoutSetCommand,
  FinishWorkoutSessionCommand,
  CancelWorkoutSessionCommand,
  UpdateWorkoutSessionCommand
} = require('../commands/workout.commands');

const {
  GetWorkoutSessionQuery,
  ListWorkoutSessionsQuery,
  GetWorkoutSetQuery,
  ListWorkoutSetsQuery,
  GetWorkoutStatsQuery,
  GetActiveWorkoutSessionQuery,
  GetWorkoutSessionWithSetsQuery,
  GetLastSetsForExercisesQuery
} = require('../queries/workout.queries');

// ==================== RequestDTO → Command/Query ====================

function toStartWorkoutSessionCommand(dto, idUserProfile) {
  return new StartWorkoutSessionCommand({
    idUserProfile: idUserProfile || dto.id_user_profile || dto.idUserProfile,
    idRoutine: dto.id_routine || dto.idRoutine || null,
    idRoutineDay: dto.id_routine_day || dto.idRoutineDay || null,
    startedAt: dto.started_at || dto.startedAt || new Date(),
    notes: dto.notes || null
  });
}

function toRegisterWorkoutSetCommand(dto, idWorkoutSession) {
  return new RegisterWorkoutSetCommand({
    idWorkoutSession,
    idExercise: dto.id_exercise || dto.idExercise,
    weight: dto.weight || null,
    reps: dto.reps || null,
    rpe: dto.rpe || null,
    restSeconds: dto.rest_seconds || dto.restSeconds || null,
    isWarmup: dto.is_warmup ?? dto.isWarmup ?? false,
    notes: dto.notes || null,
    performedAt: dto.performed_at || dto.performedAt || new Date()
  });
}

function toUpdateWorkoutSetCommand(dto, idWorkoutSet) {
  return new UpdateWorkoutSetCommand({
    idWorkoutSet,
    weight: dto.weight,
    reps: dto.reps,
    rpe: dto.rpe,
    restSeconds: dto.rest_seconds || dto.restSeconds,
    isWarmup: dto.is_warmup ?? dto.isWarmup,
    notes: dto.notes
  });
}

function toDeleteWorkoutSetCommand(idWorkoutSet) {
  return new DeleteWorkoutSetCommand({ idWorkoutSet });
}

function toFinishWorkoutSessionCommand(dto, idWorkoutSession) {
  return new FinishWorkoutSessionCommand({
    idWorkoutSession,
    finishedAt: dto.ended_at || dto.finishedAt || dto.finished_at || new Date(),
    notes: dto.notes
  });
}

function toCancelWorkoutSessionCommand(idWorkoutSession) {
  return new CancelWorkoutSessionCommand({ idWorkoutSession });
}

function toUpdateWorkoutSessionCommand(dto, idWorkoutSession) {
  return new UpdateWorkoutSessionCommand({
    idWorkoutSession,
    notes: dto.notes
  });
}

function toGetWorkoutSessionQuery(idWorkoutSession, includeSets = false) {
  return new GetWorkoutSessionQuery({
    idWorkoutSession,
    includeSets
  });
}

function toGetWorkoutSessionWithSetsQuery(idWorkoutSession) {
  return new GetWorkoutSessionWithSetsQuery({ idWorkoutSession });
}

function toGetActiveWorkoutSessionQuery(idUserProfile) {
  return new GetActiveWorkoutSessionQuery({ idUserProfile });
}

function toListWorkoutSessionsQuery(dto, idUserProfile) {
  return new ListWorkoutSessionsQuery({
    idUserProfile: idUserProfile || dto.id_user_profile || dto.idUserProfile,
    idRoutine: dto.id_routine || dto.idRoutine || null,
    status: dto.status || null,
    startDate: dto.start_date || dto.startDate || null,
    endDate: dto.end_date || dto.endDate || null,
    page: dto.page ? parseInt(dto.page, 10) : 1,
    limit: dto.limit ? parseInt(dto.limit, 10) : 20
  });
}

function toGetWorkoutSetQuery(idWorkoutSet) {
  return new GetWorkoutSetQuery({ idWorkoutSet });
}

function toListWorkoutSetsQuery(idWorkoutSession, idExercise = null) {
  return new ListWorkoutSetsQuery({
    idWorkoutSession,
    idExercise
  });
}

function toGetWorkoutStatsQuery(dto, idUserProfile) {
  return new GetWorkoutStatsQuery({
    idUserProfile: idUserProfile || dto.id_user_profile || dto.idUserProfile,
    startDate: dto.start_date || dto.startDate || null,
    endDate: dto.end_date || dto.endDate || null
  });
}

// ==================== Entity → ResponseDTO ====================

function toWorkoutSessionResponse(session) {
  if (!session) return null;

  const response = {
    id_workout_session: session.id_workout_session || session.idWorkoutSession,
    id_user_profile: session.id_user_profile || session.idUserProfile,
    id_routine: session.id_routine || session.idRoutine || null,
    id_routine_day: session.id_routine_day || session.idRoutineDay || null,
    status: session.status,
    started_at: session.started_at || session.startedAt,
    ended_at: session.ended_at || session.endedAt || null,
    duration_seconds: session.duration_seconds || session.durationSeconds || null,
    total_sets: session.total_sets || session.totalSets || 0,
    total_reps: session.total_reps || session.totalReps || 0,
    total_weight: session.total_weight || session.totalWeight || 0,
    notes: session.notes || null,
    created_at: session.created_at || session.createdAt,
    updated_at: session.updated_at || session.updatedAt
  };

  // Include routine if available
  if (session.routine) {
    response.routine = {
      id_routine: session.routine.id_routine,
      routine_name: session.routine.routine_name
    };
  }

  // Include routine day if available
  if (session.routineDay) {
    response.routine_day = {
      id_routine_day: session.routineDay.id_routine_day,
      day_number: session.routineDay.day_number,
      day_name: session.routineDay.day_name || null
    };
  }

  // Include sets if available
  if (session.sets) {
    response.sets = session.sets.map((set) => toWorkoutSetResponse(set));
  }

  return response;
}

function toWorkoutSetResponse(workoutSet) {
  if (!workoutSet) return null;

  const response = {
    id_workout_set: workoutSet.id_workout_set || workoutSet.idWorkoutSet,
    id_workout_session: workoutSet.id_workout_session || workoutSet.idWorkoutSession,
    id_exercise: workoutSet.id_exercise || workoutSet.idExercise,
    set_number: workoutSet.set_number || workoutSet.setNumber,
    weight: workoutSet.weight || null,
    reps: workoutSet.reps || null,
    rpe: workoutSet.rpe || null,
    rest_seconds: workoutSet.rest_seconds || workoutSet.restSeconds || null,
    is_warmup: workoutSet.is_warmup ?? workoutSet.isWarmup ?? false,
    notes: workoutSet.notes || null,
    performed_at: workoutSet.performed_at || workoutSet.performedAt,
    created_at: workoutSet.created_at || workoutSet.createdAt,
    updated_at: workoutSet.updated_at || workoutSet.updatedAt
  };

  // Include exercise if available
  if (workoutSet.exercise) {
    response.exercise = {
      id_exercise: workoutSet.exercise.id_exercise,
      exercise_name: workoutSet.exercise.exercise_name,
      muscular_group: workoutSet.exercise.muscular_group || null
    };
  }

  return response;
}

function toWorkoutSessionsResponse(sessions) {
  if (!sessions || !Array.isArray(sessions)) return [];
  return sessions.map((session) => toWorkoutSessionResponse(session));
}

function toWorkoutSetsResponse(sets) {
  if (!sets || !Array.isArray(sets)) return [];
  return sets.map((set) => toWorkoutSetResponse(set));
}

function toWorkoutStatsResponse(stats) {
  if (!stats) return null;

  return {
    total_workouts: stats.total_workouts || stats.totalWorkouts || 0,
    total_sets: stats.total_sets || stats.totalSets || 0,
    total_reps: stats.total_reps || stats.totalReps || 0,
    total_weight: stats.total_weight || stats.totalWeight || 0
  };
}

function toPaginatedWorkoutSessionsResponse({ items, page, limit, total }) {
  return {
    items: toWorkoutSessionsResponse(items),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
}

function toGetLastSetsForExercisesQuery(dto, idUserProfile) {
  return new GetLastSetsForExercisesQuery({
    idUserProfile,
    exerciseIds: dto.exercise_ids || dto.exerciseIds || []
  });
}

function toLastSetsForExercisesResponse(lastSets) {
  if (!lastSets || !Array.isArray(lastSets)) return [];

  return lastSets.map((item) => ({
    id_exercise: item.id_exercise,
    last_weight: item.last_weight || 0,
    last_reps: item.last_reps || 0,
    has_history: item.has_history || false
  }));
}

module.exports = {
  // Request → Command/Query
  toStartWorkoutSessionCommand,
  toRegisterWorkoutSetCommand,
  toUpdateWorkoutSetCommand,
  toDeleteWorkoutSetCommand,
  toFinishWorkoutSessionCommand,
  toCancelWorkoutSessionCommand,
  toUpdateWorkoutSessionCommand,
  toGetWorkoutSessionQuery,
  toGetWorkoutSessionWithSetsQuery,
  toGetActiveWorkoutSessionQuery,
  toListWorkoutSessionsQuery,
  toGetWorkoutSetQuery,
  toListWorkoutSetsQuery,
  toGetWorkoutStatsQuery,
  toGetLastSetsForExercisesQuery,

  // Entity → Response
  toWorkoutSessionResponse,
  toWorkoutSetResponse,
  toWorkoutSessionsResponse,
  toWorkoutSetsResponse,
  toWorkoutStatsResponse,
  toPaginatedWorkoutSessionsResponse,
  toLastSetsForExercisesResponse
};
