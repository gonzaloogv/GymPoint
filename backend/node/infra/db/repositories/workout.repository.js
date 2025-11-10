/**
 * Workout Repository - Lote 7
 * Data access layer for WorkoutSession and WorkoutSet with explicit projections
 */

const WorkoutSession = require('../../../models/WorkoutSession');
const WorkoutSet = require('../../../models/WorkoutSet');
const Routine = require('../../../models/Routine');
const RoutineDay = require('../../../models/RoutineDay');
const Exercise = require('../../../models/Exercise');
const { toWorkoutSession, toWorkoutSessions, toWorkoutSet, toWorkoutSets } = require('../mappers/workout.mapper');
const { Op } = require('sequelize');
const { getArgentinaTime, getStartOfDayArgentina, getEndOfDayArgentina } = require('../../../utils/timezone');

// ==================== WorkoutSession Operations ====================

async function createWorkoutSession(payload, options = {}) {
  const session = await WorkoutSession.create(payload, { transaction: options.transaction });
  return toWorkoutSession(session);
}

async function findWorkoutSessionById(idWorkoutSession, options = {}) {
  const includeOptions = [];

  if (options.includeRoutine) {
    includeOptions.push({
      model: Routine,
      as: 'routine',
      attributes: ['id_routine', 'routine_name']
    });
  }

  if (options.includeRoutineDay) {
    includeOptions.push({
      model: RoutineDay,
      as: 'routineDay',
      attributes: ['id_routine_day', 'day_number', 'day_name']
    });
  }

  if (options.includeSets) {
    includeOptions.push({
      model: WorkoutSet,
      as: 'sets',
      include: options.includeSetsExercises ? [
        {
          model: Exercise,
          as: 'exercise',
          attributes: ['id_exercise', 'exercise_name', 'muscular_group']
        }
      ] : undefined,
      order: [['set_number', 'ASC']]
    });
  }

  const session = await WorkoutSession.findByPk(idWorkoutSession, {
    include: includeOptions.length > 0 ? includeOptions : undefined,
    transaction: options.transaction
  });

  return toWorkoutSession(session);
}

async function findActiveWorkoutSession(idUserProfile, options = {}) {
  const session = await WorkoutSession.findOne({
    where: {
      id_user_profile: idUserProfile,
      status: 'IN_PROGRESS'
    },
    include: [
      {
        model: Routine,
        as: 'routine',
        required: false, // LEFT JOIN - allows null if routine deleted
        attributes: ['id_routine', 'routine_name']
      }
    ],
    transaction: options.transaction
  });

  // Auto-cleanup: If session exists but routine is deleted, cancel the session
  if (session && session.id_routine && !session.routine) {
    console.log('[WorkoutRepository] Auto-canceling orphaned session - routine deleted:', {
      sessionId: session.id_workout_session,
      routineId: session.id_routine,
      userId: idUserProfile
    });

    await WorkoutSession.update(
      {
        status: 'CANCELED',
        ended_at: getArgentinaTime()
      },
      {
        where: { id_workout_session: session.id_workout_session },
        transaction: options.transaction
      }
    );

    return null; // No active session after auto-cleanup
  }

  return toWorkoutSession(session);
}

async function findWorkoutSessions(filters = {}, options = {}) {
  const where = {};

  if (filters.idUserProfile) where.id_user_profile = filters.idUserProfile;
  if (filters.idRoutine) where.id_routine = filters.idRoutine;
  if (filters.status) where.status = filters.status;

  if (filters.startDate && filters.endDate) {
    where.started_at = {
      [Op.between]: [filters.startDate, filters.endDate]
    };
  } else if (filters.startDate) {
    where.started_at = {
      [Op.gte]: filters.startDate
    };
  } else if (filters.endDate) {
    where.started_at = {
      [Op.lte]: filters.endDate
    };
  }

  const queryOptions = {
    where,
    transaction: options.transaction
  };

  if (options.pagination) {
    queryOptions.limit = options.pagination.limit;
    queryOptions.offset = options.pagination.offset;
  }

  queryOptions.order = [['started_at', 'DESC']];

  if (options.includeRoutine) {
    queryOptions.include = [
      {
        model: Routine,
        as: 'routine',
        attributes: ['id_routine', 'routine_name']
      }
    ];
  }

  const sessions = await WorkoutSession.findAll(queryOptions);
  return toWorkoutSessions(sessions);
}

async function findWorkoutSessionsWithCount(filters = {}, options = {}) {
  const where = {};

  if (filters.idUserProfile) where.id_user_profile = filters.idUserProfile;
  if (filters.idRoutine) where.id_routine = filters.idRoutine;
  if (filters.status) where.status = filters.status;

  if (filters.startDate && filters.endDate) {
    where.started_at = {
      [Op.between]: [filters.startDate, filters.endDate]
    };
  } else if (filters.startDate) {
    where.started_at = {
      [Op.gte]: filters.startDate
    };
  } else if (filters.endDate) {
    where.started_at = {
      [Op.lte]: filters.endDate
    };
  }

  const queryOptions = {
    where,
    limit: options.pagination?.limit || 20,
    offset: options.pagination?.offset || 0,
    order: [['started_at', 'DESC']],
    transaction: options.transaction
  };

  const { rows, count } = await WorkoutSession.findAndCountAll(queryOptions);
  return { rows: toWorkoutSessions(rows), count };
}

async function updateWorkoutSession(idWorkoutSession, payload, options = {}) {
  const session = await WorkoutSession.findByPk(idWorkoutSession, { transaction: options.transaction });
  if (!session) throw new Error('WorkoutSession not found');

  await session.update(payload, { transaction: options.transaction });
  return toWorkoutSession(session);
}

async function finishWorkoutSession(idWorkoutSession, finishedAt, options = {}) {
  const session = await WorkoutSession.findByPk(idWorkoutSession, { transaction: options.transaction });
  if (!session) throw new Error('WorkoutSession not found');

  await session.update({
    status: 'COMPLETED',
    ended_at: finishedAt
  }, { transaction: options.transaction });

  return toWorkoutSession(session);
}

async function cancelWorkoutSession(idWorkoutSession, options = {}) {
  const session = await WorkoutSession.findByPk(idWorkoutSession, { transaction: options.transaction });
  if (!session) throw new Error('WorkoutSession not found');

  await session.update({
    status: 'CANCELLED',
    ended_at: new Date()
  }, { transaction: options.transaction });

  return toWorkoutSession(session);
}

// ==================== WorkoutSet Operations ====================

async function createWorkoutSet(payload, options = {}) {
  const workoutSet = await WorkoutSet.create(payload, { transaction: options.transaction });
  return toWorkoutSet(workoutSet);
}

async function findWorkoutSetById(idWorkoutSet, options = {}) {
  const includeOptions = [];

  if (options.includeExercise) {
    includeOptions.push({
      model: Exercise,
      as: 'exercise',
      attributes: ['id_exercise', 'exercise_name', 'muscular_group']
    });
  }

  const workoutSet = await WorkoutSet.findByPk(idWorkoutSet, {
    include: includeOptions.length > 0 ? includeOptions : undefined,
    transaction: options.transaction
  });

  return toWorkoutSet(workoutSet);
}

async function findWorkoutSetsBySession(idWorkoutSession, options = {}) {
  const where = { id_workout_session: idWorkoutSession };

  if (options.idExercise) {
    where.id_exercise = options.idExercise;
  }

  const queryOptions = {
    where,
    order: [['set_number', 'ASC']],
    transaction: options.transaction
  };

  if (options.includeExercise) {
    queryOptions.include = [
      {
        model: Exercise,
        as: 'exercise',
        attributes: ['id_exercise', 'exercise_name', 'muscular_group']
      }
    ];
  }

  const sets = await WorkoutSet.findAll(queryOptions);
  return toWorkoutSets(sets);
}

async function getNextSetNumber(idWorkoutSession, options = {}) {
  const lastSet = await WorkoutSet.findOne({
    where: { id_workout_session: idWorkoutSession },
    attributes: ['set_number'],
    order: [['set_number', 'DESC']],
    limit: 1,
    transaction: options.transaction
  });

  return lastSet ? lastSet.set_number + 1 : 1;
}

async function updateWorkoutSet(idWorkoutSet, payload, options = {}) {
  const workoutSet = await WorkoutSet.findByPk(idWorkoutSet, { transaction: options.transaction });
  if (!workoutSet) throw new Error('WorkoutSet not found');

  await workoutSet.update(payload, { transaction: options.transaction });
  return toWorkoutSet(workoutSet);
}

async function deleteWorkoutSet(idWorkoutSet, options = {}) {
  const workoutSet = await WorkoutSet.findByPk(idWorkoutSet, { transaction: options.transaction });
  if (!workoutSet) throw new Error('WorkoutSet not found');

  await workoutSet.destroy({ transaction: options.transaction });
  return true;
}

async function recalculateSessionTotals(idWorkoutSession, options = {}) {
  const sequelize = WorkoutSet.sequelize;

  const aggregates = await WorkoutSet.findAll({
    where: { id_workout_session: idWorkoutSession },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id_workout_set')), 'total_sets'],
      [sequelize.fn('SUM', sequelize.col('reps')), 'total_reps'],
      [sequelize.fn('SUM', sequelize.literal('COALESCE(weight_kg,0) * COALESCE(reps,0)')), 'total_weight']
    ],
    raw: true,
    transaction: options.transaction
  });

  const totals = aggregates[0] || {};

  return {
    total_sets: parseInt(totals.total_sets || 0, 10),
    total_reps: parseInt(totals.total_reps || 0, 10),
    total_weight: parseFloat(totals.total_weight || 0)
  };
}

// ==================== Stats Operations ====================

async function getWorkoutStats(idUserProfile, filters = {}, options = {}) {
  const where = { id_user_profile: idUserProfile, status: 'COMPLETED' };

  if (filters.startDate && filters.endDate) {
    where.ended_at = {
      [Op.between]: [filters.startDate, filters.endDate]
    };
  } else if (filters.startDate) {
    where.ended_at = {
      [Op.gte]: filters.startDate
    };
  } else if (filters.endDate) {
    where.ended_at = {
      [Op.lte]: filters.endDate
    };
  }

  const sequelize = WorkoutSession.sequelize;

  const stats = await WorkoutSession.findOne({
    where,
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id_workout_session')), 'total_workouts'],
      [sequelize.fn('SUM', sequelize.col('total_sets')), 'total_sets'],
      [sequelize.fn('SUM', sequelize.col('total_reps')), 'total_reps'],
      [sequelize.fn('SUM', sequelize.col('total_weight')), 'total_weight']
    ],
    raw: true,
    transaction: options.transaction
  });

  return {
    total_workouts: parseInt(stats?.total_workouts || 0, 10),
    total_sets: parseInt(stats?.total_sets || 0, 10),
    total_reps: parseInt(stats?.total_reps || 0, 10),
    total_weight: parseFloat(stats?.total_weight || 0)
  };
}

/**
 * Check if user has already completed a workout session today
 * (Used to prevent token farming by limiting rewards to 1 per day)
 * @param {number} idUserProfile - User profile ID
 * @param {object} options - Options object
 * @param {object} options.transaction - Transaction object
 * @param {number} options.excludeSessionId - Session ID to exclude from check (usually the current session)
 * @returns {boolean} - True if user already completed a session today
 */
async function hasCompletedWorkoutToday(idUserProfile, options = {}) {
  // Use Argentina timezone (UTC-3) for day boundaries
  const argentinaTime = getArgentinaTime();
  const today = getStartOfDayArgentina();
  const endOfDay = getEndOfDayArgentina();

  console.log('[hasCompletedWorkoutToday] 🔍 Checking for completed workouts (Argentina UTC-3):', {
    userId: idUserProfile,
    currentTimeARG: argentinaTime.toISOString(),
    rangeStart: today.toISOString(),
    rangeEnd: endOfDay.toISOString(),
    excludeSessionId: options.excludeSessionId
  });

  const where = {
    id_user_profile: idUserProfile,
    status: 'COMPLETED',
    ended_at: {
      [Op.between]: [today, endOfDay]
    }
  };

  // Exclude current session if provided
  if (options.excludeSessionId) {
    where.id_workout_session = {
      [Op.ne]: options.excludeSessionId
    };
  }

  const completedSession = await WorkoutSession.findOne({
    where,
    transaction: options.transaction
  });

  const hasCompleted = !!completedSession;
  console.log(`[hasCompletedWorkoutToday] ${hasCompleted ? '✅' : '❌'} Result: ${hasCompleted ? 'Already completed today' : 'No completion today'}`);

  return hasCompleted;
}

/**
 * Get last sets for specific exercises from user's completed workouts
 * @param {number} idUserProfile - User profile ID
 * @param {number[]} exerciseIds - Array of exercise IDs
 * @param {object} options - Options object
 * @returns {Promise<Array>} Array of last sets per exercise
 */
async function findLastSetsForExercises(idUserProfile, exerciseIds, options = {}) {
  if (!exerciseIds || exerciseIds.length === 0) {
    return [];
  }

  const sequelize = WorkoutSet.sequelize;

  // Para cada ejercicio, buscar el último set en sesiones completadas
  const lastSets = await Promise.all(
    exerciseIds.map(async (idExercise) => {
      const lastSet = await WorkoutSet.findOne({
        include: [
          {
            model: WorkoutSession,
            as: 'session',
            where: {
              id_user_profile: idUserProfile,
              status: 'COMPLETED'
            },
            attributes: []
          }
        ],
        where: {
          id_exercise: idExercise
        },
        attributes: ['id_exercise', 'weight_kg', 'reps', 'created_at'],
        order: [[sequelize.col('session.ended_at'), 'DESC'], ['created_at', 'DESC']],
        limit: 1,
        raw: true,
        transaction: options.transaction
      });

      return {
        id_exercise: idExercise,
        last_weight: lastSet ? parseFloat(lastSet.weight_kg) : 0,
        last_reps: lastSet ? parseInt(lastSet.reps, 10) : 0,
        has_history: !!lastSet
      };
    })
  );

  return lastSets;
}

module.exports = {
  // WorkoutSession
  createWorkoutSession,
  findWorkoutSessionById,
  findActiveWorkoutSession,
  findWorkoutSessions,
  findWorkoutSessionsWithCount,
  updateWorkoutSession,
  finishWorkoutSession,
  cancelWorkoutSession,

  // WorkoutSet
  createWorkoutSet,
  findWorkoutSetById,
  findWorkoutSetsBySession,
  getNextSetNumber,
  updateWorkoutSet,
  deleteWorkoutSet,
  recalculateSessionTotals,
  findLastSetsForExercises,

  // Stats
  getWorkoutStats,
  hasCompletedWorkoutToday
};
