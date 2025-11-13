/**
 * Mappers de infra para GymSchedule y GymSpecialSchedule
 * Transforman modelos Sequelize a POJOs
 */

function toGymSchedule(model) {
  if (!model) return null;
  return {
    id_schedule: model.id_schedule,
    id_gym: model.id_gym,
    day_of_week: model.day_of_week,
    open_time: model.open_time,
    close_time: model.close_time,
    is_closed: model.is_closed,
  };
}

function toGymSchedules(models) {
  if (!models || !Array.isArray(models)) return [];
  return models.map(toGymSchedule).filter(Boolean);
}

function toGymSpecialSchedule(model) {
  if (!model) return null;
  return {
    id_special_schedule: model.id_special_schedule,
    id_gym: model.id_gym,
    date: model.date,
    open_time: model.open_time,
    close_time: model.close_time,
    is_closed: model.is_closed,
    reason: model.reason,
    created_at: model.created_at,
  };
}

function toGymSpecialSchedules(models) {
  if (!models || !Array.isArray(models)) return [];
  return models.map(toGymSpecialSchedule).filter(Boolean);
}

module.exports = {
  toGymSchedule,
  toGymSchedules,
  toGymSpecialSchedule,
  toGymSpecialSchedules,
};
