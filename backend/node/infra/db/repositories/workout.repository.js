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
      attributes: ['id_routine_day', 'day_number', 'title']
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
    transaction: options.transaction
  });

  return toWorkoutSession(session);
}

async function findWorkoutSessions(filters = {}, options = {}) {
  const where = {};

  if (filters.idUserProfile) where.id_user_profile = filters.idUserProfile;
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
    finished_at: finishedAt
  }, { transaction: options.transaction });

  return toWorkoutSession(session);
}

async function cancelWorkoutSession(idWorkoutSession, options = {}) {
  const session = await WorkoutSession.findByPk(idWorkoutSession, { transaction: options.transaction });
  if (!session) throw new Error('WorkoutSession not found');

  await session.update({
    status: 'CANCELLED',
    finished_at: new Date()
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
      [sequelize.fn('SUM', sequelize.literal('COALESCE(weight,0) * COALESCE(reps,0)')), 'total_weight']
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
    where.finished_at = {
      [Op.between]: [filters.startDate, filters.endDate]
    };
  } else if (filters.startDate) {
    where.finished_at = {
      [Op.gte]: filters.startDate
    };
  } else if (filters.endDate) {
    where.finished_at = {
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

  // Stats
  getWorkoutStats
};
