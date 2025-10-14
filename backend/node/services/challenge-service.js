const { DailyChallenge, UserDailyChallenge, UserProfile, Notification } = require('../models');
const tokenLedgerService = require('./token-ledger-service');
const { TOKEN_REASONS } = require('../config/constants');

function todayDateOnly() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`; // YYYY-MM-DD en UTC (consistente con uso previo)
}

const getTodayChallenge = async (userId) => {
  const today = todayDateOnly();

  const challenge = await DailyChallenge.findOne({ where: { challenge_date: today, is_active: true } });
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
    is_active: challenge.is_active,
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
  // Validar que sea el desafío de HOY
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

    // Otorgar tokens (una sola vez; el guard está por completed)
    await tokenLedgerService.registrarMovimiento({
      userId,
      delta: challenge.tokens_reward,
      reason: TOKEN_REASONS.DAILY_CHALLENGE_COMPLETED,
      refType: 'daily_challenge',
      refId: challengeId
    });

    // Notificación (best-effort)
    try {
      await Notification.create({
        id_user_profile: userId,
        type: 'ACHIEVEMENT',
        title: 'Desafío completado',
        message: `+${challenge.tokens_reward} tokens: ${challenge.title}`
      });
    } catch (_) { /* ignore */ }
  }

  await userChallenge.save();
  return userChallenge;
};

// Generar desafío del día si falta (para job o seed manual)
const ensureTodayChallenge = async () => {
  const today = todayDateOnly();
  const existing = await DailyChallenge.findOne({ where: { challenge_date: today } });
  if (existing) return existing;

  // Rotación simple de 3 tipos
  const seed = [
    { title: 'Suma 30 minutos', description: 'Entrena al menos 30 minutos', challenge_type: 'MINUTES', target_value: 30, target_unit: 'min', tokens_reward: 10 },
    { title: '5 ejercicios', description: 'Completa 5 ejercicios', challenge_type: 'EXERCISES', target_value: 5, target_unit: 'ex', tokens_reward: 12 },
    { title: '2 asistencias', description: 'Alcanza 2 asistencias semanales', challenge_type: 'FREQUENCY', target_value: 2, target_unit: 'asist', tokens_reward: 15 }
  ];
  const pick = seed[new Date().getUTCDate() % seed.length];
  return await DailyChallenge.create({
    ...pick,
    challenge_date: today,
    is_active: true,
    difficulty: 'MEDIUM'
  });
};

module.exports = {
  getTodayChallenge,
  updateProgress,
  ensureTodayChallenge
};
