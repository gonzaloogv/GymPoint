const { Op } = require('sequelize');
const { GymSchedule, GymSpecialSchedule, Gym } = require('../../../models');
const {
  toGymSchedule,
  toGymSchedules,
  toGymSpecialSchedule,
  toGymSpecialSchedules,
} = require('../mappers/gym-schedule.mapper');

// ============================================================================
// GYM SCHEDULE (Horarios regulares)
// ============================================================================

async function findSchedulesByGymId(gymId, options = {}) {
  const schedules = await GymSchedule.findAll({
    where: { id_gym: gymId },
    order: [['day_of_week', 'ASC']],
    transaction: options.transaction,
  });
  return toGymSchedules(schedules);
}

async function findScheduleById(scheduleId, options = {}) {
  const schedule = await GymSchedule.findByPk(scheduleId, {
    transaction: options.transaction,
  });
  return toGymSchedule(schedule);
}

async function findScheduleByGymAndDay(gymId, day_of_week, options = {}) {
  const schedule = await GymSchedule.findOne({
    where: { id_gym: gymId, day_of_week },
    transaction: options.transaction,
  });
  return toGymSchedule(schedule);
}

async function createSchedule(payload, options = {}) {
  const schedule = await GymSchedule.create(payload, {
    transaction: options.transaction,
  });
  return toGymSchedule(schedule);
}

async function updateSchedule(scheduleId, payload, options = {}) {
  await GymSchedule.update(payload, {
    where: { id_schedule: scheduleId },
    transaction: options.transaction,
  });
  return findScheduleById(scheduleId, options);
}

async function deleteSchedule(scheduleId, options = {}) {
  return GymSchedule.destroy({
    where: { id_schedule: scheduleId },
    transaction: options.transaction,
  });
}

// ============================================================================
// GYM SPECIAL SCHEDULE (Horarios especiales)
// ============================================================================

async function findSpecialSchedulesByGymId(gymId, filters = {}, options = {}) {
  const where = { id_gym: gymId };

  if (filters.from_date) {
    where.date = where.date || {};
    where.date[Op.gte] = filters.from_date;
  }

  if (filters.to_date) {
    where.date = where.date || {};
    where.date[Op.lte] = filters.to_date;
  }

  if (filters.future_only) {
    where.date = where.date || {};
    where.date[Op.gte] = new Date();
  }

  const schedules = await GymSpecialSchedule.findAll({
    where,
    order: [['date', 'ASC']],
    transaction: options.transaction,
  });
  return toGymSpecialSchedules(schedules);
}

async function findSpecialScheduleById(specialScheduleId, options = {}) {
  const schedule = await GymSpecialSchedule.findByPk(specialScheduleId, {
    transaction: options.transaction,
  });
  return toGymSpecialSchedule(schedule);
}

async function findSpecialScheduleByGymAndDate(gymId, date, options = {}) {
  const schedule = await GymSpecialSchedule.findOne({
    where: { id_gym: gymId, date },
    transaction: options.transaction,
  });
  return toGymSpecialSchedule(schedule);
}

async function createSpecialSchedule(payload, options = {}) {
  const schedule = await GymSpecialSchedule.create(payload, {
    transaction: options.transaction,
  });
  return toGymSpecialSchedule(schedule);
}

async function updateSpecialSchedule(specialScheduleId, payload, options = {}) {
  await GymSpecialSchedule.update(payload, {
    where: { id_special_schedule: specialScheduleId },
    transaction: options.transaction,
  });
  return findSpecialScheduleById(specialScheduleId, options);
}

async function deleteSpecialSchedule(specialScheduleId, options = {}) {
  return GymSpecialSchedule.destroy({
    where: { id_special_schedule: specialScheduleId },
    transaction: options.transaction,
  });
}

module.exports = {
  // Regular schedules
  findSchedulesByGymId,
  findScheduleById,
  findScheduleByGymAndDay,
  createSchedule,
  updateSchedule,
  deleteSchedule,

  // Special schedules
  findSpecialSchedulesByGymId,
  findSpecialScheduleById,
  findSpecialScheduleByGymAndDate,
  createSpecialSchedule,
  updateSpecialSchedule,
  deleteSpecialSchedule,
};
