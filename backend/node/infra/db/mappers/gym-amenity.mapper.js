const { toPlain } = require('./utils');

function toGymAmenity(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_amenity: plain.id_amenity,
    name: plain.name,
    category: plain.category || null,
    icon_name: plain.icon_name || null,
    created_at: plain.created_at || null,
    updated_at: plain.updated_at || null,
  };
}

function toGymAmenities(instances = []) {
  if (!Array.isArray(instances)) return [];
  return instances.map(toGymAmenity).filter(Boolean);
}

module.exports = {
  toGymAmenity,
  toGymAmenities,
};
