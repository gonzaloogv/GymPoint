const { toPlain } = require('./utils');

function toFrequency(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_frequency: plain.id_frequency,
    id_user_profile: plain.id_user_profile || plain.id_user,
    goal: plain.goal || 3,
    pending_goal: plain.pending_goal !== undefined ? plain.pending_goal : null,
    assist: plain.assist || 0,
    achieved_goal: plain.achieved_goal || 0,
    week_start_date: plain.week_start_date,
    week_number: plain.week_number,
    year: plain.year,
    created_at: plain.created_at || null,
    updated_at: plain.updated_at || null
  };
}

function toFrequencies(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toFrequency);
}

function toFrequencyHistory(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_frequency_history: plain.id_frequency_history,
    id_user_profile: plain.id_user_profile || plain.id_user,
    week_start_date: plain.week_start_date,
    week_number: plain.week_number,
    year: plain.year,
    goal: plain.goal,
    assist: plain.assist,
    achieved: Boolean(plain.achieved),
    created_at: plain.created_at || null
  };
}

function toFrequencyHistories(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toFrequencyHistory);
}

module.exports = {
  toFrequency,
  toFrequencies,
  toFrequencyHistory,
  toFrequencyHistories
};
