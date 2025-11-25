const { DailyChallenge, DailyChallengeTemplate, UserDailyChallenge } = require('../../../models');
const { Op } = require('sequelize');
const {
  toDailyChallenge,
  toDailyChallenges,
  toUserDailyChallenge,
  toUserDailyChallenges,
  toChallengeTemplate,
  toChallengeTemplates,
  toChallengeSettings
} = require('../mappers/daily-challenge.mapper');

// DailyChallenge operations
async function create(payload, options = {}) {
  const challenge = await DailyChallenge.create(payload, { transaction: options.transaction });
  return toDailyChallenge(challenge);
}

async function findById(idChallenge, options = {}) {
  const challenge = await DailyChallenge.findByPk(idChallenge, {
    include: options.includeTemplate ? [{ model: DailyChallengeTemplate, as: 'template' }] : undefined,
    transaction: options.transaction
  });
  return challenge ? toDailyChallenge(challenge) : null;
}

async function findByDate(date, options = {}) {
  const challenge = await DailyChallenge.findOne({
    where: { challenge_date: date, is_active: true },
    include: options.includeTemplate ? [{ model: DailyChallengeTemplate, as: 'template' }] : undefined,
    transaction: options.transaction
  });
  return challenge ? toDailyChallenge(challenge) : null;
}

async function findAll({ filters = {}, pagination = {}, sort = {}, options = {} }) {
  const where = { is_active: true };
  if (filters.startDate && filters.endDate) {
    where.challenge_date = { [Op.between]: [filters.startDate, filters.endDate] };
  }
  if (filters.challengeType) where.challenge_type = filters.challengeType;
  if (filters.difficulty) where.difficulty = filters.difficulty;
  if (filters.isActive !== undefined) where.is_active = filters.isActive;

  const { rows, count } = await DailyChallenge.findAndCountAll({
    where,
    limit: pagination.limit || 20,
    offset: pagination.offset || 0,
    order: [[sort.field || 'challenge_date', sort.direction || 'DESC']],
    transaction: options.transaction
  });

  return { rows: toDailyChallenges(rows), count };
}

async function update(idChallenge, payload, options = {}) {
  const challenge = await DailyChallenge.findByPk(idChallenge, { transaction: options.transaction });
  if (!challenge) throw new Error('Desafío no encontrado');
  await challenge.update(payload, { transaction: options.transaction });
  return toDailyChallenge(challenge);
}

// UserDailyChallenge operations
async function findUserProgress(idUserProfile, idChallenge, options = {}) {
  const progress = await UserDailyChallenge.findOne({
    where: { id_user_profile: idUserProfile, id_challenge: idChallenge },
    transaction: options.transaction
  });
  return progress ? toUserDailyChallenge(progress) : null;
}

async function createUserProgress(payload, options = {}) {
  const progress = await UserDailyChallenge.create(payload, { transaction: options.transaction });
  return toUserDailyChallenge(progress);
}

async function updateUserProgress(idUserProfile, idChallenge, payload, options = {}) {
  const progress = await UserDailyChallenge.findOne({
    where: { id_user_profile: idUserProfile, id_challenge: idChallenge },
    transaction: options.transaction
  });
  if (!progress) throw new Error('Progreso no encontrado');
  await progress.update(payload, { transaction: options.transaction });
  return toUserDailyChallenge(progress);
}

async function listUserChallenges({ idUserProfile, filters = {}, pagination = {}, options = {} }) {
  const where = { id_user_profile: idUserProfile };
  if (filters.status) where.status = filters.status;

  const { rows, count } = await UserDailyChallenge.findAndCountAll({
    where,
    limit: pagination.limit || 20,
    offset: pagination.offset || 0,
    order: [['created_at', 'DESC']],
    transaction: options.transaction
  });

  return { rows: toUserDailyChallenges(rows), count };
}

// Challenge Template operations
async function createTemplate(payload, options = {}) {
  const template = await DailyChallengeTemplate.create(payload, { transaction: options.transaction });
  return toChallengeTemplate(template);
}

async function findTemplateById(idTemplate, options = {}) {
  const template = await DailyChallengeTemplate.findByPk(idTemplate, { transaction: options.transaction });
  return template ? toChallengeTemplate(template) : null;
}

async function listTemplates({ filters = {}, pagination = {}, options = {} }) {
  const where = {};
  if (filters.isActive !== undefined) where.is_active = filters.isActive;

  const { rows, count } = await DailyChallengeTemplate.findAndCountAll({
    where,
    limit: pagination.limit || 20,
    offset: pagination.offset || 0,
    order: [['rotation_weight', 'DESC']],
    transaction: options.transaction
  });

  return { rows: toChallengeTemplates(rows), count };
}

async function updateTemplate(idTemplate, payload, options = {}) {
  const template = await DailyChallengeTemplate.findByPk(idTemplate, { transaction: options.transaction });
  if (!template) throw new Error('Plantilla no encontrada');
  await template.update(payload, { transaction: options.transaction });
  return toChallengeTemplate(template);
}

// Challenge Settings operations
async function getSettings(options = {}) {
  const { DailyChallengeSettings } = require('../../../models');
  const settings = await DailyChallengeSettings.getSingleton({ transaction: options.transaction });
  return toChallengeSettings(settings);
}

async function updateSettings(payload, options = {}) {
  const { DailyChallengeSettings } = require('../../../models');
  let settings = await DailyChallengeSettings.getSingleton({ transaction: options.transaction });
  await settings.update(payload, { transaction: options.transaction });
  return toChallengeSettings(settings);
}

module.exports = {
  create,
  findById,
  findByDate,
  findAll,
  update,
  findUserProgress,
  createUserProgress,
  updateUserProgress,
  listUserChallenges,
  createTemplate,
  findTemplateById,
  listTemplates,
  updateTemplate,
  getSettings,
  updateSettings
};
