const { Streak, UserProfile, Frequency } = require('../../../models');
const { toStreak, toStreaks } = require('../../db/mappers/streak.mapper');

async function createStreak(payload, options = {}) {
  const streak = await Streak.create(payload, {
    transaction: options.transaction,
  });
  return toStreak(streak);
}

async function findById(idStreak, options = {}) {
  const streak = await Streak.findByPk(idStreak, {
    include: options.includeRelations ? [
      {
        model: UserProfile,
        as: 'userProfile',
        attributes: ['id_user_profile', 'name', 'lastname']
      },
      {
        model: Frequency,
        as: 'frequency',
        attributes: ['goal', 'assist', 'achieved_goal'],
        required: false  // LEFT JOIN en lugar de INNER JOIN
      }
    ] : undefined,
    transaction: options.transaction
  });

  return streak ? toStreak(streak) : null;
}

async function findByUserProfileId(idUserProfile, options = {}) {
  // Buscar directamente por id_user_profile en la tabla streak
  // ya que existe un índice único para esta columna
  const streak = await Streak.findOne({
    where: { id_user_profile: idUserProfile },
    include: options.includeRelations ? [
      {
        model: UserProfile,
        as: 'userProfile',
        attributes: ['id_user_profile', 'name', 'lastname']
      },
      {
        model: Frequency,
        as: 'frequency',
        attributes: ['goal', 'assist', 'achieved_goal'],
        required: false  // LEFT JOIN
      }
    ] : undefined,
    transaction: options.transaction
  });

  return streak ? toStreak(streak) : null;
}

async function updateStreak(idStreak, payload, options = {}) {
  const streak = await Streak.findByPk(idStreak, {
    transaction: options.transaction
  });

  if (!streak) {
    throw new Error('Racha no encontrada');
  }

  await streak.update(payload, { transaction: options.transaction });
  await streak.reload({
    include: options.includeRelations ? [
      { model: UserProfile, as: 'userProfile', attributes: ['id_user_profile', 'name', 'lastname'] },
      { model: Frequency, as: 'frequency', attributes: ['goal', 'assist', 'achieved_goal'] }
    ] : undefined,
    transaction: options.transaction
  });

  return toStreak(streak);
}

async function getStreakStats(options = {}) {
  const totalStreaks = await Streak.count({ transaction: options.transaction });

  const avgResult = await Streak.findOne({
    attributes: [
      [Streak.sequelize.fn('AVG', Streak.sequelize.col('value')), 'average']
    ],
    raw: true,
    transaction: options.transaction
  });

  const maxResult = await Streak.findOne({
    attributes: [
      [Streak.sequelize.fn('MAX', Streak.sequelize.col('value')), 'maximum']
    ],
    raw: true,
    transaction: options.transaction
  });

  return {
    totalStreaks,
    averageStreak: Math.round(avgResult?.average || 0),
    maxStreak: maxResult?.maximum || 0
  };
}

async function listTopStreaks(limit = 10, options = {}) {
  const streaks = await Streak.findAll({
    order: [['value', 'DESC']],
    limit,
    include: [
      { model: UserProfile, as: 'userProfile', attributes: ['id_user_profile', 'name', 'lastname'] }
    ],
    transaction: options.transaction
  });

  return toStreaks(streaks);
}

module.exports = {
  createStreak,
  findById,
  findByUserProfileId,
  updateStreak,
  getStreakStats,
  listTopStreaks
};
