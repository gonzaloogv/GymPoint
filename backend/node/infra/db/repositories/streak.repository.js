const { Streak } = require('../../../models');
const { toStreak } = require('../../db/mappers/streak.mapper');

async function createStreak(payload, options = {}) {
  const streak = await Streak.create(payload, {
    transaction: options.transaction,
  });
  return toStreak(streak);
}

module.exports = {
  createStreak,
};
