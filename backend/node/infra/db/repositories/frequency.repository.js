const { Frequency, FrequencyHistory } = require('../../../models');
const { Op } = require('sequelize');
const { toFrequency, toFrequencies, toFrequencyHistory, toFrequencyHistories } = require('../mappers/frequency.mapper');

// Frequency operations
async function create(payload, options = {}) {
  const frequency = await Frequency.create(payload, { transaction: options.transaction });
  return toFrequency(frequency);
}

async function findById(idFrequency, options = {}) {
  const frequency = await Frequency.findByPk(idFrequency, { transaction: options.transaction });
  return frequency ? toFrequency(frequency) : null;
}

async function findByUserProfileId(idUserProfile, options = {}) {
  const frequency = await Frequency.findOne({
    where: { id_user_profile: idUserProfile },
    transaction: options.transaction
  });
  return frequency ? toFrequency(frequency) : null;
}

async function findAll(options = {}) {
  const frequencies = await Frequency.findAll({ transaction: options.transaction });
  return toFrequencies(frequencies);
}

async function update(idFrequency, payload, options = {}) {
  const frequency = await Frequency.findByPk(idFrequency, { transaction: options.transaction });
  if (!frequency) throw new Error('Frecuencia no encontrada');
  await frequency.update(payload, { transaction: options.transaction });
  return toFrequency(frequency);
}

async function updateByUserProfileId(idUserProfile, payload, options = {}) {
  const frequency = await Frequency.findOne({
    where: { id_user_profile: idUserProfile },
    transaction: options.transaction
  });
  if (!frequency) throw new Error('Frecuencia no encontrada');
  await frequency.update(payload, { transaction: options.transaction });
  return toFrequency(frequency);
}

async function incrementAssist(idUserProfile, options = {}) {
  const frequency = await Frequency.findOne({
    where: { id_user_profile: idUserProfile },
    transaction: options.transaction
  });
  if (!frequency) throw new Error('Frecuencia no encontrada');

  frequency.assist = (frequency.assist || 0) + 1;

  // Check if goal achieved
  if (frequency.assist >= frequency.goal && !frequency.achieved_goal) {
    frequency.achieved_goal = (frequency.achieved_goal || 0) + 1;
  }

  await frequency.save({ transaction: options.transaction });
  return toFrequency(frequency);
}

// FrequencyHistory operations
async function createHistory(payload, options = {}) {
  const history = await FrequencyHistory.create(payload, { transaction: options.transaction });
  return toFrequencyHistory(history);
}

async function listHistory({ idUserProfile, filters = {}, pagination = {}, options = {} }) {
  const where = { id_user_profile: idUserProfile };

  if (filters.startDate && filters.endDate) {
    where.week_start_date = { [Op.between]: [filters.startDate, filters.endDate] };
  }

  const { rows, count } = await FrequencyHistory.findAndCountAll({
    where,
    limit: pagination.limit || 20,
    offset: pagination.offset || 0,
    order: [['week_start_date', 'DESC']],
    transaction: options.transaction
  });

  return { rows: toFrequencyHistories(rows), count };
}

async function getStats(idUserProfile, options = {}) {
  const totalWeeks = await FrequencyHistory.count({
    where: { id_user_profile: idUserProfile },
    transaction: options.transaction
  });

  const weeksAchieved = await FrequencyHistory.count({
    where: { id_user_profile: idUserProfile, achieved: true },
    transaction: options.transaction
  });

  const currentWeek = await findByUserProfileId(idUserProfile, options);

  return {
    totalWeeks,
    weeksAchieved,
    achievementRate: totalWeeks > 0 ? Math.round((weeksAchieved / totalWeeks) * 100) : 0,
    currentWeek: currentWeek ? {
      goal: currentWeek.goal,
      assist: currentWeek.assist,
      progressPercentage: Math.round((currentWeek.assist / currentWeek.goal) * 100)
    } : null
  };
}

module.exports = {
  create,
  findById,
  findByUserProfileId,
  findAll,
  update,
  updateByUserProfileId,
  incrementAssist,
  createHistory,
  listHistory,
  getStats
};
