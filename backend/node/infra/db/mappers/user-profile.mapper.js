const { toPlain } = require('./utils');

function toUserProfile(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_user_profile: plain.id_user_profile,
    id_account: plain.id_account,
    name: plain.name,
    lastname: plain.lastname,
    gender: plain.gender || null,
    birth_date: plain.birth_date || null,
    locality: plain.locality || null,
    profile_picture_url: plain.profile_picture_url || null,
    subscription: plain.subscription || plain.app_tier || 'FREE',
    tokens: plain.tokens || 0,
    tokens_balance: plain.tokens_balance ?? plain.tokens,
    tokens_lifetime: plain.tokens_lifetime || 0,
    premium_since: plain.premium_since || null,
    premium_expires: plain.premium_expires || null,
    id_streak: plain.id_streak || null,
    preferred_language: plain.preferred_language || 'es',
    timezone: plain.timezone || null,
    onboarding_completed: Boolean(plain.onboarding_completed),
    created_at: plain.created_at || null,
    updated_at: plain.updated_at || null,
    // Si incluye Account
    email: plain.account?.email || null,
    auth_provider: plain.account?.auth_provider || null,
    email_verified: plain.account?.email_verified || false,
  };
}

function toUserProfiles(instances) {
  if (!instances || !Array.isArray(instances)) {
    return [];
  }
  return instances.map(toUserProfile);
}

module.exports = {
  toUserProfile,
  toUserProfiles,
};
