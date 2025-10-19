const adminDailyChallengeService = require('../services/admin-daily-challenge-service');

const parsePagination = (req) => {
  const limit = req.query.limit ? Math.min(parseInt(req.query.limit, 10) || 20, 100) : 50;
  const offset = req.query.offset ? Math.max(parseInt(req.query.offset, 10) || 0, 0) : 0;
  return { limit, offset };
};

const listChallenges = async (req, res) => {
  try {
    const { from, to, include_inactive } = req.query;
    const challenges = await adminDailyChallengeService.listChallenges({
      from,
      to,
      includeInactive: include_inactive === 'true'
    });
    res.json({ data: challenges });
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'LIST_CHALLENGES_FAILED',
        message: error.message
      }
    });
  }
};

const getChallenge = async (req, res) => {
  try {
    const challenge = await adminDailyChallengeService.getChallengeById(Number(req.params.id));
    if (!challenge) {
      return res.status(404).json({
        error: {
          code: 'CHALLENGE_NOT_FOUND',
          message: 'Desafío no encontrado'
        }
      });
    }
    res.json({ data: challenge });
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'GET_CHALLENGE_FAILED',
        message: error.message
      }
    });
  }
};

const createChallenge = async (req, res) => {
  try {
    const challenge = await adminDailyChallengeService.createChallenge(req.body, {
      createdBy: req.user?.id_user_profile || null
    });
    res.status(201).json({ message: 'Desafío creado', data: challenge });
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'CREATE_CHALLENGE_FAILED',
        message: error.message
      }
    });
  }
};

const updateChallenge = async (req, res) => {
  try {
    const challenge = await adminDailyChallengeService.updateChallenge(Number(req.params.id), req.body);
    res.json({ message: 'Desafío actualizado', data: challenge });
  } catch (error) {
    res.status(error.message === 'Desafío no encontrado' ? 404 : 400).json({
      error: {
        code: 'UPDATE_CHALLENGE_FAILED',
        message: error.message
      }
    });
  }
};

const deleteChallenge = async (req, res) => {
  try {
    await adminDailyChallengeService.deleteChallenge(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(error.message.includes('no encontrado') ? 404 : 400).json({
      error: {
        code: 'DELETE_CHALLENGE_FAILED',
        message: error.message
      }
    });
  }
};

const listTemplates = async (req, res) => {
  try {
    const templates = await adminDailyChallengeService.listTemplates();
    res.json({ data: templates });
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'LIST_TEMPLATES_FAILED',
        message: error.message
      }
    });
  }
};

const createTemplate = async (req, res) => {
  try {
    const template = await adminDailyChallengeService.createTemplate(req.body, {
      createdBy: req.user?.id_user_profile || null
    });
    res.status(201).json({ message: 'Plantilla creada', data: template });
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'CREATE_TEMPLATE_FAILED',
        message: error.message
      }
    });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const template = await adminDailyChallengeService.updateTemplate(Number(req.params.id), req.body);
    res.json({ message: 'Plantilla actualizada', data: template });
  } catch (error) {
    res.status(error.message.includes('no encontrada') ? 404 : 400).json({
      error: {
        code: 'UPDATE_TEMPLATE_FAILED',
        message: error.message
      }
    });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    await adminDailyChallengeService.deleteTemplate(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'DELETE_TEMPLATE_FAILED',
        message: error.message
      }
    });
  }
};

const getConfig = async (req, res) => {
  try {
    const config = await adminDailyChallengeService.getConfig();
    res.json({ data: config });
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'GET_CHALLENGE_CONFIG_FAILED',
        message: error.message
      }
    });
  }
};

const updateConfig = async (req, res) => {
  try {
    const config = await adminDailyChallengeService.updateConfig(req.body);
    res.json({ message: 'Configuración actualizada', data: config });
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'UPDATE_CHALLENGE_CONFIG_FAILED',
        message: error.message
      }
    });
  }
};

const forceRotation = async (req, res) => {
  try {
    const challenge = await adminDailyChallengeService.runAutoGeneration();
    res.json({
      message: challenge ? 'Desafío generado' : 'No se generó ningún desafío (rotación deshabilitada o sin plantillas)',
      data: challenge
    });
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'FORCE_ROTATION_FAILED',
        message: error.message
      }
    });
  }
};

module.exports = {
  listChallenges,
  getChallenge,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getConfig,
  updateConfig,
  forceRotation
};


