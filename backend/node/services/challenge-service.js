const { Op } = require('sequelize');
const {
  DailyChallenge,
  DailyChallengeTemplate,
  DailyChallengeSettings,
  UserDailyChallenge,
  Notification
} = require('../models');
const tokenLedgerService = require('./token-ledger-service');
const achievementService = require('./achievement-service');
const { processUnlockResults } = require('./achievement-side-effects');
const { TOKEN_REASONS } = require('../config/constants');

const CHALLENGE_ACHIEVEMENT_CATEGORIES = ['CHALLENGE', 'TOKEN'];

function todayDateOnly() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const syncChallengeAchievements = async (idUserProfile) => {
  try {
    const results = await achievementService.syncAllAchievementsForUser(idUserProfile, {
      categories: CHALLENGE_ACHIEVEMENT_CATEGORIES
    });
    await processUnlockResults(idUserProfile, results);
  } catch (error) {
    console.error('[challenge-service] Error sincronizando logros', error);
  }
};

const getSettings = async () => {
  return DailyChallengeSettings.getSingleton();
};

const getActiveTemplates = async () => {
  return DailyChallengeTemplate.findAll({
    where: {
      is_active: true,
      rotation_weight: { [Op.gt]: 0 }
    },
    order: [['id_template', 'ASC']]
  });
};

const pickTemplateForDate = (templates, dateString) => {
  if (!templates.length) return null;

  const date = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return templates[0];
  }

  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const totalWeight = templates.reduce(
    (sum, template) => sum + Math.max(0, template.rotation_weight || 0),
    0
  );

  if (totalWeight <= 0) {
    return templates[0];
  }

  const pivot = dayOfYear % totalWeight;
  let accumulator = 0;
  for (const template of templates) {
    const weight = Math.max(0, template.rotation_weight || 0);
    accumulator += weight;
    if (pivot < accumulator) {
      return template;
    }
  }
  return templates[templates.length - 1];
};

const getTodayChallenge = async (userId) => {
  const today = todayDateOnly();

  const challenge = await DailyChallenge.findOne({
    where: { challenge_date: today, is_active: true },
    include: [
      {
        model: DailyChallengeTemplate,
        as: 'template'
      }
    ]
  });
  if (!challenge) return null;

  const userProgress = await UserDailyChallenge.findOne({
    where: { id_user_profile: userId, id_challenge: challenge.id_challenge }
  });

  return {
    id_challenge: challenge.id_challenge,
    challenge_date: challenge.challenge_date,
    title: challenge.title,
    description: challenge.description,
    challenge_type: challenge.challenge_type,
    target_value: challenge.target_value,
    target_unit: challenge.target_unit,
    tokens_reward: challenge.tokens_reward,
    difficulty: challenge.difficulty,
    id_template: challenge.id_template,
    auto_generated: challenge.auto_generated,
    is_active: challenge.is_active,
    template: challenge.template || null,
    progress: userProgress?.progress || 0,
    completed: userProgress?.completed || false
  };
};

const updateProgress = async (userId, challengeId, value) => {
  const challenge = await DailyChallenge.findByPk(challengeId);
  if (!challenge || !challenge.is_active) {
    const e = new Error('Desafío no disponible');
    e.code = 'CHALLENGE_NOT_FOUND';
    throw e;
  }

  const today = todayDateOnly();
  if (String(challenge.challenge_date) !== String(today)) {
    const e = new Error('El desafío no corresponde al día de hoy');
    e.code = 'NOT_TODAY_CHALLENGE';
    throw e;
  }

  const [userChallenge] = await UserDailyChallenge.findOrCreate({
    where: { id_user_profile: userId, id_challenge: challengeId },
    defaults: { progress: 0, completed: false, tokens_earned: 0 }
  });

  const prevCompleted = !!userChallenge.completed;
  userChallenge.progress = Math.min(parseInt(value, 10) || 0, challenge.target_value);

  if (!prevCompleted && userChallenge.progress >= challenge.target_value) {
    userChallenge.completed = true;
    userChallenge.completed_at = new Date();
    userChallenge.tokens_earned = challenge.tokens_reward;

    await tokenLedgerService.registrarMovimiento({
      userId,
      delta: challenge.tokens_reward,
      reason: TOKEN_REASONS.DAILY_CHALLENGE_COMPLETED,
      refType: 'daily_challenge',
      refId: challengeId
    });

    try {
      await Notification.create({
        id_user_profile: userId,
        type: 'ACHIEVEMENT',
        title: 'Desafío completado',
        message: `+${challenge.tokens_reward} tokens: ${challenge.title}`
      });
    } catch (_) {
      /* ignore best-effort */
    }

    await syncChallengeAchievements(userId);
  }

  await userChallenge.save();
  return userChallenge;
};

const ensureTodayChallenge = async () => {
  const today = todayDateOnly();
  const existing = await DailyChallenge.findOne({ where: { challenge_date: today } });
  if (existing) return existing;

  const settings = await getSettings();
  if (!settings.auto_rotation_enabled) {
    return null;
  }

  const templates = await getActiveTemplates();
  const template = pickTemplateForDate(templates, today);
  if (!template) {
    return null;
  }

  return DailyChallenge.create({
    challenge_date: today,
    title: template.title,
    description: template.description,
    challenge_type: template.challenge_type,
    target_value: template.target_value,
    target_unit: template.target_unit,
    tokens_reward: template.tokens_reward,
    difficulty: template.difficulty,
    is_active: true,
    id_template: template.id_template,
    auto_generated: true,
    created_by: template.created_by || null
  });
};

module.exports = {
  todayDateOnly,
  getTodayChallenge,
  updateProgress,
  ensureTodayChallenge,
  getSettings,
  getActiveTemplates,
  pickTemplateForDate
};




