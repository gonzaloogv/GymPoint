/**
 * UserRoutine Service - Refactored with CQRS Pattern (Lote 7)
 * Handles UserRoutine and UserImportedRoutine operations
 */

const sequelize = require('../config/database');
const { NotFoundError, ValidationError, BusinessError } = require('../utils/errors');
const { SUBSCRIPTION_TYPES } = require('../config/constants');

const userRoutineRepository = require('../infra/db/repositories/user-routine.repository');
const routineRepository = require('../infra/db/repositories/routine.repository');

// Ensure functions for flexible parameter acceptance
const ensureQuery = (input) => input;
const ensureCommand = (input) => input;

// ==================== Query Operations (Read) ====================

/**
 * Get the active routine for a user
 */
const getActiveUserRoutine = async (query) => {
  const q = typeof query === 'object' && query.idUser ? query : { idUser: query };

  return userRoutineRepository.findActiveUserRoutine(q.idUser);
};

/**
 * Get active routine with full exercise details
 */
const getActiveRoutineWithExercises = async (query) => {
  const q = typeof query === 'object' && query.idUser ? query : { idUser: query };

  const userRoutine = await userRoutineRepository.findActiveRoutineWithExercises(q.idUser);

  if (!userRoutine) {
    throw new NotFoundError('El usuario no tiene una rutina activa');
  }

  // Sort exercises by exercise_order (DB field name, not 'order')
  // Check both 'Exercises' (from DB association) and 'exercises' (fallback)
  const exercises = userRoutine.routine?.Exercises || userRoutine.routine?.exercises;
  if (exercises) {
    exercises.sort((a, b) => {
      const orderA = a.RoutineExercise?.exercise_order || 0;
      const orderB = b.RoutineExercise?.exercise_order || 0;
      return orderA - orderB;
    });
    // Ensure exercises are accessible in both forms
    if (!userRoutine.routine.exercises) {
      userRoutine.routine.exercises = exercises;
    }
  }

  // Return just the routine for backward compatibility
  return userRoutine.routine;
};

/**
 * List user routines with optional filtering
 */
const listUserRoutines = async (query) => {
  const q = ensureQuery(query);

  const offset = q.page && q.limit ? (q.page - 1) * q.limit : 0;

  return userRoutineRepository.findUserRoutinesByUser(q.idUser, {
    active: q.active,
    pagination: q.limit ? { limit: q.limit, offset } : undefined,
    includeRoutine: true
  });
};

/**
 * Get a specific user routine by ID
 */
const getUserRoutineById = async (query) => {
  const q = typeof query === 'object' && query.idUserRoutine ? query : { idUserRoutine: query };

  const userRoutine = await userRoutineRepository.findUserRoutineById(q.idUserRoutine, {
    includeRoutine: true
  });

  if (!userRoutine) {
    throw new NotFoundError('UserRoutine');
  }

  return userRoutine;
};

/**
 * Get routine counts for a user (created, imported, total)
 */
const getUserRoutineCounts = async (query) => {
  const q = typeof query === 'object' && query.idUserProfile ? query : { idUserProfile: query };

  return userRoutineRepository.getUserRoutineCounts(q.idUserProfile);
};

// ==================== Command Operations (Write) ====================

/**
 * Assign a routine to a user
 */
const assignRoutineToUser = async (command) => {
  const cmd = ensureCommand(command);

  // Check if routine exists
  const routine = await routineRepository.findRoutineById(cmd.idRoutine);
  if (!routine) {
    throw new NotFoundError('Rutina');
  }

  // Check if user already has an active routine
  const existing = await userRoutineRepository.findActiveUserRoutine(cmd.idUser);
  if (existing) {
    throw new ValidationError('El usuario ya tiene una rutina activa');
  }

  return userRoutineRepository.createUserRoutine({
    id_user_profile: cmd.idUser,
    id_routine: cmd.idRoutine,
    started_at: cmd.startDate || new Date(),
    is_active: true
  });
};

/**
 * End the active routine for a user
 */
const endUserRoutine = async (command) => {
  const cmd = typeof command === 'object' && command.idUser ? command : { idUser: command };

  const routine = await userRoutineRepository.findActiveUserRoutine(cmd.idUser);
  if (!routine) {
    throw new NotFoundError('No hay rutina activa para cerrar');
  }

  return userRoutineRepository.deactivateActiveRoutineForUser(cmd.idUser);
};

/**
 * Import a template routine (creates a copy for the user)
 */
const importRoutine = async (command) => {
  const cmd = ensureCommand(command);

  return sequelize.transaction(async (transaction) => {
    // Verify template routine exists
    const templateRoutine = await routineRepository.findRoutineById(cmd.idTemplateRoutine, { transaction });
    if (!templateRoutine) {
      throw new NotFoundError('Rutina plantilla');
    }

    if (!templateRoutine.is_template) {
      throw new ValidationError('La rutina especificada no es una plantilla');
    }

    // Check subscription limits
    const { totalOwned } = await userRoutineRepository.getUserRoutineCounts(cmd.idUserProfile, { transaction });

    // Get user profile to check subscription
    const { UserProfile } = require('../models');
    const profile = await UserProfile.findByPk(cmd.idUserProfile, {
      attributes: ['subscription'],
      transaction
    });
    const subscription = profile?.subscription || SUBSCRIPTION_TYPES.FREE;

    if (subscription === SUBSCRIPTION_TYPES.FREE && totalOwned >= 5) {
      throw new BusinessError(
        'Límite total de rutinas para usuario FREE (máx 5 entre creadas e importadas)',
        'LIMIT_EXCEEDED'
      );
    } else if (subscription === SUBSCRIPTION_TYPES.PREMIUM && totalOwned >= 20) {
      throw new BusinessError('Límite total de rutinas para usuario PREMIUM (máx 20)', 'LIMIT_EXCEEDED');
    }

    // Get full routine with exercises and days
    const fullRoutine = await routineRepository.findRoutineWithExercises(cmd.idTemplateRoutine, { transaction });

    // Create new routine for the user
    const newRoutine = await routineRepository.createRoutine({
      routine_name: fullRoutine.routine_name,
      description: fullRoutine.description,
      created_by: cmd.idUserProfile,
      is_template: false
    }, { transaction });

    // Copy days if they exist
    const dayMap = new Map();
    if (fullRoutine.days && fullRoutine.days.length > 0) {
      for (const day of fullRoutine.days) {
        const newDay = await routineRepository.createRoutineDay({
          id_routine: newRoutine.id_routine,
          day_number: day.day_number,
          title: day.title,
          description: day.description
        }, { transaction });

        dayMap.set(day.id_routine_day, newDay.id_routine_day);
      }
    }

    // Copy exercises
    if (fullRoutine.exercises && fullRoutine.exercises.length > 0) {
      for (const exercise of fullRoutine.exercises) {
        const originalDayId = exercise.RoutineExercise?.id_routine_day;
        const newDayId = originalDayId ? dayMap.get(originalDayId) : null;

        await routineRepository.createRoutineExercise({
          id_routine: newRoutine.id_routine,
          id_exercise: exercise.id_exercise,
          series: exercise.RoutineExercise?.series,
          reps: exercise.RoutineExercise?.reps,
          order: exercise.RoutineExercise?.order,
          id_routine_day: newDayId || null
        }, { transaction });
      }
    }

    // Record the import
    await userRoutineRepository.createUserImportedRoutine({
      id_user_profile: cmd.idUserProfile,
      id_template_routine: cmd.idTemplateRoutine,
      id_created_routine: newRoutine.id_routine,
      imported_at: new Date()
    }, { transaction });

    return newRoutine;
  });
};

/**
 * Deactivate a specific user routine
 */
const deactivateUserRoutine = async (command) => {
  const cmd = typeof command === 'object' && command.idUserRoutine ? command : { idUserRoutine: command };

  const userRoutine = await userRoutineRepository.findUserRoutineById(cmd.idUserRoutine);
  if (!userRoutine) {
    throw new NotFoundError('UserRoutine');
  }

  return userRoutineRepository.deactivateUserRoutine(cmd.idUserRoutine);
};

// ==================== Legacy Aliases ====================

/**
 * Legacy alias for getActiveUserRoutine
 */
const getActiveRoutine = async (id_user) => {
  return getActiveUserRoutine({ idUser: id_user });
};

module.exports = {
  // Query operations
  getActiveUserRoutine,
  getActiveRoutineWithExercises,
  listUserRoutines,
  getUserRoutineById,
  getUserRoutineCounts,

  // Command operations
  assignRoutineToUser,
  endUserRoutine,
  importRoutine,
  deactivateUserRoutine,

  // Legacy aliases
  getActiveRoutine
};
