const { toPlain } = require('./utils');

function toGymType(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_type: plain.id_type,
    name: plain.name,
    description: plain.description || null,
  };
}

function toGymTypes(instances = []) {
  if (!Array.isArray(instances)) return [];
  return instances.map(toGymType).filter(Boolean);
}

module.exports = {
  toGymType,
  toGymTypes,
};
