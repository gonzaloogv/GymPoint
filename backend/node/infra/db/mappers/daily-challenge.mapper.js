const { toPlain } = require('./utils');

function toDailyChallenge(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  const result = {
    id_challenge: plain.id_challenge,
    challenge_date: plain.challenge_date,
    title: plain.title,
    description: plain.description,
    challenge_type: plain.challenge_type,
    target_value: plain.target_value,
    target_unit: plain.target_unit,
    tokens_reward: plain.tokens_reward,
    difficulty: plain.difficulty,
    is_active: Boolean(plain.is_active),
    id_template: plain.id_template || null,
    created_at: plain.created_at || null,
    updated_at: plain.updated_at || null
  };

  if (plain.template) {
    result.template = {
      id_template: plain.template.id_template,
      name: plain.template.name
    };
  }

  return result;
}

function toDailyChallenges(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toDailyChallenge);
}

function toUserDailyChallenge(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_user_challenge: plain.id_user_challenge,
    id_user_profile: plain.id_user_profile,
    id_challenge: plain.id_challenge,
    current_value: plain.current_value || 0,
    status: plain.status,
    completed_at: plain.completed_at || null,
    reward_claimed_at: plain.reward_claimed_at || null,
    created_at: plain.created_at || null,
    updated_at: plain.updated_at || null
  };
}

function toUserDailyChallenges(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toUserDailyChallenge);
}

function toChallengeTemplate(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_template: plain.id_template,
    name: plain.name,
    description: plain.description,
    challenge_type: plain.challenge_type,
    target_value: plain.target_value,
    target_unit: plain.target_unit,
    tokens_reward: plain.tokens_reward,
    difficulty: plain.difficulty,
    rotation_weight: plain.rotation_weight || 1,
    is_active: Boolean(plain.is_active),
    created_at: plain.created_at || null,
    updated_at: plain.updated_at || null
  };
}

function toChallengeTemplates(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toChallengeTemplate);
}

function toChallengeSettings(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_settings: plain.id_settings,
    enabled_days: plain.enabled_days,
    auto_generate: Boolean(plain.auto_generate),
    auto_generate_time: plain.auto_generate_time,
    default_tokens_reward: plain.default_tokens_reward,
    created_at: plain.created_at || null,
    updated_at: plain.updated_at || null
  };
}

module.exports = {
  toDailyChallenge,
  toDailyChallenges,
  toUserDailyChallenge,
  toUserDailyChallenges,
  toChallengeTemplate,
  toChallengeTemplates,
  toChallengeSettings
};
