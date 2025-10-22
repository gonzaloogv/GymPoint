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
    subscription: plain.subscription,
    tokens: plain.tokens,
    tokens_balance: plain.tokens_balance ?? plain.tokens_balance,
    tokens_lifetime: plain.tokens_lifetime ?? plain.tokens_lifetime,
    premium_since: plain.premium_since || null,
    premium_expires: plain.premium_expires || null,
    id_streak: plain.id_streak || null,
    created_at: plain.created_at || null,
    updated_at: plain.updated_at || null,
  };
}

module.exports = {
  toUserProfile,
};
