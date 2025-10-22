const { GymAmenity } = require('../../../models');
const { toGymAmenities } = require('../../db/mappers/gym-amenity.mapper');

async function findAll(options = {}) {
  const amenities = await GymAmenity.findAll({
    where: options.where,
    order: options.order || [
      ['category', 'ASC'],
      ['name', 'ASC'],
    ],
    transaction: options.transaction,
  });

  return toGymAmenities(amenities);
}

module.exports = {
  findAll,
};
