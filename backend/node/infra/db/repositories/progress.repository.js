/**
 * Progress Repository
 * Gestión de progreso físico de usuarios y ejercicios
 */

const { Progress, ProgressExercise, UserProfile, Exercise } = require('../../../models');
const { Op } = require('sequelize');
const sequelize = require('../../../config/database');

/**
 * Crear registro de progreso con ejercicios
 */
async function create(data, options = {}) {
  const { transaction } = options;

  const progress = await Progress.create({
    id_user_profile: data.idUserProfile,
    date: data.date,
    total_weight_lifted: data.totalWeightLifted || null,
    total_reps: data.totalReps || null,
    total_sets: data.totalSets || null,
    notes: data.notes || null
  }, { transaction });

  if (data.exercises && data.exercises.length > 0) {
    const exerciseRecords = data.exercises.map(ex => ({
      id_progress: progress.id_progress,
      id_exercise: ex.idExercise,
      max_weight: ex.usedWeight,
      max_reps: ex.reps,
      total_volume: (ex.usedWeight || 0) * (ex.reps || 0) * (ex.sets || 1)
    }));

    await ProgressExercise.bulkCreate(exerciseRecords, { transaction });
  }

  return progress;
}

/**
 * Buscar progreso por ID
 */
async function findById(idProgress) {
  return await Progress.findByPk(idProgress, {
    include: [
      {
        model: UserProfile,
        as: 'userProfile',
        attributes: ['id_user_profile', 'name', 'lastname']
      }
    ]
  });
}

/**
 * Buscar todo el progreso de un usuario
 */
async function findByUserProfile(idUserProfile, options = {}) {
  const { limit, offset, includeExercises } = options;

  const findOptions = {
    where: { id_user_profile: idUserProfile },
    include: [
      {
        model: UserProfile,
        as: 'userProfile',
        attributes: ['name', 'lastname']
      }
    ],
    order: [['date', 'DESC']]
  };

  if (limit) findOptions.limit = limit;
  if (offset) findOptions.offset = offset;

  if (includeExercises) {
    findOptions.include.push({
      model: Exercise,
      as: 'exercises',
      through: {
        attributes: ['used_weight', 'reps', 'sets']
      }
    });
  }

  return await Progress.findAll(findOptions);
}

/**
 * Obtener estadísticas de peso de un usuario
 */
async function getWeightStats(idUserProfile, options = {}) {
  const { startDate, endDate } = options;

  const whereClause = { id_user_profile: idUserProfile };

  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate) whereClause.date[Op.gte] = startDate;
    if (endDate) whereClause.date[Op.lte] = endDate;
  }

  return await Progress.findAll({
    where: whereClause,
    attributes: ['date', 'total_weight_lifted', 'total_reps', 'total_sets', 'notes'],
    order: [['date', 'ASC']]
  });
}

/**
 * Obtener historial de ejercicios de un usuario
 */
async function getExerciseHistory(idUserProfile, options = {}) {
  const { idExercise, limit } = options;

  const progressRecords = await Progress.findAll({
    where: { id_user_profile: idUserProfile },
    attributes: ['id_progress', 'date'],
    order: [['date', 'DESC']],
    limit: limit || 100
  });

  if (!progressRecords.length) return [];

  const progressIds = progressRecords.map(p => p.id_progress);
  const dateMap = {};
  progressRecords.forEach(p => dateMap[p.id_progress] = p.date);

  const whereClause = {
    id_progress: { [Op.in]: progressIds }
  };

  if (idExercise) {
    whereClause.id_exercise = idExercise;
  }

  const exercises = await ProgressExercise.findAll({
    where: whereClause,
    include: [
      {
        model: Exercise,
        as: 'exercise',
        attributes: ['id_exercise', 'exercise_name', 'muscular_group']
      }
    ],
    order: [['id_progress', 'DESC']]
  });

  return exercises.map(e => {
    const data = e.toJSON ? e.toJSON() : e;
    return {
      date: dateMap[data.id_progress],
      idExercise: data.id_exercise,
      exerciseName: data.exercise?.exercise_name,
      muscularGroup: data.exercise?.muscular_group,
      usedWeight: parseFloat(data.max_weight) || 0,
      reps: data.max_reps || 0,
      totalVolume: parseFloat(data.total_volume) || 0
    };
  });
}

/**
 * Obtener mejor marca (PR) de un ejercicio
 */
async function getPersonalRecord(idUserProfile, idExercise) {
  const progressRecords = await Progress.findAll({
    where: { id_user_profile: idUserProfile },
    attributes: ['id_progress', 'date']
  });

  if (!progressRecords.length) return null;

  const progressIds = progressRecords.map(p => p.id_progress);
  const dateMap = {};
  progressRecords.forEach(p => dateMap[p.id_progress] = p.date);

  const records = await ProgressExercise.findAll({
    where: {
      id_progress: { [Op.in]: progressIds },
      id_exercise: idExercise
    }
  });

  if (!records.length) return null;

  const best = records.reduce((max, current) => {
    const maxWeight = parseFloat(max.max_weight) || 0;
    const currentWeight = parseFloat(current.max_weight) || 0;
    return currentWeight > maxWeight ? current : max;
  });

  const bestData = best.toJSON ? best.toJSON() : best;
  return {
    date: dateMap[bestData.id_progress],
    usedWeight: parseFloat(bestData.max_weight) || 0,
    reps: bestData.max_reps || 0,
    totalVolume: parseFloat(bestData.total_volume) || 0
  };
}

/**
 * Obtener promedios de un ejercicio
 */
async function getExerciseAverages(idUserProfile, idExercise) {
  const progressRecords = await Progress.findAll({
    where: { id_user_profile: idUserProfile },
    attributes: ['id_progress']
  });

  if (!progressRecords.length) return null;

  const progressIds = progressRecords.map(p => p.id_progress);

  const records = await ProgressExercise.findAll({
    where: {
      id_progress: { [Op.in]: progressIds },
      id_exercise: idExercise
    }
  });

  if (!records.length) return null;

  const total = records.length;
  const sumWeight = records.reduce((sum, r) => sum + (parseFloat(r.max_weight) || 0), 0);
  const sumReps = records.reduce((sum, r) => sum + (r.max_reps || 0), 0);
  const sumVolume = records.reduce((sum, r) => sum + (parseFloat(r.total_volume) || 0), 0);

  return {
    averageWeight: parseFloat((sumWeight / total).toFixed(2)),
    averageReps: parseFloat((sumReps / total).toFixed(2)),
    averageVolume: parseFloat((sumVolume / total).toFixed(2)),
    totalRecords: total
  };
}

/**
 * Actualizar registro de progreso
 */
async function update(idProgress, data, options = {}) {
  const { transaction } = options;

  const progress = await Progress.findByPk(idProgress, { transaction });
  if (!progress) return null;

  await progress.update({
    date: data.date !== undefined ? data.date : progress.date,
    total_weight_lifted: data.totalWeightLifted !== undefined ? data.totalWeightLifted : progress.total_weight_lifted,
    total_reps: data.totalReps !== undefined ? data.totalReps : progress.total_reps,
    total_sets: data.totalSets !== undefined ? data.totalSets : progress.total_sets,
    notes: data.notes !== undefined ? data.notes : progress.notes
  }, { transaction });

  await progress.reload({ transaction });
  return progress;
}

/**
 * Eliminar registro de progreso
 */
async function deleteById(idProgress, options = {}) {
  const { transaction } = options;

  const progress = await Progress.findByPk(idProgress, { transaction });
  if (!progress) return false;

  // Sequelize debe eliminar automáticamente ProgressExercise por cascade
  await progress.destroy({ transaction });
  return true;
}

module.exports = {
  create,
  findById,
  findByUserProfile,
  getWeightStats,
  getExerciseHistory,
  getPersonalRecord,
  getExerciseAverages,
  update,
  deleteById
};
