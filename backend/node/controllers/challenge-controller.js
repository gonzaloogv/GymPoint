const challengeService = require('../services/challenge-service');

// GET /api/challenges/today
const getToday = async (req, res) => {
  try {
    const idUser = req.user.id_user_profile;
    const result = await challengeService.getTodayChallenge(idUser);

    if (!result) {
      return res.json({ challenge: null });
    }

    // Combinar challenge y progress en un solo objeto
    const challengeData = {
      id_challenge: result.challenge.id_challenge,
      challenge_date: result.challenge.challenge_date,
      title: result.challenge.title,
      description: result.challenge.description,
      challenge_type: result.challenge.challenge_type,
      target_value: result.challenge.target_value,
      target_unit: result.challenge.target_unit,
      tokens_reward: result.challenge.tokens_reward,
      difficulty: result.challenge.difficulty,
      progress: result.progress?.current_value || 0,
      completed: result.progress?.status === 'COMPLETED'
    };

    res.json({ challenge: challengeData });
  } catch (err) {
    res.status(400).json({ error: { code: 'GET_TODAY_CHALLENGE_FAILED', message: err.message } });
  }
};

// PUT /api/challenges/:id/progress
const updateProgress = async (req, res) => {
  try {
    const idUser = req.user.id_user_profile;
    const id = Number.parseInt(req.params.id, 10);
    const { value } = req.body || {};
    if (!Number.isInteger(id)) return res.status(400).json({ error: { code: 'INVALID_ID', message: 'ID inválido' } });
    if (value == null) return res.status(400).json({ error: { code: 'MISSING_VALUE', message: 'Falta value' } });

    const progress = await challengeService.updateProgress(idUser, id, value);
    res.json({
      progress: progress.progress,
      completed: progress.completed,
      tokens_earned: progress.tokens_earned
    });
  } catch (err) {
    res.status(400).json({ error: { code: err.code || 'UPDATE_PROGRESS_FAILED', message: err.message } });
  }
};

module.exports = { getToday, updateProgress };

