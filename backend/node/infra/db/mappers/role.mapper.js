const { toPlain } = require('./utils');

function toRole(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_role: plain.id_role,
    role_name: plain.role_name,
    description: plain.description || null,
    created_at: plain.created_at || null,
    updated_at: plain.updated_at || null,
  };
}

function toRoles(instances = []) {
  if (!Array.isArray(instances)) return [];
  return instances.map(toRole).filter(Boolean);
}

module.exports = {
  toRole,
  toRoles,
};
