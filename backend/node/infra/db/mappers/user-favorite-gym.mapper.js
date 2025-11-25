const { toPlain } = require('./utils');
const { toGym } = require('./gym.mapper');

function toUserFavoriteGym(instance, options = {}) {
  const plain = toPlain(instance);
  if (!plain) return null;

  const favorite = {
    id_user_profile: plain.id_user_profile,
    id_gym: plain.id_gym,
    created_at: plain.created_at || null,
  };

  if (plain.gym && (options.includeGym ?? true)) {
    favorite.gym = toGym(plain.gym, options.gymOptions);
  }

  return favorite;
}

function toUserFavoriteGyms(instances = [], options = {}) {
  if (!Array.isArray(instances)) return [];
  return instances.map((item) => toUserFavoriteGym(item, options)).filter(Boolean);
}

module.exports = {
  toUserFavoriteGym,
  toUserFavoriteGyms,
};
