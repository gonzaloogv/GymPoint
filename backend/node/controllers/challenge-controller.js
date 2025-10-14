const challengeService = require('../services/challenge-service');

// GET /api/challenges/today
const getToday = async (req, res) => {
  try {
    const idUser = req.user.id_user_profile;
    const challenge = await challengeService.getTodayChallenge(idUser);
    res.json({ challenge });
  } catch (err) {
    res.status(400).json({ error: { code: 'GET_TODAY_CHALLENGE_FAILED', message: err.message } });
  }
};

// PUT /api/challenges/:id/progress
const updateProgress = async (req, res) => {
  try {
    const idUser = req.user.id_user_profile;
    const id = parseInt(req.params.id, 10);
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

