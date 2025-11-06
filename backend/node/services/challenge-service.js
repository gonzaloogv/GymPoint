/**
 * Challenge Service - Refactorizado con Command/Query pattern
 * Gestión de Daily Challenges siguiendo arquitectura limpia
 */

const { dailyChallengeRepository } = require('../infra/db/repositories');
const tokenLedgerService = require('./token-ledger-service');
const achievementService = require('./achievement-service');
const { processUnlockResults } = require('./achievement-side-effects');
const { NotFoundError, BusinessError, ValidationError } = require('../utils/errors');
const { TOKEN_REASONS } = require('../config/constants');

const CHALLENGE_ACHIEVEMENT_CATEGORIES = ['CHALLENGE', 'TOKEN'];

// Ensure functions para aceptar Commands/plain objects
const ensureCreateCommand = (input) => input;
const ensureUpdateCommand = (input) => input;
const ensureProgressCommand = (input) => input;

// ==================== Daily Challenge Operations ====================

const getTodayChallenge = async (query) => {
  const q = typeof query === 'object' && query.idUserProfile ? query : { idUserProfile: query };

  const today = new Date().toISOString().slice(0, 10);
  const challenge = await dailyChallengeRepository.findByDate(today, { includeTemplate: true });

  if (!challenge) return null;

  const progress = await dailyChallengeRepository.findUserProgress(
    q.idUserProfile,
    challenge.id_challenge
  );

  return { challenge, progress };
};

const getChallengeById = async (query) => {
  const q = typeof query === 'object' && query.idChallenge ? query : { idChallenge: query };

  const challenge = await dailyChallengeRepository.findById(q.idChallenge, { includeTemplate: true });
  if (!challenge) {
    throw new NotFoundError('Desafío');
  }
  return challenge;
};

const listChallenges = async (query) => {
  const q = ensureQuery(query);

  const { rows, count } = await dailyChallengeRepository.findAll({
    filters: {
      startDate: q.startDate,
      endDate: q.endDate,
      challengeType: q.challengeType,
      difficulty: q.difficulty,
      isActive: q.isActive
    },
    pagination: {
      limit: q.limit,
      offset: (q.page - 1) * q.limit
    },
    sort: {
      field: q.sortBy,
      direction: q.order
    }
  });

  return { items: rows, total: count, page: q.page, limit: q.limit };
};

function ensureQuery(q) {
  return {
    page: q.page || 1,
    limit: q.limit || 20,
    sortBy: q.sortBy || 'challenge_date',
    order: q.order || 'DESC',
    startDate: q.startDate || null,
    endDate: q.endDate || null,
    challengeType: q.challengeType || null,
    difficulty: q.difficulty || null,
    isActive: q.isActive ?? null
  };
}

const createDailyChallenge = async (command) => {
  const cmd = ensureCreateCommand(command);

  // Validar que no exista un desafío para esa fecha
  const existing = await dailyChallengeRepository.findByDate(cmd.challengeDate);
  if (existing) {
    throw new BusinessError('Ya existe un desafío para esta fecha', 'CHALLENGE_EXISTS');
  }

  return dailyChallengeRepository.create({
    challenge_date: cmd.challengeDate,
    title: cmd.title,
    description: cmd.description,
    challenge_type: cmd.challengeType,
    target_value: cmd.targetValue,
    target_unit: cmd.targetUnit,
    tokens_reward: cmd.tokensReward || 10,
    difficulty: cmd.difficulty || 'MEDIUM',
    id_template: cmd.idTemplate || null,
    is_active: true
  });
};

const updateDailyChallenge = async (command) => {
  const cmd = ensureUpdateCommand(command);

  const challenge = await dailyChallengeRepository.findById(cmd.idChallenge);
  if (!challenge) {
    throw new NotFoundError('Desafío');
  }

  const payload = {};
  if (cmd.title !== undefined) payload.title = cmd.title;
  if (cmd.description !== undefined) payload.description = cmd.description;
  if (cmd.challengeType !== undefined) payload.challenge_type = cmd.challengeType;
  if (cmd.targetValue !== undefined) payload.target_value = cmd.targetValue;
  if (cmd.targetUnit !== undefined) payload.target_unit = cmd.targetUnit;
  if (cmd.tokensReward !== undefined) payload.tokens_reward = cmd.tokensReward;
  if (cmd.difficulty !== undefined) payload.difficulty = cmd.difficulty;
  if (cmd.isActive !== undefined) payload.is_active = cmd.isActive;

  return dailyChallengeRepository.update(cmd.idChallenge, payload);
};

// ==================== User Challenge Progress Operations ====================

const startChallenge = async (command) => {
  const cmd = typeof command === 'object' && command.idUserProfile ? command : command;

  const challenge = await dailyChallengeRepository.findById(cmd.idChallenge);
  if (!challenge) {
    throw new NotFoundError('Desafío');
  }

  const existing = await dailyChallengeRepository.findUserProgress(
    cmd.idUserProfile,
    cmd.idChallenge
  );

  if (existing) {
    return existing; // Ya iniciado
  }

  return dailyChallengeRepository.createUserProgress({
    id_user_profile: cmd.idUserProfile,
    id_challenge: cmd.idChallenge,
    progress: 0,
    completed: false
  });
};

const updateChallengeProgress = async (command) => {
  const cmd = ensureProgressCommand(command);

  const challenge = await dailyChallengeRepository.findById(cmd.idChallenge);
  if (!challenge) {
    throw new NotFoundError('Desafío');
  }

  let progress = await dailyChallengeRepository.findUserProgress(
    cmd.idUserProfile,
    cmd.idChallenge
  );

  if (!progress) {
    // Auto-start if not started
    progress = await startChallenge({ idUserProfile: cmd.idUserProfile, idChallenge: cmd.idChallenge });
  }

  const payload = { progress: cmd.currentValue };

  // Check if completed
  if (cmd.currentValue >= challenge.target_value && progress.status !== 'COMPLETED') {
    payload.completed = true;
    payload.completed_at = new Date();
  }

  return dailyChallengeRepository.updateUserProgress(
    cmd.idUserProfile,
    cmd.idChallenge,
    payload
  );
};

const claimChallengeReward = async (command) => {
  const cmd = typeof command === 'object' && command.idUserProfile ? command : command;

  const progress = await dailyChallengeRepository.findUserProgress(
    cmd.idUserProfile,
    cmd.idChallenge
  );

  if (!progress) {
    throw new NotFoundError('Progreso de desafío');
  }

  if (progress.status !== 'COMPLETED') {
    throw new BusinessError('El desafío no está completado', 'CHALLENGE_NOT_COMPLETED');
  }

  if (progress.tokens_earned > 0) {
    throw new BusinessError('La recompensa ya fue reclamada', 'REWARD_ALREADY_CLAIMED');
  }

  const challenge = await dailyChallengeRepository.findById(cmd.idChallenge);

  // Award tokens
  await tokenLedgerService.registrarMovimiento({
    userId: cmd.idUserProfile,
    delta: challenge.tokens_reward,
    reason: TOKEN_REASONS.DAILY_CHALLENGE_COMPLETED,
    refType: 'challenge',
    refId: cmd.idChallenge
  });

  // Mark as claimed
  await dailyChallengeRepository.updateUserProgress(
    cmd.idUserProfile,
    cmd.idChallenge,
    { tokens_earned: challenge.tokens_reward }
  );

  // Sync achievements
  try {
    const results = await achievementService.syncAllAchievementsForUser(cmd.idUserProfile, {
      categories: CHALLENGE_ACHIEVEMENT_CATEGORIES
    });
    await processUnlockResults(cmd.idUserProfile, results);
  } catch (error) {
    console.error('[challenge-service] Error sincronizando logros', error);
  }

  return {
    message: 'Recompensa reclamada exitosamente',
    tokens_awarded: challenge.tokens_reward
  };
};

const getUserChallengeProgress = async (query) => {
  const q = typeof query === 'object' && query.idUserProfile ? query : query;

  const progress = await dailyChallengeRepository.findUserProgress(
    q.idUserProfile,
    q.idChallenge
  );

  return progress;
};

const listUserChallenges = async (query) => {
  const q = typeof query === 'object' && query.idUserProfile ? query : query;

  const { rows, count } = await dailyChallengeRepository.listUserChallenges({
    idUserProfile: q.idUserProfile,
    filters: { status: q.status || null },
    pagination: {
      limit: q.limit || 20,
      offset: ((q.page || 1) - 1) * (q.limit || 20)
    }
  });

  return { items: rows, total: count, page: q.page || 1, limit: q.limit || 20 };
};

// ==================== Challenge Template Operations ====================

const createChallengeTemplate = async (command) => {
  const cmd = command;

  return dailyChallengeRepository.createTemplate({
    name: cmd.name,
    description: cmd.description,
    challenge_type: cmd.challengeType,
    target_value: cmd.targetValue,
    target_unit: cmd.targetUnit,
    tokens_reward: cmd.tokensReward || 10,
    difficulty: cmd.difficulty || 'MEDIUM',
    rotation_weight: cmd.rotationWeight || 1,
    is_active: cmd.isActive ?? true
  });
};

const updateChallengeTemplate = async (command) => {
  const cmd = command;

  const template = await dailyChallengeRepository.findTemplateById(cmd.idTemplate);
  if (!template) {
    throw new NotFoundError('Plantilla de desafío');
  }

  const payload = {};
  if (cmd.name !== undefined) payload.name = cmd.name;
  if (cmd.description !== undefined) payload.description = cmd.description;
  if (cmd.challengeType !== undefined) payload.challenge_type = cmd.challengeType;
  if (cmd.targetValue !== undefined) payload.target_value = cmd.targetValue;
  if (cmd.targetUnit !== undefined) payload.target_unit = cmd.targetUnit;
  if (cmd.tokensReward !== undefined) payload.tokens_reward = cmd.tokensReward;
  if (cmd.difficulty !== undefined) payload.difficulty = cmd.difficulty;
  if (cmd.rotationWeight !== undefined) payload.rotation_weight = cmd.rotationWeight;
  if (cmd.isActive !== undefined) payload.is_active = cmd.isActive;

  return dailyChallengeRepository.updateTemplate(cmd.idTemplate, payload);
};

const getChallengeTemplateById = async (query) => {
  const q = typeof query === 'object' && query.idTemplate ? query : { idTemplate: query };

  const template = await dailyChallengeRepository.findTemplateById(q.idTemplate);
  if (!template) {
    throw new NotFoundError('Plantilla de desafío');
  }
  return template;
};

const listChallengeTemplates = async (query) => {
  const q = query || {};

  const { rows, count } = await dailyChallengeRepository.listTemplates({
    filters: { isActive: q.isActive ?? null },
    pagination: {
      limit: q.limit || 20,
      offset: ((q.page || 1) - 1) * (q.limit || 20)
    }
  });

  return { items: rows, total: count, page: q.page || 1, limit: q.limit || 20 };
};

// ==================== Challenge Settings Operations ====================

const getChallengeSettings = async () => {
  return dailyChallengeRepository.getSettings();
};

const updateChallengeSettings = async (command) => {
  const cmd = command;

  const payload = {};
  if (cmd.enabledDays !== undefined) payload.enabled_days = cmd.enabledDays;
  if (cmd.autoGenerate !== undefined) payload.auto_generate = cmd.autoGenerate;
  if (cmd.autoGenerateTime !== undefined) payload.auto_generate_time = cmd.autoGenerateTime;
  if (cmd.defaultTokensReward !== undefined) payload.default_tokens_reward = cmd.defaultTokensReward;

  return dailyChallengeRepository.updateSettings(payload);
};

// Legacy aliases
const getSettings = getChallengeSettings;
const getActiveTemplates = () => listChallengeTemplates({ isActive: true });

/**
 * Legacy updateProgress function - combines progress update + auto reward claiming
 * Maintains backward compatibility with old API
 * @param {number} userId
 * @param {number} challengeId
 * @param {number} value
 * @returns {Promise<Object>}
 */
const updateProgress = async (userId, challengeId, value) => {
  // Verify challenge exists and is for today
  const challenge = await dailyChallengeRepository.findById(challengeId);
  if (!challenge) {
    const error = new NotFoundError('Desafío');
    error.code = 'CHALLENGE_NOT_FOUND';
    throw error;
  }

  if (!challenge.is_active) {
    const error = new BusinessError('Desafío no disponible', 'CHALLENGE_NOT_AVAILABLE');
    error.code = 'CHALLENGE_NOT_FOUND';
    throw error;
  }

  const today = new Date().toISOString().slice(0, 10);
  if (challenge.challenge_date !== today) {
    const error = new BusinessError('El desafío no corresponde al día de hoy', 'NOT_TODAY_CHALLENGE');
    error.code = 'NOT_TODAY_CHALLENGE';
    throw error;
  }

  // Update progress
  const progress = await updateChallengeProgress({
    idUserProfile: userId,
    idChallenge: challengeId,
    currentValue: Math.min(parseInt(value, 10) || 0, challenge.target_value)
  });

  // If just completed, auto-claim reward
  let tokensEarned = 0;
  if (progress.status === 'COMPLETED' && progress.tokens_earned === 0) {
    const rewardResult = await claimChallengeReward({
      idUserProfile: userId,
      idChallenge: challengeId
    });
    tokensEarned = rewardResult.tokens_awarded;
  }

  return {
    progress: progress.current_value,
    completed: progress.status === 'COMPLETED',
    tokens_earned: tokensEarned
  };
};

module.exports = {
  // Daily Challenge
  getTodayChallenge,
  getChallengeById,
  listChallenges,
  createDailyChallenge,
  updateDailyChallenge,

  // User Progress
  startChallenge,
  updateChallengeProgress,
  claimChallengeReward,
  getUserChallengeProgress,
  listUserChallenges,

  // Templates
  createChallengeTemplate,
  updateChallengeTemplate,
  getChallengeTemplateById,
  listChallengeTemplates,

  // Settings
  getChallengeSettings,
  updateChallengeSettings,

  // Legacy
  getSettings,
  getActiveTemplates,
  updateProgress
};
