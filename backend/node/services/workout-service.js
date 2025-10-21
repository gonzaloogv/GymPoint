const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { TOKENS, TOKEN_REASONS } = require('../config/constants');
const WorkoutSession = require('../models/WorkoutSession');
const WorkoutSet = require('../models/WorkoutSet');
const Routine = require('../models/Routine');
const RoutineDay = require('../models/RoutineDay');
const Exercise = require('../models/Exercise');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');
const tokenLedgerService = require('./token-ledger-service');
const achievementService = require('./achievement-service');
const { processUnlockResults } = require('./achievement-side-effects');

const WORKOUT_ACHIEVEMENT_CATEGORIES = ['ROUTINE', 'PROGRESS', 'TOKEN'];

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

const ensureRoutineExists = async (id_routine, transaction) => {
  if (!id_routine) return;
  const routine = await Routine.findByPk(id_routine, { transaction, attributes: ['id_routine'] });
  if (!routine) throw new NotFoundError('Rutina');
};

const ensureRoutineDayExists = async (id_routine_day, id_routine, transaction) => {
  if (!id_routine_day) return;
  const day = await RoutineDay.findByPk(id_routine_day, { transaction, attributes: ['id_routine', 'id_routine_day'] });
  if (!day) throw new NotFoundError('Día de rutina');
  if (id_routine && day.id_routine !== id_routine) {
    throw new ValidationError('El día seleccionado no pertenece a la rutina');
  }
};

const ensureExerciseExists = async (id_exercise, transaction) => {
  const exercise = await Exercise.findByPk(id_exercise, { transaction, attributes: ['id_exercise'] });
  if (!exercise) throw new NotFoundError('Ejercicio');
};

const iniciarSesion = async ({ id_user_profile, id_routine = null, id_routine_day = null, started_at = new Date(), notes = null }) => {
  if (!id_user_profile) {
    throw new ValidationError('id_user_profile es requerido');
  }

  const existing = await WorkoutSession.findOne({
    where: {
      id_user_profile,
      status: 'IN_PROGRESS'
    }
  });

  if (existing) {
    throw new ConflictError('Ya tienes una sesión en progreso');
  }

  return sequelize.transaction(async (transaction) => {
    await ensureRoutineExists(id_routine, transaction);
    await ensureRoutineDayExists(id_routine_day, id_routine, transaction);

    const session = await WorkoutSession.create({
      id_user_profile,
      id_routine,
      id_routine_day,
      status: 'IN_PROGRESS',
      started_at,
      notes,
      total_sets: 0,
      total_reps: 0,
      total_weight: 0
    }, { transaction });

    return session;
  });
};

const obtenerSesion = async (id_workout_session) => {
  const session = await WorkoutSession.findByPk(id_workout_session);
  if (!session) throw new NotFoundError('Sesión de entrenamiento');
  return session;
};

const registrarSet = async (id_workout_session, { id_exercise, weight = null, reps = null, rpe = null, rest_seconds = null, is_warmup = false, notes = null, performed_at = new Date() }) => {
  if (!id_exercise) {
    throw new ValidationError('id_exercise es requerido');
  }

  return sequelize.transaction(async (transaction) => {
    const session = await WorkoutSession.findByPk(id_workout_session, { transaction, lock: transaction.LOCK.UPDATE });
    if (!session) throw new NotFoundError('Sesión de entrenamiento');
    if (session.status !== 'IN_PROGRESS') {
      throw new ValidationError('Solo se pueden registrar sets en una sesión en progreso');
    }

    await ensureExerciseExists(id_exercise, transaction);

    const existingSets = await WorkoutSet.findAll({
      where: { id_workout_session },
      attributes: ['set_number'],
      order: [['set_number', 'DESC']],
      limit: 1,
      transaction
    });

    const nextSetNumber = existingSets.length ? existingSets[0].set_number + 1 : 1;

    const workoutSet = await WorkoutSet.create({
      id_workout_session,
      id_exercise,
      set_number: nextSetNumber,
      weight,
      reps,
      rpe,
      rest_seconds,
      is_warmup: !!is_warmup,
      notes,
      performed_at
    }, { transaction });

    const deltaSets = 1;
    const deltaReps = reps ? Number(reps) : 0;
    const deltaWeight = weight && reps ? Number(weight) * Number(reps) : 0;

    session.total_sets += deltaSets;
    session.total_reps += deltaReps;
    session.total_weight = Number(session.total_weight) + deltaWeight;
    await session.save({ transaction });

    return workoutSet;
  });
};

const recalcularTotales = async (session, transaction) => {
  const aggregates = await WorkoutSet.findAll({
    where: { id_workout_session: session.id_workout_session },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id_workout_set')), 'total_sets'],
      [sequelize.fn('SUM', sequelize.col('reps')), 'total_reps'],
      [sequelize.fn('SUM', sequelize.literal('COALESCE(weight,0) * COALESCE(reps,0)')), 'total_weight']
    ],
    raw: true,
    transaction
  });

  const { total_sets = 0, total_reps = 0, total_weight = 0 } = aggregates[0] || {};

  session.total_sets = Number(total_sets) || 0;
  session.total_reps = Number(total_reps) || 0;
  session.total_weight = Number(total_weight) || 0;
  await session.save({ transaction });
};

const completarSesion = async (id_workout_session, { ended_at = new Date(), notes = null }) => {
  const session = await sequelize.transaction(async (transaction) => {
    const workout = await WorkoutSession.findByPk(id_workout_session, { transaction, lock: transaction.LOCK.UPDATE });
    if (!workout) throw new NotFoundError('Sesión de entrenamiento');
    if (workout.status !== 'IN_PROGRESS') {
      throw new ValidationError('La sesión no está en progreso');
    }

    await recalcularTotales(workout, transaction);

    workout.status = 'COMPLETED';
    workout.ended_at = ended_at;
    workout.duration_seconds = workout.started_at ? Math.floor((new Date(ended_at) - new Date(workout.started_at)) / 1000) : null;
    workout.notes = notes ?? workout.notes;
    await workout.save({ transaction });

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

    return workout;
  });

  try {
    await syncWorkoutAchievements(session.id_user_profile);
  } catch (error) {
    console.error('[workout-service] Error post-completar sesión', error);
  }

  return session;
};

const cancelarSesion = async (id_workout_session, { reason = null } = {}) => {
  const session = await obtenerSesion(id_workout_session);
  if (session.status !== 'IN_PROGRESS') {
    throw new ValidationError('Solo se pueden cancelar sesiones activas');
  }

  session.status = 'CANCELLED';
  session.notes = reason ?? session.notes;
  session.ended_at = new Date();
  return session.save();
};

const obtenerSesionesPorUsuario = async (id_user_profile, { status, limit = 20, offset = 0 } = {}) => {
  const where = { id_user_profile };
  if (status) {
    where.status = Array.isArray(status) ? { [Op.in]: status } : status;
  }

  return WorkoutSession.findAll({
    where,
    order: [['started_at', 'DESC']],
    limit,
    offset
  });
};

module.exports = {
  iniciarSesion,
  registrarSet,
  completarSesion,
  cancelarSesion,
  obtenerSesionesPorUsuario
};

