/**
 * Workout Service - Refactored with CQRS Pattern (Lote 7)
 * Handles WorkoutSession and WorkoutSet operations
 */

const sequelize = require('../config/database');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');
const { TOKENS, TOKEN_REASONS } = require('../config/constants');

const workoutRepository = require('../infra/db/repositories/workout.repository');
const routineRepository = require('../infra/db/repositories/routine.repository');
const exerciseRepository = require('../infra/db/repositories/exercise.repository');

const tokenLedgerService = require('./token-ledger-service');
const achievementService = require('./achievement-service');
const { processUnlockResults } = require('./achievement-side-effects');

// Ensure functions for flexible parameter acceptance
const ensureQuery = (input) => input;
const ensureCommand = (input) => input;

// ==================== Helper Functions ====================

const WORKOUT_ACHIEVEMENT_CATEGORIES = ['ROUTINE', 'PROGRESS', 'TOKEN'];

/**
 * Sync workout-related achievements for a user
 */
const syncWorkoutAchievements = async (idUserProfile) => {
  try {
    const results = await achievementService.syncAllAchievementsForUser(idUserProfile, {
      categories: WORKOUT_ACHIEVEMENT_CATEGORIES
    });
    await processUnlockResults(idUserProfile, results);
  } catch (error) {
    console.error('[workout-service] Error sincronizando logros', error);
  }
};

/**
 * Validate routine exists
 */
const ensureRoutineExists = async (idRoutine, transaction) => {
  if (!idRoutine) return;
  const routine = await routineRepository.findRoutineById(idRoutine, { transaction });
  if (!routine) throw new NotFoundError('Rutina');
};

/**
 * Validate routine day exists and belongs to routine
 */
const ensureRoutineDayExists = async (idRoutineDay, idRoutine, transaction) => {
  if (!idRoutineDay) return;
  const day = await routineRepository.findRoutineDayById(idRoutineDay, { transaction });
  if (!day) throw new NotFoundError('Día de rutina');
  if (idRoutine && day.id_routine !== idRoutine) {
    throw new ValidationError('El día seleccionado no pertenece a la rutina');
  }
};

/**
 * Validate exercise exists
 */
const ensureExerciseExists = async (idExercise, transaction) => {
  const exercise = await exerciseRepository.findById(idExercise, { transaction });
  if (!exercise) throw new NotFoundError('Ejercicio');
};

// ==================== Query Operations (Read) ====================

/**
 * Get a workout session by ID
 */
const getWorkoutSession = async (query) => {
  const q = typeof query === 'object' && query.idWorkoutSession ? query : { idWorkoutSession: query };

  const session = await workoutRepository.findWorkoutSessionById(q.idWorkoutSession, {
    includeSets: q.includeSets,
    includeRoutine: true,
    includeRoutineDay: true,
    includeSetsExercises: q.includeSets
  });

  if (!session) {
    throw new NotFoundError('Sesión de entrenamiento');
  }

  return session;
};

/**
 * Get workout session with all sets
 */
const getWorkoutSessionWithSets = async (query) => {
  const q = typeof query === 'object' && query.idWorkoutSession ? query : { idWorkoutSession: query };

  const session = await workoutRepository.findWorkoutSessionById(q.idWorkoutSession, {
    includeSets: true,
    includeSetsExercises: true,
    includeRoutine: true,
    includeRoutineDay: true
  });

  if (!session) {
    throw new NotFoundError('Sesión de entrenamiento');
  }

  return session;
};

/**
 * Get the active workout session for a user
 */
const getActiveWorkoutSession = async (query) => {
  const q = typeof query === 'object' && query.idUserProfile ? query : { idUserProfile: query };

  return workoutRepository.findActiveWorkoutSession(q.idUserProfile);
};

/**
 * List workout sessions with optional filters
 */
const listWorkoutSessions = async (query) => {
  const q = ensureQuery(query);

  const offset = q.page && q.limit ? (q.page - 1) * q.limit : 0;

  return workoutRepository.findWorkoutSessions({
    idUserProfile: q.idUserProfile,
    status: q.status,
    startDate: q.startDate,
    endDate: q.endDate
  }, {
    pagination: q.limit ? { limit: q.limit, offset } : undefined,
    includeRoutine: true
  });
};

/**
 * Get a workout set by ID
 */
const getWorkoutSet = async (query) => {
  const q = typeof query === 'object' && query.idWorkoutSet ? query : { idWorkoutSet: query };

  const workoutSet = await workoutRepository.findWorkoutSetById(q.idWorkoutSet, {
    includeExercise: true
  });

  if (!workoutSet) {
    throw new NotFoundError('Serie de entrenamiento');
  }

  return workoutSet;
};

/**
 * List workout sets for a session
 */
const listWorkoutSets = async (query) => {
  const q = ensureQuery(query);

  return workoutRepository.findWorkoutSetsBySession(q.idWorkoutSession, {
    idExercise: q.idExercise,
    includeExercise: true
  });
};

/**
 * Get workout statistics for a user
 */
const getWorkoutStats = async (query) => {
  const q = ensureQuery(query);

  return workoutRepository.getWorkoutStats(q.idUserProfile, {
    startDate: q.startDate,
    endDate: q.endDate
  });
};

// ==================== Command Operations (Write) ====================

/**
 * Start a new workout session
 */
const startWorkoutSession = async (command) => {
  const cmd = ensureCommand(command);

  if (!cmd.idUserProfile) {
    throw new ValidationError('idUserProfile es requerido');
  }

  // Check if user already has an active session
  const existing = await workoutRepository.findActiveWorkoutSession(cmd.idUserProfile);
  if (existing) {
    throw new ConflictError('Ya tienes una sesión en progreso');
  }

  return sequelize.transaction(async (transaction) => {
    // Validate routine and day if provided
    await ensureRoutineExists(cmd.idRoutine, transaction);
    await ensureRoutineDayExists(cmd.idRoutineDay, cmd.idRoutine, transaction);

    const session = await workoutRepository.createWorkoutSession({
      id_user_profile: cmd.idUserProfile,
      id_routine: cmd.idRoutine || null,
      id_routine_day: cmd.idRoutineDay || null,
      status: 'IN_PROGRESS',
      started_at: cmd.startedAt || new Date(),
      notes: cmd.notes || null,
      total_sets: 0,
      total_reps: 0,
      total_weight: 0
    }, { transaction });

    return session;
  });
};

/**
 * Register a new set in a workout session
 */
const registerWorkoutSet = async (command) => {
  const cmd = ensureCommand(command);

  if (!cmd.idExercise) {
    throw new ValidationError('idExercise es requerido');
  }

  return sequelize.transaction(async (transaction) => {
    // Get session with lock
    const session = await workoutRepository.findWorkoutSessionById(cmd.idWorkoutSession, { transaction });
    if (!session) throw new NotFoundError('Sesión de entrenamiento');
    if (session.status !== 'IN_PROGRESS') {
      throw new ValidationError('Solo se pueden registrar sets en una sesión en progreso');
    }

    // Validate exercise exists
    await ensureExerciseExists(cmd.idExercise, transaction);

    // Get next set number
    const nextSetNumber = await workoutRepository.getNextSetNumber(cmd.idWorkoutSession, { transaction });

    // Create workout set
    const workoutSet = await workoutRepository.createWorkoutSet({
      id_workout_session: cmd.idWorkoutSession,
      id_exercise: cmd.idExercise,
      set_number: nextSetNumber,
      weight: cmd.weight || null,
      reps: cmd.reps || null,
      rpe: cmd.rpe || null,
      rest_seconds: cmd.restSeconds || null,
      is_warmup: !!cmd.isWarmup,
      notes: cmd.notes || null,
      performed_at: cmd.performedAt || new Date()
    }, { transaction });

    // Update session totals incrementally
    const deltaSets = 1;
    const deltaReps = cmd.reps ? Number(cmd.reps) : 0;
    const deltaWeight = cmd.weight && cmd.reps ? Number(cmd.weight) * Number(cmd.reps) : 0;

    await workoutRepository.updateWorkoutSession(cmd.idWorkoutSession, {
      total_sets: session.total_sets + deltaSets,
      total_reps: session.total_reps + deltaReps,
      total_weight: Number(session.total_weight) + deltaWeight
    }, { transaction });

    return workoutSet;
  });
};

/**
 * Update an existing workout set
 */
const updateWorkoutSet = async (command) => {
  const cmd = ensureCommand(command);

  return sequelize.transaction(async (transaction) => {
    const workoutSet = await workoutRepository.findWorkoutSetById(cmd.idWorkoutSet, { transaction });
    if (!workoutSet) throw new NotFoundError('Serie de entrenamiento');

    // Update the set
    const updated = await workoutRepository.updateWorkoutSet(cmd.idWorkoutSet, {
      weight: cmd.weight !== undefined ? cmd.weight : workoutSet.weight,
      reps: cmd.reps !== undefined ? cmd.reps : workoutSet.reps,
      rpe: cmd.rpe !== undefined ? cmd.rpe : workoutSet.rpe,
      rest_seconds: cmd.restSeconds !== undefined ? cmd.restSeconds : workoutSet.rest_seconds,
      is_warmup: cmd.isWarmup !== undefined ? cmd.isWarmup : workoutSet.is_warmup,
      notes: cmd.notes !== undefined ? cmd.notes : workoutSet.notes
    }, { transaction });

    // Recalculate session totals
    const totals = await workoutRepository.recalculateSessionTotals(workoutSet.id_workout_session, { transaction });
    await workoutRepository.updateWorkoutSession(workoutSet.id_workout_session, totals, { transaction });

    return updated;
  });
};

/**
 * Delete a workout set
 */
const deleteWorkoutSet = async (command) => {
  const cmd = typeof command === 'object' && command.idWorkoutSet ? command : { idWorkoutSet: command };

  return sequelize.transaction(async (transaction) => {
    const workoutSet = await workoutRepository.findWorkoutSetById(cmd.idWorkoutSet, { transaction });
    if (!workoutSet) throw new NotFoundError('Serie de entrenamiento');

    const sessionId = workoutSet.id_workout_session;

    // Delete the set
    await workoutRepository.deleteWorkoutSet(cmd.idWorkoutSet, { transaction });

    // Recalculate session totals
    const totals = await workoutRepository.recalculateSessionTotals(sessionId, { transaction });
    await workoutRepository.updateWorkoutSession(sessionId, totals, { transaction });

    return true;
  });
};

/**
 * Finish a workout session (awards tokens and syncs achievements)
 */
const finishWorkoutSession = async (command) => {
  const cmd = ensureCommand(command);

  const session = await sequelize.transaction(async (transaction) => {
    const workout = await workoutRepository.findWorkoutSessionById(cmd.idWorkoutSession, { transaction });
    if (!workout) throw new NotFoundError('Sesión de entrenamiento');
    if (workout.status !== 'IN_PROGRESS') {
      throw new ValidationError('La sesión no está en progreso');
    }

    // Recalculate totals before finishing
    const totals = await workoutRepository.recalculateSessionTotals(cmd.idWorkoutSession, { transaction });

    // Calculate duration
    const finishedAt = cmd.finishedAt || new Date();
    const durationSeconds = workout.started_at
      ? Math.floor((new Date(finishedAt) - new Date(workout.started_at)) / 1000)
      : null;

    // Update session
    const updated = await workoutRepository.updateWorkoutSession(cmd.idWorkoutSession, {
      ...totals,
      status: 'COMPLETED',
      finished_at: finishedAt,
      duration_seconds: durationSeconds,
      notes: cmd.notes !== undefined ? cmd.notes : workout.notes
    }, { transaction });

    // Award tokens
    if (TOKENS.WORKOUT_SESSION > 0) {
      await tokenLedgerService.registrarMovimiento({
        userId: workout.id_user_profile,
        delta: TOKENS.WORKOUT_SESSION,
        reason: TOKEN_REASONS.WORKOUT_COMPLETED,
        refType: 'workout_session',
        refId: workout.id_workout_session,
        transaction
      });
    }

    return updated;
  });

  // Sync achievements asynchronously
  try {
    await syncWorkoutAchievements(session.id_user_profile);
  } catch (error) {
    console.error('[workout-service] Error post-completar sesión', error);
  }

  return session;
};

/**
 * Cancel a workout session
 */
const cancelWorkoutSession = async (command) => {
  const cmd = typeof command === 'object' && command.idWorkoutSession ? command : { idWorkoutSession: command };

  const session = await getWorkoutSession({ idWorkoutSession: cmd.idWorkoutSession });
  if (session.status !== 'IN_PROGRESS') {
    throw new ValidationError('Solo se pueden cancelar sesiones activas');
  }

  return workoutRepository.updateWorkoutSession(cmd.idWorkoutSession, {
    status: 'CANCELLED',
    finished_at: new Date(),
    notes: cmd.reason || session.notes
  });
};

/**
 * Update workout session metadata
 */
const updateWorkoutSession = async (command) => {
  const cmd = ensureCommand(command);

  const session = await workoutRepository.findWorkoutSessionById(cmd.idWorkoutSession);
  if (!session) throw new NotFoundError('Sesión de entrenamiento');

  return workoutRepository.updateWorkoutSession(cmd.idWorkoutSession, {
    notes: cmd.notes !== undefined ? cmd.notes : session.notes
  });
};

// ==================== Legacy Aliases ====================

/**
 * Legacy alias for startWorkoutSession
 */
const iniciarSesion = async (data) => {
  return startWorkoutSession({
    idUserProfile: data.id_user_profile,
    idRoutine: data.id_routine,
    idRoutineDay: data.id_routine_day,
    startedAt: data.started_at,
    notes: data.notes
  });
};

/**
 * Legacy alias for getWorkoutSession
 */
const obtenerSesion = async (id_workout_session) => {
  return getWorkoutSession({ idWorkoutSession: id_workout_session });
};

/**
 * Legacy alias for registerWorkoutSet
 */
const registrarSet = async (id_workout_session, data) => {
  return registerWorkoutSet({
    idWorkoutSession: id_workout_session,
    idExercise: data.id_exercise,
    weight: data.weight,
    reps: data.reps,
    rpe: data.rpe,
    restSeconds: data.rest_seconds,
    isWarmup: data.is_warmup,
    notes: data.notes,
    performedAt: data.performed_at
  });
};

/**
 * Legacy alias for finishWorkoutSession
 */
const completarSesion = async (id_workout_session, data) => {
  return finishWorkoutSession({
    idWorkoutSession: id_workout_session,
    finishedAt: data.ended_at,
    notes: data.notes
  });
};

/**
 * Legacy alias for cancelWorkoutSession
 */
const cancelarSesion = async (id_workout_session, { reason = null } = {}) => {
  return cancelWorkoutSession({
    idWorkoutSession: id_workout_session,
    reason
  });
};

/**
 * Legacy alias for listWorkoutSessions
 */
const obtenerSesionesPorUsuario = async (id_user_profile, { status, limit = 20, offset = 0 } = {}) => {
  return listWorkoutSessions({
    idUserProfile: id_user_profile,
    status,
    limit,
    page: offset > 0 ? Math.floor(offset / limit) + 1 : 1
  });
};

module.exports = {
  // Query operations
  getWorkoutSession,
  getWorkoutSessionWithSets,
  getActiveWorkoutSession,
  listWorkoutSessions,
  getWorkoutSet,
  listWorkoutSets,
  getWorkoutStats,

  // Command operations
  startWorkoutSession,
  registerWorkoutSet,
  updateWorkoutSet,
  deleteWorkoutSet,
  finishWorkoutSession,
  cancelWorkoutSession,
  updateWorkoutSession,

  // Legacy aliases
  iniciarSesion,
  obtenerSesion,
  registrarSet,
  completarSesion,
  cancelarSesion,
  obtenerSesionesPorUsuario
};
