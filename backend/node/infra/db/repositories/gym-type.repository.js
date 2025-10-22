const { GymType } = require('../../../models');
const { toGymType, toGymTypes } = require('../../db/mappers/gym-type.mapper');

async function findAll(options = {}) {
  const types = await GymType.findAll({
    where: options.where,
    order: options.order,
    transaction: options.transaction,
  });
  return toGymTypes(types);
}

async function findByNames(names = [], options = {}) {
  if (!names.length) return [];
  const types = await GymType.findAll({
    where: { name: names },
    transaction: options.transaction,
  });
  return toGymTypes(types);
}

async function ensureTypeIdsByNames(names = [], options = {}) {
  if (!names.length) return [];

  const existing = await GymType.findAll({
    where: { name: names },
    transaction: options.transaction,
  });

  const existingMap = new Map(existing.map((type) => [type.name.toLowerCase(), type]));
  const missing = names.filter((name) => !existingMap.has(name.toLowerCase()));

  for (const name of missing) {
    const [type] = await GymType.findOrCreate({
      where: { name },
      defaults: { name },
      transaction: options.transaction,
    });
    existingMap.set(name.toLowerCase(), type);
  }

  return Array.from(existingMap.values()).map((type) => type.id_type);
}

module.exports = {
  findAll,
  findByNames,
  ensureTypeIdsByNames,
};
