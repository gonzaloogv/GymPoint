const { toPlain } = require('./utils');

function toPresence(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_presence: plain.id_presence,
    id_user_profile: plain.id_user_profile,
    id_gym: plain.id_gym,
    first_seen_at: plain.first_seen_at || null,
    last_seen_at: plain.last_seen_at || null,
    exited_at: plain.exited_at || null,
    status: plain.status || 'DETECTING',
    converted_to_assistance: Boolean(plain.converted_to_assistance),
    id_assistance: plain.id_assistance || null,
    distance_meters: plain.distance_meters || null,
    accuracy_meters: plain.accuracy_meters || null,
    location_updates_count: plain.location_updates_count || 0,
    created_at: plain.created_at || null,
    updated_at: plain.updated_at || null,
    // Relaciones (si están incluidas)
    userProfile: plain.userProfile
      ? {
          id_user_profile: plain.userProfile.id_user_profile,
          name: plain.userProfile.name,
          lastname: plain.userProfile.lastname,
        }
      : undefined,
    gym: plain.gym
      ? {
          id_gym: plain.gym.id_gym,
          name: plain.gym.name,
          city: plain.gym.city,
          address: plain.gym.address,
        }
      : undefined,
  };
}

function toPresences(instances) {
  if (!instances || !Array.isArray(instances)) {
    return [];
  }
  return instances.map(toPresence);
}

module.exports = {
  toPresence,
  toPresences,
};
