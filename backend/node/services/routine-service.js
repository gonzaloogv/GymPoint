/**
 * Routine Service - Refactored with CQRS Pattern (Lote 7)
 * Handles Routine, RoutineDay, and RoutineExercise operations
 */

const sequelize = require('../config/database');
const WorkoutSession = require('../models/WorkoutSession');
const { NotFoundError, ValidationError, BusinessError } = require('../utils/errors');
const { SUBSCRIPTION_TYPES } = require('../config/constants');
const { UserProfile } = require('../models');

const routineRepository = require('../infra/db/repositories/routine.repository');
const userRoutineRepository = require('../infra/db/repositories/user-routine.repository');

// Ensure functions for flexible parameter acceptance
const ensureQuery = (input) => input;
const ensureCommand = (input) => input;

// ==================== Query Operations (Read) ====================

/**
 * Get routine with full details including exercises and days
 */
const getRoutineWithExercises = async (query) => {
  const q = typeof query === 'object' && query.idRoutine ? query : { idRoutine: query };

  const routine = await routineRepository.findRoutineWithExercises(q.idRoutine);

  if (!routine) {
    throw new NotFoundError('Rutina');
  }

  // Sort exercises and days as in original implementation
  const result = { ...routine };

  if (result.exercises) {
    result.exercises.sort((a, b) => (a.RoutineExercise?.order || 0) - (b.RoutineExercise?.order || 0));
  }

  if (result.days) {
    result.days = result.days
      .sort((a, b) => a.day_number - b.day_number)
      .map((day) => ({
        ...day,
        routineExercises: (day.routineExercises || [])
          .sort((a, b) => a.order - b.order)
          .map((re) => ({
            id_routine: re.id_routine,
            id_exercise: re.id_exercise,
            id_routine_day: re.id_routine_day,
            series: re.series,
            reps: re.reps,
            order: re.order,
            exercise: re.exercise
          }))
      }));
  }

  return result;
};

/**
 * Get routine by ID with optional includes
 */
const getRoutineById = async (query) => {
  const q = typeof query === 'object' && query.idRoutine ? query : { idRoutine: query };

  const routine = await routineRepository.findRoutineById(q.idRoutine, {
    includeCreator: q.includeCreator,
    includeDays: q.includeDays,
    includeExercises: q.includeExercises
  });

  if (!routine) {
    throw new NotFoundError('Rutina');
  }

  return routine;
};

/**
 * List routines by user with pagination
 */
const listRoutinesByUser = async (query) => {
  const q = ensureQuery(query);

  const offset = q.page && q.limit ? (q.page - 1) * q.limit : 0;

  return routineRepository.findRoutinesByUser(q.idUser, {
    isTemplate: q.isTemplate,
    pagination: q.limit ? { limit: q.limit, offset } : undefined
  });
};

/**
 * List routine days for a specific routine
 */
const listRoutineDays = async (query) => {
  const q = typeof query === 'object' && query.idRoutine ? query : { idRoutine: query };

  // Verify routine exists
  const routine = await routineRepository.findRoutineById(q.idRoutine);
  if (!routine) {
    throw new NotFoundError('Rutina');
  }

  return routineRepository.findRoutineDaysByRoutine(q.idRoutine);
};

/**
 * Get routine day by ID
 */
const getRoutineDayById = async (query) => {
  const q = typeof query === 'object' && query.idRoutineDay ? query : { idRoutineDay: query };

  const day = await routineRepository.findRoutineDayById(q.idRoutineDay);

  if (!day) {
    throw new NotFoundError('Día de rutina');
  }

  return day;
};

/**
 * List routine templates with pagination
 */
const listRoutineTemplates = async (query = {}) => {
  const q = ensureQuery(query);

  const offset = q.page && q.limit ? (q.page - 1) * q.limit : 0;

  return routineRepository.findRoutineTemplates({
    pagination: { limit: q.limit || 20, offset },
    sort: { field: q.sortBy || 'routine_name', order: q.order || 'ASC' }
  });
};

/**
 * Get exercises for a routine, optionally filtered by day
 */
const getRoutineExercises = async (query) => {
  const q = ensureQuery(query);

  return routineRepository.findRoutineExercisesByRoutine(q.idRoutine, {
    idRoutineDay: q.idRoutineDay
  });
};

// ==================== Command Operations (Write) ====================

/**
 * Create a simple routine
 */
const createRoutine = async (command) => {
  const cmd = ensureCommand(command);

  return routineRepository.createRoutine({
    routine_name: cmd.routineName,
    description: cmd.description,
    created_by: cmd.createdBy,
    is_template: cmd.isTemplate || false
  });
};

/**
 * Create routine with exercises and optional days (with subscription limits)
 */
const createRoutineWithExercises = async (command) => {
  const cmd = ensureCommand(command);

  if (!Array.isArray(cmd.exercises) || cmd.exercises.length === 0) {
    throw new ValidationError('Debe incluir al menos un ejercicio en la rutina');
  }

  // Check subscription limits
  const profile = await UserProfile.findByPk(cmd.idUser, { attributes: ['subscription'] });
  const subscription = profile?.subscription || SUBSCRIPTION_TYPES.FREE;
  const { totalOwned } = await userRoutineRepository.getUserRoutineCounts(cmd.idUser);

  if (subscription === SUBSCRIPTION_TYPES.FREE) {
    if (totalOwned >= 5) {
      throw new BusinessError(
        'Límite total de rutinas para usuario FREE (máx 5 entre creadas e importadas)',
        'LIMIT_EXCEEDED'
      );
    }
  } else if (subscription === SUBSCRIPTION_TYPES.PREMIUM) {
    if (totalOwned >= 20) {
      throw new BusinessError('Límite total de rutinas para usuario PREMIUM (máx 20)', 'LIMIT_EXCEEDED');
    }
  }

  return sequelize.transaction(async (transaction) => {
    // Create routine
    const routine = await routineRepository.createRoutine({
      routine_name: cmd.routineName,
      description: cmd.description,
      created_by: cmd.idUser
    }, { transaction });

    const dayMap = new Map();

    // Create days if provided
    if (Array.isArray(cmd.days) && cmd.days.length > 0) {
      for (const day of cmd.days) {
        if (typeof day.day_number !== 'number') {
          throw new ValidationError('Cada día debe especificar day_number');
        }

        const routineDay = await routineRepository.createRoutineDay({
          id_routine: routine.id_routine,
          day_number: day.day_number,
          title: day.title || null,
          description: day.description || null
        }, { transaction });

        dayMap.set(day.day_number, routineDay.id_routine_day);
      }
    }

    // Create routine exercises
    for (const ex of cmd.exercises) {
      await routineRepository.createRoutineExercise({
        id_routine: routine.id_routine,
        id_exercise: ex.id_exercise,
        series: ex.series,
        reps: ex.reps,
        order: ex.order,
        id_routine_day: typeof ex.day_number === 'number'
          ? (dayMap.get(ex.day_number) || null)
          : null
      }, { transaction });
    }

    return routine;
  });
};

/**
 * Update routine basic information
 */
const updateRoutine = async (command) => {
  const cmd = ensureCommand(command);

  const routine = await routineRepository.findRoutineById(cmd.idRoutine);
  if (!routine) {
    throw new NotFoundError('Rutina');
  }

  return routineRepository.updateRoutine(cmd.idRoutine, {
    routine_name: cmd.routineName,
    description: cmd.description
  });
};

/**
 * Delete a routine
 */
const deleteRoutine = async (command) => {
  const cmd = typeof command === 'object' && command.idRoutine ? command : { idRoutine: command };

  const routine = await routineRepository.findRoutineById(cmd.idRoutine);
  if (!routine) {
    throw new NotFoundError('Rutina');
  }

  return routineRepository.deleteRoutine(cmd.idRoutine);
};

/**
 * Add exercise to routine
 */
const addExerciseToRoutine = async (command) => {
  const cmd = ensureCommand(command);

  // Verify routine exists
  const routine = await routineRepository.findRoutineById(cmd.idRoutine);
  if (!routine) {
    throw new NotFoundError('Rutina');
  }

  return routineRepository.createRoutineExercise({
    id_routine: cmd.idRoutine,
    id_exercise: cmd.idExercise,
    series: cmd.series,
    reps: cmd.reps,
    order: cmd.order,
    id_routine_day: cmd.idRoutineDay || null
  });
};

/**
 * Update exercise in routine
 */
const updateRoutineExercise = async (command) => {
  const cmd = ensureCommand(command);

  const existing = await routineRepository.findRoutineExercise(cmd.idRoutine, cmd.idExercise);
  if (!existing) {
    throw new NotFoundError('Ejercicio en la rutina');
  }

  return routineRepository.updateRoutineExercise(cmd.idRoutine, cmd.idExercise, {
    series: cmd.series,
    reps: cmd.reps,
    order: cmd.order,
    id_routine_day: cmd.idRoutineDay
  });
};

/**
 * Delete exercise from routine
 */
const deleteRoutineExercise = async (command) => {
  const cmd = ensureCommand(command);

  const deleted = await routineRepository.deleteRoutineExercise(cmd.idRoutine, cmd.idExercise);

  if (!deleted) {
    throw new NotFoundError('Ejercicio en la rutina');
  }

  return deleted;
};

/**
 * Create a new routine day
 */
const createRoutineDay = async (command) => {
  const cmd = ensureCommand(command);

  // Verify routine exists
  const routine = await routineRepository.findRoutineById(cmd.idRoutine);
  if (!routine) {
    throw new NotFoundError('Rutina');
  }

  if (typeof cmd.dayNumber !== 'number') {
    throw new ValidationError('day_number es requerido');
  }

  // Check if day number already exists
  const existing = await routineRepository.findRoutineDayByRoutineAndNumber(cmd.idRoutine, cmd.dayNumber);
  if (existing) {
    throw new ValidationError('Ese número de día ya existe en la rutina');
  }

  return routineRepository.createRoutineDay({
    id_routine: cmd.idRoutine,
    day_number: cmd.dayNumber,
    title: cmd.title || null,
    description: cmd.description || null
  });
};

/**
 * Update routine day
 */
const updateRoutineDay = async (command) => {
  const cmd = ensureCommand(command);

  const day = await routineRepository.findRoutineDayById(cmd.idRoutineDay);
  if (!day) {
    throw new NotFoundError('Día de rutina');
  }

  // If changing day number, verify it doesn't conflict
  if (cmd.dayNumber && cmd.dayNumber !== day.day_number) {
    const existing = await routineRepository.findRoutineDayByRoutineAndNumber(day.id_routine, cmd.dayNumber);
    if (existing && existing.id_routine_day !== cmd.idRoutineDay) {
      throw new ValidationError('Ese número de día ya existe');
    }
  }

  return routineRepository.updateRoutineDay(cmd.idRoutineDay, {
    day_number: cmd.dayNumber ?? day.day_number,
    title: cmd.title ?? day.title,
    description: cmd.description ?? day.description
  });
};

/**
 * Delete routine day (with active session check)
 */
const deleteRoutineDay = async (command) => {
  const cmd = typeof command === 'object' && command.idRoutineDay ? command : { idRoutineDay: command };

  const day = await routineRepository.findRoutineDayById(cmd.idRoutineDay);
  if (!day) {
    throw new NotFoundError('Día de rutina');
  }

  // Check for active workout sessions
  const activeSessions = await WorkoutSession.count({
    where: {
      id_routine_day: cmd.idRoutineDay,
      status: 'IN_PROGRESS'
    }
  });

  if (activeSessions > 0) {
    throw new ValidationError('No se puede eliminar un día con sesiones activas');
  }

  await routineRepository.deleteRoutineDay(cmd.idRoutineDay);
  return true;
};

// ==================== Legacy Aliases ====================

/**
 * Legacy alias for getRoutinesByUser
 */
const getRoutinesByUser = async (id_user) => {
  return listRoutinesByUser({ idUser: id_user });
};

/**
 * Legacy alias for listRoutineDays
 */
const listarRoutineDays = async (id_routine) => {
  return listRoutineDays({ idRoutine: id_routine });
};

/**
 * Legacy alias for updateRoutineDay
 */
const actualizarRoutineDay = async (id_routine_day, data) => {
  return updateRoutineDay({
    idRoutineDay: id_routine_day,
    dayNumber: data.day_number,
    title: data.title,
    description: data.description
  });
};

/**
 * Legacy alias for deleteRoutineDay
 */
const eliminarRoutineDay = async (id_routine_day) => {
  return deleteRoutineDay({ idRoutineDay: id_routine_day });
};

module.exports = {
  // Query operations
  getRoutineWithExercises,
  getRoutineById,
  listRoutinesByUser,
  listRoutineDays,
  getRoutineDayById,
  listRoutineTemplates,
  getRoutineExercises,

  // Command operations
  createRoutine,
  createRoutineWithExercises,
  updateRoutine,
  deleteRoutine,
  addExerciseToRoutine,
  updateRoutineExercise,
  deleteRoutineExercise,
  createRoutineDay,
  updateRoutineDay,
  deleteRoutineDay,

  // Legacy aliases
  getRoutinesByUser,
  listarRoutineDays,
  actualizarRoutineDay,
  eliminarRoutineDay
};
