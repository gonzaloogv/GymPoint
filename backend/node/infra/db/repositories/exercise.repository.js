/**
 * Exercise Repository - Lote 7
 * Data access layer for Exercise with explicit projections
 */

const Exercise = require('../../../models/Exercise');
const { toExercise, toExercises } = require('../mappers/exercise.mapper');
const { Op } = require('sequelize');

// CREATE
async function create(payload, options = {}) {
  const exercise = await Exercise.create(payload, { transaction: options.transaction });
  return toExercise(exercise);
}

// READ
async function findById(idExercise, options = {}) {
  const exercise = await Exercise.findByPk(idExercise, { transaction: options.transaction });
  return toExercise(exercise);
}

async function findAll(options = {}) {
  const { filters = {}, pagination = {}, sort = {} } = options;

  const where = {};
  if (filters.muscularGroup) where.muscular_group = filters.muscularGroup;
  if (filters.difficulty) where.difficulty = filters.difficulty;
  if (filters.equipmentNeeded) where.equipment_needed = filters.equipmentNeeded;

  const queryOptions = {
    where,
    transaction: options.transaction
  };

  if (pagination.limit) queryOptions.limit = pagination.limit;
  if (pagination.offset) queryOptions.offset = pagination.offset;

  if (sort.field) {
    queryOptions.order = [[sort.field, sort.order || 'ASC']];
  } else {
    queryOptions.order = [['exercise_name', 'ASC']];
  }

  const exercises = await Exercise.findAll(queryOptions);
  return toExercises(exercises);
}

async function findAllWithCount(options = {}) {
  const { filters = {}, pagination = {}, sort = {} } = options;

  const where = {};
  if (filters.muscularGroup) where.muscular_group = filters.muscularGroup;
  if (filters.difficulty) where.difficulty = filters.difficulty;
  if (filters.equipmentNeeded) where.equipment_needed = filters.equipmentNeeded;

  const queryOptions = {
    where,
    limit: pagination.limit || 20,
    offset: pagination.offset || 0,
    transaction: options.transaction
  };

  if (sort.field) {
    queryOptions.order = [[sort.field, sort.order || 'ASC']];
  } else {
    queryOptions.order = [['exercise_name', 'ASC']];
  }

  const { rows, count } = await Exercise.findAndCountAll(queryOptions);
  return { rows: toExercises(rows), count };
}

// UPDATE
async function update(idExercise, payload, options = {}) {
  const exercise = await Exercise.findByPk(idExercise, { transaction: options.transaction });
  if (!exercise) throw new Error('Exercise not found');

  await exercise.update(payload, { transaction: options.transaction });
  return toExercise(exercise);
}

// DELETE
async function deleteById(idExercise, options = {}) {
  const exercise = await Exercise.findByPk(idExercise, { transaction: options.transaction });
  if (!exercise) throw new Error('Exercise not found');

  await exercise.destroy({ transaction: options.transaction });
  return true;
}

module.exports = {
  create,
  findById,
  findAll,
  findAllWithCount,
  update,
  deleteById
};
