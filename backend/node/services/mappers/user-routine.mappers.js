/**
 * Mappers para UserRoutine (Lote 7)
 * Transformaciones entre DTOs, Commands/Queries y Entidades
 */

const {
  AssignRoutineToUserCommand,
  EndUserRoutineCommand,
  ImportRoutineCommand,
  DeactivateUserRoutineCommand
} = require('../commands/user-routine.commands');

const {
  GetActiveUserRoutineQuery,
  GetActiveRoutineWithExercisesQuery,
  ListUserRoutinesQuery,
  GetUserRoutineByIdQuery,
  GetUserRoutineCountsQuery
} = require('../queries/user-routine.queries');

// ==================== RequestDTO → Command/Query ====================

function toAssignRoutineToUserCommand(dto, idUser) {
  return new AssignRoutineToUserCommand({
    idUser: idUser || dto.id_user || dto.idUser,
    idRoutine: dto.id_routine || dto.idRoutine,
    startDate: dto.start_date || dto.startDate || new Date()
  });
}

function toEndUserRoutineCommand(idUser, finishDate = null) {
  return new EndUserRoutineCommand({
    idUser,
    finishDate: finishDate || new Date()
  });
}

function toImportRoutineCommand(dto, idUserProfile) {
  return new ImportRoutineCommand({
    idUserProfile: idUserProfile || dto.id_user_profile || dto.idUserProfile,
    idTemplateRoutine: dto.id_template_routine || dto.idTemplateRoutine
  });
}

function toDeactivateUserRoutineCommand(idUserRoutine) {
  return new DeactivateUserRoutineCommand({ idUserRoutine });
}

function toGetActiveUserRoutineQuery(idUser) {
  return new GetActiveUserRoutineQuery({ idUser });
}

function toGetActiveRoutineWithExercisesQuery(idUser) {
  return new GetActiveRoutineWithExercisesQuery({ idUser });
}

function toListUserRoutinesQuery(dto, idUser) {
  return new ListUserRoutinesQuery({
    idUser: idUser || dto.id_user || dto.idUser,
    active: dto.active !== undefined ? dto.active : null,
    page: dto.page ? parseInt(dto.page, 10) : 1,
    limit: dto.limit ? parseInt(dto.limit, 10) : 20
  });
}

function toGetUserRoutineByIdQuery(idUserRoutine) {
  return new GetUserRoutineByIdQuery({ idUserRoutine });
}

function toGetUserRoutineCountsQuery(idUserProfile) {
  return new GetUserRoutineCountsQuery({ idUserProfile });
}

// ==================== Entity → ResponseDTO ====================

function toUserRoutineResponse(userRoutine) {
  if (!userRoutine) return null;

  // Map DB fields (new) to API fields (old) for backwards compatibility
  const response = {
    id_user_routine: userRoutine.id_user_routine || userRoutine.idUserRoutine,
    id_user: userRoutine.id_user_profile || userRoutine.idUserProfile, // DB: id_user_profile → API: id_user
    id_routine: userRoutine.id_routine || userRoutine.idRoutine,
    start_date: userRoutine.started_at || userRoutine.startedAt, // DB: started_at → API: start_date
    finish_date: userRoutine.completed_at || userRoutine.completedAt || null, // DB: completed_at → API: finish_date
    active: userRoutine.is_active ?? true, // DB: is_active → API: active
    created_at: userRoutine.created_at || userRoutine.createdAt,
    updated_at: userRoutine.updated_at || userRoutine.updatedAt
  };

  // Include routine if available
  if (userRoutine.routine) {
    response.routine = {
      id_routine: userRoutine.routine.id_routine,
      routine_name: userRoutine.routine.routine_name,
      description: userRoutine.routine.description || null
    };

    // Include exercises if available in routine (check both 'Exercises' and 'exercises')
    const exercises = userRoutine.routine.Exercises || userRoutine.routine.exercises;
    if (exercises) {
      response.routine.exercises = exercises.map((exercise) => ({
        id_exercise: exercise.id_exercise,
        exercise_name: exercise.exercise_name,
        muscular_group: exercise.muscular_group || null,
        series: exercise.RoutineExercise?.sets || null, // DB: sets → API: series
        reps: exercise.RoutineExercise?.reps || null,
        order: exercise.RoutineExercise?.exercise_order || null // DB: exercise_order → API: order
      }));
    }
  }

  return response;
}

function toUserRoutinesResponse(userRoutines) {
  if (!userRoutines || !Array.isArray(userRoutines)) return [];
  return userRoutines.map((ur) => toUserRoutineResponse(ur));
}

function toUserRoutineCountsResponse(counts) {
  if (!counts) return null;

  return {
    total_owned: counts.totalOwned || counts.total_owned || 0,
    imported_count: counts.importedCount || counts.imported_count || 0,
    created_count: counts.createdCount || counts.created_count || 0
  };
}

function toPaginatedUserRoutinesResponse({ items, page, limit, total }) {
  return {
    items: toUserRoutinesResponse(items),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
}

module.exports = {
  // Request → Command/Query
  toAssignRoutineToUserCommand,
  toEndUserRoutineCommand,
  toImportRoutineCommand,
  toDeactivateUserRoutineCommand,
  toGetActiveUserRoutineQuery,
  toGetActiveRoutineWithExercisesQuery,
  toListUserRoutinesQuery,
  toGetUserRoutineByIdQuery,
  toGetUserRoutineCountsQuery,

  // Entity → Response
  toUserRoutineResponse,
  toUserRoutinesResponse,
  toUserRoutineCountsResponse,
  toPaginatedUserRoutinesResponse
};
