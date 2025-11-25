const { toPlain } = require('./utils');

function toNotificationSetting(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_user_profile: plain.id_user_profile,
    reminders_enabled: Boolean(plain.reminders_enabled ?? true),
    achievements_enabled: Boolean(plain.achievements_enabled ?? true),
    rewards_enabled: Boolean(plain.rewards_enabled ?? true),
    gym_updates_enabled: Boolean(plain.gym_updates_enabled ?? true),
    payment_enabled: Boolean(plain.payment_enabled ?? true),
    social_enabled: Boolean(plain.social_enabled ?? true),
    system_enabled: Boolean(plain.system_enabled ?? true),
    challenge_enabled: Boolean(plain.challenge_enabled ?? true),
    push_enabled: Boolean(plain.push_enabled ?? true),
    email_enabled: Boolean(plain.email_enabled ?? false),
    quiet_hours_start: plain.quiet_hours_start || null,
    quiet_hours_end: plain.quiet_hours_end || null,
    created_at: plain.created_at || null,
    updated_at: plain.updated_at || null,
  };
}

module.exports = {
  toNotificationSetting,
};
