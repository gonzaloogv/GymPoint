const { toPlain } = require('./utils');

function toStreak(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_streak: plain.id_streak,
    id_user: plain.id_user,
    value: plain.value,
    last_value: plain.last_value || null,
    recovery_items: plain.recovery_items || 0,
    achieved_goal: Boolean(plain.achieved_goal),
    id_frequency: plain.id_frequency || null,
    created_at: plain.created_at || null,
    updated_at: plain.updated_at || null,
  };
}

module.exports = {
  toStreak,
};
