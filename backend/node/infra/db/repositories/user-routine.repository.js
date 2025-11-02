/**
 * UserRoutine Repository - Lote 7
 * Data access layer for UserRoutine and UserImportedRoutine with explicit projections
 */

const UserRoutine = require('../../../models/UserRoutine');
const UserImportedRoutine = require('../../../models/UserImportedRoutine');
const Routine = require('../../../models/Routine');
const Exercise = require('../../../models/Exercise');
const { toUserRoutine, toUserRoutines, toUserImportedRoutine, toUserImportedRoutines } = require('../mappers/user-routine.mapper');
const { Op } = require('sequelize');

// ==================== UserRoutine Operations ====================

async function createUserRoutine(payload, options = {}) {
  const userRoutine = await UserRoutine.create(payload, { transaction: options.transaction });
  return toUserRoutine(userRoutine);
}

async function findUserRoutineById(idUserRoutine, options = {}) {
  const includeOptions = [];

  if (options.includeRoutine) {
    includeOptions.push({
      model: Routine,
      as: 'routine',
      attributes: ['id_routine', 'routine_name', 'description']
    });
  }

  const userRoutine = await UserRoutine.findByPk(idUserRoutine, {
    include: includeOptions.length > 0 ? includeOptions : undefined,
    transaction: options.transaction
  });

  return toUserRoutine(userRoutine);
}

async function findActiveUserRoutine(idUser, options = {}) {
  const userRoutine = await UserRoutine.findOne({
    where: { id_user_profile: idUser, is_active: true },
    transaction: options.transaction
  });

  return toUserRoutine(userRoutine);
}

async function findActiveRoutineWithExercises(idUser, options = {}) {
  const userRoutine = await UserRoutine.findOne({
    where: { id_user_profile: idUser, is_active: true },
    include: [
      {
        model: Routine,
        as: 'routine',
        include: {
          model: Exercise,
          as: 'Exercises', // Must match association alias in models/index.js
          through: {
            attributes: ['sets', 'reps', 'exercise_order'] // Correct column names from RoutineExercise model
          }
        }
      }
    ],
    transaction: options.transaction
  });

  return toUserRoutine(userRoutine);
}

async function findUserRoutinesByUser(idUser, options = {}) {
  const where = { id_user_profile: idUser };

  if (options.active !== undefined) {
    where.is_active = options.active;
  }

  const queryOptions = {
    where,
    transaction: options.transaction
  };

  if (options.pagination) {
    queryOptions.limit = options.pagination.limit;
    queryOptions.offset = options.pagination.offset;
  }

  if (options.includeRoutine) {
    queryOptions.include = [
      {
        model: Routine,
        as: 'routine',
        attributes: ['id_routine', 'routine_name', 'description']
      }
    ];
  }

  queryOptions.order = [['start_date', 'DESC']];

  const userRoutines = await UserRoutine.findAll(queryOptions);
  return toUserRoutines(userRoutines);
}

async function updateUserRoutine(idUserRoutine, payload, options = {}) {
  const userRoutine = await UserRoutine.findByPk(idUserRoutine, { transaction: options.transaction });
  if (!userRoutine) throw new Error('UserRoutine not found');

  await userRoutine.update(payload, { transaction: options.transaction });
  return toUserRoutine(userRoutine);
}

async function deactivateUserRoutine(idUserRoutine, options = {}) {
  const userRoutine = await UserRoutine.findByPk(idUserRoutine, { transaction: options.transaction });
  if (!userRoutine) throw new Error('UserRoutine not found');

  await userRoutine.update({
    is_active: false,
    completed_at: new Date()
  }, { transaction: options.transaction });

  return toUserRoutine(userRoutine);
}

async function deactivateActiveRoutineForUser(idUser, options = {}) {
  const userRoutine = await UserRoutine.findOne({
    where: { id_user_profile: idUser, is_active: true },
    transaction: options.transaction
  });

  if (!userRoutine) return null;

  await userRoutine.update({
    is_active: false,
    completed_at: new Date()
  }, { transaction: options.transaction });

  return toUserRoutine(userRoutine);
}

// ==================== UserImportedRoutine Operations ====================

async function createUserImportedRoutine(payload, options = {}) {
  const imported = await UserImportedRoutine.create(payload, { transaction: options.transaction });
  return toUserImportedRoutine(imported);
}

async function findUserImportedRoutineById(idUserImportedRoutine, options = {}) {
  const imported = await UserImportedRoutine.findByPk(idUserImportedRoutine, {
    transaction: options.transaction
  });
  return toUserImportedRoutine(imported);
}

async function findUserImportedRoutines(idUserProfile, options = {}) {
  const imported = await UserImportedRoutine.findAll({
    where: { id_user_profile: idUserProfile },
    order: [['imported_at', 'DESC']],
    transaction: options.transaction
  });
  return toUserImportedRoutines(imported);
}

async function countUserImportedRoutines(idUserProfile, options = {}) {
  return UserImportedRoutine.count({
    where: { id_user_profile: idUserProfile },
    transaction: options.transaction
  });
}

async function countUserCreatedRoutines(idUserProfile, options = {}) {
  const totalOwned = await Routine.count({
    where: { created_by: idUserProfile, is_template: false },
    transaction: options.transaction
  });

  const importedCount = await countUserImportedRoutines(idUserProfile, options);

  return Math.max(0, totalOwned - importedCount);
}

async function getUserRoutineCounts(idUserProfile, options = {}) {
  const totalOwned = await Routine.count({
    where: { created_by: idUserProfile, is_template: false },
    transaction: options.transaction
  });

  const importedCount = await countUserImportedRoutines(idUserProfile, options);
  const createdCount = Math.max(0, totalOwned - importedCount);

  return {
    totalOwned,
    importedCount,
    createdCount
  };
}

module.exports = {
  // UserRoutine
  createUserRoutine,
  findUserRoutineById,
  findActiveUserRoutine,
  findActiveRoutineWithExercises,
  findUserRoutinesByUser,
  updateUserRoutine,
  deactivateUserRoutine,
  deactivateActiveRoutineForUser,

  // UserImportedRoutine
  createUserImportedRoutine,
  findUserImportedRoutineById,
  findUserImportedRoutines,
  countUserImportedRoutines,
  countUserCreatedRoutines,
  getUserRoutineCounts
};
