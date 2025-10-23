/**
 * Mappers para Routine (Lote 7)
 * Transformaciones entre DTOs, Commands/Queries y Entidades
 */

const {
  CreateRoutineCommand,
  CreateRoutineWithExercisesCommand,
  UpdateRoutineCommand,
  DeleteRoutineCommand,
  AddExerciseToRoutineCommand,
  UpdateRoutineExerciseCommand,
  DeleteRoutineExerciseCommand,
  CreateRoutineDayCommand,
  UpdateRoutineDayCommand,
  DeleteRoutineDayCommand
} = require('../commands/routine.commands');

const {
  GetRoutineWithExercisesQuery,
  GetRoutineByIdQuery,
  ListRoutinesByUserQuery,
  ListRoutineDaysQuery,
  GetRoutineDayByIdQuery,
  ListRoutineTemplatesQuery,
  GetRoutineExercisesQuery
} = require('../queries/routine.queries');

// ==================== RequestDTO → Command/Query ====================

function toCreateRoutineCommand(dto) {
  return new CreateRoutineCommand({
    routineName: dto.routine_name || dto.routineName,
    description: dto.description || null,
    createdBy: dto.created_by || dto.createdBy,
    isTemplate: dto.is_template ?? dto.isTemplate ?? false
  });
}

function toCreateRoutineWithExercisesCommand(dto, idUser) {
  return new CreateRoutineWithExercisesCommand({
    routineName: dto.routine_name || dto.routineName,
    description: dto.description || null,
    exercises: dto.exercises || [], // [{ id_exercise, series, reps, order, day_number }]
    idUser: idUser || dto.id_user || dto.idUser,
    days: dto.days || [] // [{ day_number, title, description }]
  });
}

function toUpdateRoutineCommand(dto, idRoutine) {
  return new UpdateRoutineCommand({
    idRoutine,
    routineName: dto.routine_name || dto.routineName,
    description: dto.description
  });
}

function toDeleteRoutineCommand(idRoutine) {
  return new DeleteRoutineCommand({ idRoutine });
}

function toAddExerciseToRoutineCommand(dto, idRoutine) {
  return new AddExerciseToRoutineCommand({
    idRoutine,
    idExercise: dto.id_exercise || dto.idExercise,
    series: dto.series,
    reps: dto.reps,
    order: dto.order,
    idRoutineDay: dto.id_routine_day || dto.idRoutineDay || null
  });
}

function toUpdateRoutineExerciseCommand(dto, idRoutine, idExercise) {
  return new UpdateRoutineExerciseCommand({
    idRoutine,
    idExercise,
    series: dto.series,
    reps: dto.reps,
    order: dto.order,
    idRoutineDay: dto.id_routine_day || dto.idRoutineDay
  });
}

function toDeleteRoutineExerciseCommand(idRoutine, idExercise) {
  return new DeleteRoutineExerciseCommand({ idRoutine, idExercise });
}

function toCreateRoutineDayCommand(dto, idRoutine) {
  return new CreateRoutineDayCommand({
    idRoutine,
    dayNumber: dto.day_number || dto.dayNumber,
    title: dto.title || null,
    description: dto.description || null
  });
}

function toUpdateRoutineDayCommand(dto, idRoutineDay) {
  return new UpdateRoutineDayCommand({
    idRoutineDay,
    dayNumber: dto.day_number || dto.dayNumber,
    title: dto.title,
    description: dto.description
  });
}

function toDeleteRoutineDayCommand(idRoutineDay) {
  return new DeleteRoutineDayCommand({ idRoutineDay });
}

function toGetRoutineWithExercisesQuery(idRoutine) {
  return new GetRoutineWithExercisesQuery({ idRoutine });
}

function toGetRoutineByIdQuery(idRoutine, options = {}) {
  return new GetRoutineByIdQuery({
    idRoutine,
    includeCreator: options.includeCreator,
    includeDays: options.includeDays,
    includeExercises: options.includeExercises
  });
}

function toListRoutinesByUserQuery(dto, idUser) {
  return new ListRoutinesByUserQuery({
    idUser: idUser || dto.id_user || dto.idUser,
    isTemplate: dto.is_template ?? dto.isTemplate ?? false,
    page: dto.page ? parseInt(dto.page, 10) : 1,
    limit: dto.limit ? parseInt(dto.limit, 10) : 20
  });
}

function toListRoutineDaysQuery(idRoutine) {
  return new ListRoutineDaysQuery({ idRoutine });
}

function toGetRoutineDayByIdQuery(idRoutineDay) {
  return new GetRoutineDayByIdQuery({ idRoutineDay });
}

function toListRoutineTemplatesQuery(dto = {}) {
  return new ListRoutineTemplatesQuery({
    page: dto.page ? parseInt(dto.page, 10) : 1,
    limit: dto.limit ? parseInt(dto.limit, 10) : 20,
    sortBy: dto.sort_by || dto.sortBy || 'routine_name',
    order: dto.order || 'ASC'
  });
}

function toGetRoutineExercisesQuery(idRoutine, idRoutineDay = null) {
  return new GetRoutineExercisesQuery({
    idRoutine,
    idRoutineDay
  });
}

// ==================== Entity → ResponseDTO ====================

function toRoutineResponse(routine) {
  if (!routine) return null;

  const response = {
    id_routine: routine.id_routine || routine.idRoutine,
    routine_name: routine.routine_name || routine.routineName,
    description: routine.description || null,
    created_by: routine.created_by || routine.createdBy,
    is_template: routine.is_template ?? routine.isTemplate ?? false,
    created_at: routine.created_at || routine.createdAt,
    updated_at: routine.updated_at || routine.updatedAt
  };

  // Include creator if available
  if (routine.creator) {
    response.creator = {
      id_user_profile: routine.creator.id_user_profile,
      name: routine.creator.name,
      lastname: routine.creator.lastname
    };
  }

  // Include days if available
  if (routine.days) {
    response.days = routine.days.map((day) => toRoutineDayResponse(day));
  }

  // Include exercises if available
  if (routine.exercises) {
    response.exercises = routine.exercises.map((exercise) => toRoutineExerciseInListResponse(exercise));
  }

  return response;
}

function toRoutineDayResponse(day) {
  if (!day) return null;

  const response = {
    id_routine_day: day.id_routine_day || day.idRoutineDay,
    id_routine: day.id_routine || day.idRoutine,
    day_number: day.day_number || day.dayNumber,
    title: day.title || null,
    description: day.description || null,
    created_at: day.created_at || day.createdAt,
    updated_at: day.updated_at || day.updatedAt
  };

  // Include routine exercises for this day if available
  if (day.routineExercises) {
    response.exercises = day.routineExercises.map((re) => ({
      id_routine: re.id_routine || re.idRoutine,
      id_exercise: re.id_exercise || re.idExercise,
      id_routine_day: re.id_routine_day || re.idRoutineDay,
      series: re.series,
      reps: re.reps,
      order: re.order,
      exercise: re.exercise ? {
        id_exercise: re.exercise.id_exercise,
        exercise_name: re.exercise.exercise_name,
        category: re.exercise.category
      } : null
    }));
  }

  return response;
}

function toRoutineExerciseResponse(routineExercise) {
  if (!routineExercise) return null;

  return {
    id_routine: routineExercise.id_routine || routineExercise.idRoutine,
    id_exercise: routineExercise.id_exercise || routineExercise.idExercise,
    id_routine_day: routineExercise.id_routine_day || routineExercise.idRoutineDay || null,
    series: routineExercise.series,
    reps: routineExercise.reps,
    order: routineExercise.order,
    created_at: routineExercise.created_at || routineExercise.createdAt,
    updated_at: routineExercise.updated_at || routineExercise.updatedAt
  };
}

function toRoutineExerciseInListResponse(exercise) {
  if (!exercise) return null;

  const response = {
    id_exercise: exercise.id_exercise || exercise.idExercise,
    exercise_name: exercise.exercise_name || exercise.exerciseName,
    muscular_group: exercise.muscular_group || exercise.muscularGroup || null,
    category: exercise.category || null
  };

  // Include RoutineExercise through data if available
  if (exercise.RoutineExercise) {
    response.series = exercise.RoutineExercise.series;
    response.reps = exercise.RoutineExercise.reps;
    response.order = exercise.RoutineExercise.order;
    response.id_routine_day = exercise.RoutineExercise.id_routine_day || null;
  }

  return response;
}

function toRoutinesResponse(routines) {
  if (!routines || !Array.isArray(routines)) return [];
  return routines.map((routine) => toRoutineResponse(routine));
}

function toRoutineDaysResponse(days) {
  if (!days || !Array.isArray(days)) return [];
  return days.map((day) => toRoutineDayResponse(day));
}

function toRoutineExercisesResponse(exercises) {
  if (!exercises || !Array.isArray(exercises)) return [];
  return exercises.map((exercise) => toRoutineExerciseResponse(exercise));
}

function toPaginatedRoutinesResponse({ rows, count, page, limit }) {
  return {
    items: toRoutinesResponse(rows),
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit)
  };
}

module.exports = {
  // Request → Command/Query
  toCreateRoutineCommand,
  toCreateRoutineWithExercisesCommand,
  toUpdateRoutineCommand,
  toDeleteRoutineCommand,
  toAddExerciseToRoutineCommand,
  toUpdateRoutineExerciseCommand,
  toDeleteRoutineExerciseCommand,
  toCreateRoutineDayCommand,
  toUpdateRoutineDayCommand,
  toDeleteRoutineDayCommand,
  toGetRoutineWithExercisesQuery,
  toGetRoutineByIdQuery,
  toListRoutinesByUserQuery,
  toListRoutineDaysQuery,
  toGetRoutineDayByIdQuery,
  toListRoutineTemplatesQuery,
  toGetRoutineExercisesQuery,

  // Entity → Response
  toRoutineResponse,
  toRoutineDayResponse,
  toRoutineExerciseResponse,
  toRoutineExerciseInListResponse,
  toRoutinesResponse,
  toRoutineDaysResponse,
  toRoutineExercisesResponse,
  toPaginatedRoutinesResponse
};
