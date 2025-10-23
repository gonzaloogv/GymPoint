/**
 * Exercise Service - Refactorizado con Command/Query pattern
 * Gestión de ejercicios siguiendo arquitectura limpia
 */

const { exerciseRepository } = require('../infra/db/repositories');
const { NotFoundError } = require('../utils/errors');

// Ensure functions para aceptar Commands/Queries/plain objects
const ensureCommand = (input) => input;
const ensureQuery = (input) => input;

// ==================== Query Operations ====================

/**
 * Obtener todos los ejercicios
 * @param {GetAllExercisesQuery} query
 * @returns {Promise<Array>}
 */
const getAllExercises = async (query = {}) => {
  const q = ensureQuery(query);

  return exerciseRepository.findAll({
    filters: {
      muscularGroup: q.muscularGroup,
      difficulty: q.difficulty,
      equipmentNeeded: q.equipmentNeeded
    },
    pagination: {
      limit: q.limit,
      offset: q.offset
    },
    sort: {
      field: q.sortBy || 'exercise_name',
      order: q.order || 'ASC'
    }
  });
};

/**
 * Listar ejercicios con paginación
 * @param {ListExercisesQuery} query
 * @returns {Promise<Object>}
 */
const listExercises = async (query = {}) => {
  const q = ensureQuery(query);

  const page = q.page || 1;
  const limit = q.limit || 20;
  const offset = (page - 1) * limit;

  const { rows, count } = await exerciseRepository.findAllWithCount({
    filters: {
      muscularGroup: q.muscularGroup,
      difficulty: q.difficulty,
      equipmentNeeded: q.equipmentNeeded
    },
    pagination: {
      limit,
      offset
    },
    sort: {
      field: q.sortBy || 'exercise_name',
      order: q.order || 'ASC'
    }
  });

  return {
    items: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit)
  };
};

/**
 * Obtener ejercicio por ID
 * @param {GetExerciseByIdQuery|number} query
 * @returns {Promise<Object>}
 */
const getExerciseById = async (query) => {
  const q = typeof query === 'object' && query.idExercise ? query : { idExercise: query };

  const exercise = await exerciseRepository.findById(q.idExercise);

  if (!exercise) {
    throw new NotFoundError('Ejercicio');
  }

  return exercise;
};

// ==================== Command Operations ====================

/**
 * Crear un nuevo ejercicio
 * @param {CreateExerciseCommand} command
 * @returns {Promise<Object>}
 */
const createExercise = async (command) => {
  const cmd = ensureCommand(command);

  return exerciseRepository.create({
    exercise_name: cmd.exerciseName,
    muscular_group: cmd.muscularGroup,
    description: cmd.description,
    equipment_needed: cmd.equipmentNeeded,
    difficulty: cmd.difficulty,
    instructions: cmd.instructions,
    video_url: cmd.videoUrl,
    created_by: cmd.createdBy
  });
};

/**
 * Actualizar un ejercicio existente
 * @param {UpdateExerciseCommand} command
 * @returns {Promise<Object>}
 */
const updateExercise = async (command) => {
  const cmd = ensureCommand(command);

  const exercise = await exerciseRepository.findById(cmd.idExercise);
  if (!exercise) {
    throw new NotFoundError('Ejercicio');
  }

  const payload = {};
  if (cmd.exerciseName !== undefined) payload.exercise_name = cmd.exerciseName;
  if (cmd.muscularGroup !== undefined) payload.muscular_group = cmd.muscularGroup;
  if (cmd.description !== undefined) payload.description = cmd.description;
  if (cmd.equipmentNeeded !== undefined) payload.equipment_needed = cmd.equipmentNeeded;
  if (cmd.difficulty !== undefined) payload.difficulty = cmd.difficulty;
  if (cmd.instructions !== undefined) payload.instructions = cmd.instructions;
  if (cmd.videoUrl !== undefined) payload.video_url = cmd.videoUrl;

  return exerciseRepository.update(cmd.idExercise, payload);
};

/**
 * Eliminar un ejercicio
 * @param {DeleteExerciseCommand|number} command
 * @returns {Promise<boolean>}
 */
const deleteExercise = async (command) => {
  const cmd = typeof command === 'object' && command.idExercise ? command : { idExercise: command };

  const exercise = await exerciseRepository.findById(cmd.idExercise);
  if (!exercise) {
    throw new NotFoundError('Ejercicio');
  }

  return exerciseRepository.deleteById(cmd.idExercise);
};

module.exports = {
  // Query Operations
  getAllExercises,
  listExercises,
  getExerciseById,

  // Command Operations
  createExercise,
  updateExercise,
  deleteExercise
};
