const { Op } = require('sequelize');
const {
  DailyChallenge,
  DailyChallengeTemplate,
  DailyChallengeSettings,
  UserDailyChallenge,
  UserProfile
} = require('../models');
const challengeService = require('./challenge-service');

const ALLOWED_TYPES = new Set(['MINUTES', 'EXERCISES', 'FREQUENCY']);
const ALLOWED_DIFFICULTY = new Set(['EASY', 'MEDIUM', 'HARD', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']);

const normalizeDifficulty = (value) => {
  if (!value) return 'MEDIUM';
  const upper = String(value).toUpperCase();
  if (ALLOWED_DIFFICULTY.has(upper)) return upper;
  return 'MEDIUM';
};

const sanitizeChallengePayload = (payload = {}) => {
  const data = { ...payload };
  if (data.challenge_type) {
    const upper = String(data.challenge_type).toUpperCase();
    if (!ALLOWED_TYPES.has(upper)) {
      throw new Error('Tipo de desafío no admitido');
    }
    data.challenge_type = upper;
  }
  if (data.difficulty) {
    data.difficulty = normalizeDifficulty(data.difficulty);
  }
  if (data.target_value != null) {
    data.target_value = parseInt(data.target_value, 10);
    if (!Number.isFinite(data.target_value) || data.target_value <= 0) {
      throw new Error('target_value debe ser un número mayor a 0');
    }
  }
  if (data.tokens_reward != null) {
    data.tokens_reward = parseInt(data.tokens_reward, 10);
    if (!Number.isFinite(data.tokens_reward) || data.tokens_reward < 0) {
      throw new Error('tokens_reward debe ser un número positivo');
    }
  }
  if (data.rotation_weight != null) {
    data.rotation_weight = parseInt(data.rotation_weight, 10);
    if (!Number.isFinite(data.rotation_weight) || data.rotation_weight < 0) {
      throw new Error('rotation_weight debe ser un número no negativo');
    }
  }
  return data;
};

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Fecha inválida, formato esperado YYYY-MM-DD');
  }
  return value;
};

const listChallenges = async ({ from, to, includeInactive }) => {
  const where = {};
  if (from) where.challenge_date = { [Op.gte]: parseDate(from) };
  if (to) {
    where.challenge_date = {
      ...(where.challenge_date || {}),
      [Op.lte]: parseDate(to)
    };
  }
  if (!includeInactive) {
    where.is_active = true;
  }

  return DailyChallenge.findAll({
    where,
    order: [['challenge_date', 'DESC']],
    include: [{ model: DailyChallengeTemplate, as: 'template' }]
  });
};

const getChallengeById = async (id) => {
  return DailyChallenge.findByPk(id, {
    include: [
      { model: DailyChallengeTemplate, as: 'template' },
      {
        model: UserDailyChallenge,
        as: 'userProgress',
        include: [{ model: UserProfile, as: 'user', attributes: ['id_user_profile', 'name', 'lastname'] }]
      }
    ]
  });
};

const createChallenge = async (payload, { createdBy } = {}) => {
  const data = sanitizeChallengePayload(payload);
  data.challenge_date = parseDate(payload.challenge_date);
  if (!data.challenge_date) {
    throw new Error('challenge_date es requerido para crear un desafío manual');
  }

  const existing = await DailyChallenge.findOne({ where: { challenge_date: data.challenge_date } });
  if (existing) {
    throw new Error('Ya existe un desafío asignado para esa fecha');
  }

  return DailyChallenge.create({
    title: data.title,
    description: data.description || null,
    challenge_type: data.challenge_type,
    target_value: data.target_value,
    target_unit: data.target_unit || null,
    tokens_reward: data.tokens_reward ?? 10,
    difficulty: normalizeDifficulty(data.difficulty),
    challenge_date: data.challenge_date,
    is_active: data.is_active !== undefined ? !!data.is_active : true,
    id_template: data.id_template || null,
    auto_generated: !!data.auto_generated,
    created_by: createdBy || null
  });
};

const updateChallenge = async (id, payload) => {
  const challenge = await DailyChallenge.findByPk(id);
  if (!challenge) throw new Error('Desafío no encontrado');

  const data = sanitizeChallengePayload(payload);
  if (data.challenge_date) {
    data.challenge_date = parseDate(data.challenge_date);
    const existing = await DailyChallenge.findOne({
      where: {
        challenge_date: data.challenge_date,
        id_challenge: { [Op.ne]: id }
      }
    });
    if (existing) throw new Error('Ya existe un desafío para la fecha indicada');
  }

  if (data.is_active != null) {
    data.is_active = !!data.is_active;
  }

  if (data.auto_generated != null) {
    data.auto_generated = !!data.auto_generated;
  }

  await challenge.update(data);
  return challenge.reload({
    include: [{ model: DailyChallengeTemplate, as: 'template' }]
  });
};

const deleteChallenge = async (id) => {
  const challenge = await DailyChallenge.findByPk(id);
  if (!challenge) throw new Error('Desafío no encontrado');

  const usageCount = await UserDailyChallenge.count({ where: { id_challenge: id } });
  if (usageCount > 0) {
    throw new Error('El desafío tiene progreso de usuarios y no puede eliminarse');
  }

  await challenge.destroy();
  return true;
};

const listTemplates = async () => {
  return DailyChallengeTemplate.findAll({
    order: [
      ['is_active', 'DESC'],
      ['rotation_weight', 'DESC'],
      ['id_template', 'ASC']
    ]
  });
};

const createTemplate = async (payload, { createdBy } = {}) => {
  const data = sanitizeChallengePayload(payload);

  if (!data.title || !data.challenge_type || !data.target_value) {
    throw new Error('title, challenge_type y target_value son requeridos');
  }

  return DailyChallengeTemplate.create({
    title: data.title,
    description: data.description || null,
    challenge_type: data.challenge_type,
    target_value: data.target_value,
    target_unit: data.target_unit || null,
    tokens_reward: data.tokens_reward ?? 10,
    difficulty: normalizeDifficulty(data.difficulty),
    rotation_weight: data.rotation_weight != null ? data.rotation_weight : 1,
    is_active: data.is_active !== undefined ? !!data.is_active : true,
    created_by: createdBy || null
  });
};

const updateTemplate = async (id, payload) => {
  const template = await DailyChallengeTemplate.findByPk(id);
  if (!template) throw new Error('Plantilla no encontrada');

  const data = sanitizeChallengePayload(payload);
  if (data.is_active != null) data.is_active = !!data.is_active;

  await template.update(data);
  return template;
};

const deleteTemplate = async (id) => {
  const template = await DailyChallengeTemplate.findByPk(id);
  if (!template) throw new Error('Plantilla no encontrada');

  const usage = await DailyChallenge.count({ where: { id_template: id } });
  if (usage > 0) {
    throw new Error('Existen desafíos generados desde esta plantilla');
  }

  await template.destroy();
  return true;
};

const getConfig = async () => {
  return challengeService.getSettings();
};

const updateConfig = async (payload) => {
  const config = await challengeService.getSettings();

  if (payload.auto_rotation_enabled != null) {
    config.auto_rotation_enabled = !!payload.auto_rotation_enabled;
  }

  if (payload.rotation_cron) {
    config.rotation_cron = payload.rotation_cron;
  }

  await config.save();
  return config;
};

const runAutoGeneration = async () => {
  return challengeService.ensureTodayChallenge();
};

module.exports = {
  listChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getConfig,
  updateConfig,
  runAutoGeneration
};

