/**
 * Mappers para Exercise (Lote 7)
 * Transformaciones entre DTOs, Commands/Queries y Entidades
 */

const {
  CreateExerciseCommand,
  UpdateExerciseCommand,
  DeleteExerciseCommand
} = require('../commands/exercise.commands');

const {
  GetAllExercisesQuery,
  ListExercisesQuery,
  GetExerciseByIdQuery
} = require('../queries/exercise.queries');

// ==================== RequestDTO → Command/Query ====================

function toCreateExerciseCommand(dto) {
  return new CreateExerciseCommand({
    exerciseName: dto.exercise_name || dto.exerciseName,
    muscularGroup: dto.muscular_group || dto.muscularGroup || null,
    description: dto.description || null,
    equipmentNeeded: dto.equipment_needed || dto.equipmentNeeded || null,
    difficulty: dto.difficulty || null,
    instructions: dto.instructions || null,
    videoUrl: dto.video_url || dto.videoUrl || null,
    createdBy: dto.created_by || dto.createdBy || null
  });
}

function toUpdateExerciseCommand(dto, idExercise) {
  return new UpdateExerciseCommand({
    idExercise,
    exerciseName: dto.exercise_name || dto.exerciseName,
    muscularGroup: dto.muscular_group || dto.muscularGroup,
    description: dto.description,
    equipmentNeeded: dto.equipment_needed || dto.equipmentNeeded,
    difficulty: dto.difficulty,
    instructions: dto.instructions,
    videoUrl: dto.video_url || dto.videoUrl
  });
}

function toDeleteExerciseCommand(idExercise) {
  return new DeleteExerciseCommand({ idExercise });
}

function toGetAllExercisesQuery(dto = {}) {
  return new GetAllExercisesQuery({
    muscularGroup: dto.muscular_group || dto.muscularGroup || null,
    difficulty: dto.difficulty || null,
    equipmentNeeded: dto.equipment_needed || dto.equipmentNeeded || null,
    limit: dto.limit ? parseInt(dto.limit, 10) : null,
    offset: dto.offset ? parseInt(dto.offset, 10) : null,
    sortBy: dto.sort_by || dto.sortBy || 'exercise_name',
    order: dto.order || 'ASC'
  });
}

function toListExercisesQuery(dto = {}) {
  return new ListExercisesQuery({
    muscularGroup: dto.muscular_group || dto.muscularGroup || null,
    difficulty: dto.difficulty || null,
    equipmentNeeded: dto.equipment_needed || dto.equipmentNeeded || null,
    page: dto.page ? parseInt(dto.page, 10) : 1,
    limit: dto.limit ? parseInt(dto.limit, 10) : 20,
    sortBy: dto.sort_by || dto.sortBy || 'exercise_name',
    order: dto.order || 'ASC'
  });
}

function toGetExerciseByIdQuery(idExercise) {
  return new GetExerciseByIdQuery({ idExercise });
}

// ==================== Entity → ResponseDTO ====================

function toExerciseResponse(exercise) {
  if (!exercise) return null;

  return {
    id_exercise: exercise.id_exercise || exercise.idExercise,
    exercise_name: exercise.exercise_name || exercise.exerciseName,
    muscular_group: exercise.muscular_group || exercise.muscularGroup || null,
    description: exercise.description || null,
    equipment_needed: exercise.equipment_needed || exercise.equipmentNeeded || null,
    difficulty: exercise.difficulty || null,
    instructions: exercise.instructions || null,
    video_url: exercise.video_url || exercise.videoUrl || null,
    created_by: exercise.created_by || exercise.createdBy || null,
    created_at: exercise.created_at || exercise.createdAt,
    updated_at: exercise.updated_at || exercise.updatedAt
  };
}

function toExercisesResponse(exercises) {
  if (!exercises || !Array.isArray(exercises)) return [];
  return exercises.map((exercise) => toExerciseResponse(exercise));
}

function toPaginatedExercisesResponse({ rows, count, page, limit }) {
  return {
    items: toExercisesResponse(rows),
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit)
  };
}

module.exports = {
  // Request → Command/Query
  toCreateExerciseCommand,
  toUpdateExerciseCommand,
  toDeleteExerciseCommand,
  toGetAllExercisesQuery,
  toListExercisesQuery,
  toGetExerciseByIdQuery,

  // Entity → Response
  toExerciseResponse,
  toExercisesResponse,
  toPaginatedExercisesResponse
};
