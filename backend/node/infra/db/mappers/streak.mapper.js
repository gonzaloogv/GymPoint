const { toPlain } = require('./utils');

function toStreak(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  const result = {
    id_streak: plain.id_streak,
    id_user_profile: plain.id_user_profile || plain.id_user,
    id_frequency: plain.id_frequency || null,
    value: plain.value || 0,
    last_value: plain.last_value || 0,
    max_value: plain.max_value || 0,
    recovery_items: plain.recovery_items || 0,
    last_assistance_date: plain.last_assistance_date || null,
    created_at: plain.created_at || null,
    updated_at: plain.updated_at || null,
  };

  // Include relations if present
  if (plain.userProfile) {
    result.userProfile = {
      id_user_profile: plain.userProfile.id_user_profile,
      name: plain.userProfile.name,
      lastname: plain.userProfile.lastname
    };
  }

  if (plain.frequency) {
    result.frequency = {
      goal: plain.frequency.goal,
      assist: plain.frequency.assist,
      achieved_goal: plain.frequency.achieved_goal
    };
  }

  return result;
}

function toStreaks(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toStreak);
}

module.exports = {
  toStreak,
  toStreaks
};
