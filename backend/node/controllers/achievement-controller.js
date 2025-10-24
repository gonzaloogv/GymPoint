const achievementService = require('../services/achievement-service');
const { processUnlockResults } = require('../services/achievement-side-effects');
const { ValidationError } = require('../utils/errors');

const buildAchievementResponse = (entries) => {
  return entries.map((entry) => {
    const { definition, progress, unlocked, unlocked_at, last_source_type, last_source_id } = entry;

    return {
      id: definition.id_achievement_definition,
      code: definition.code,
      name: definition.name,
      description: definition.description,
      category: definition.category,
      metric_type: definition.metric_type,
      target_value: definition.target_value,
      icon_url: definition.icon_url,
      is_active: definition.is_active,
      metadata: definition.metadata,
      progress,
      unlocked,
      unlocked_at,
      last_source_type,
      last_source_id
    };
  });
};

const getMyAchievements = async (req, res, next) => {
  try {
    const idUserProfile = req.user.id_user_profile;
    const { category } = req.query;

    const entries = await achievementService.getUserAchievements(idUserProfile, { category });
    res.json({
      data: buildAchievementResponse(entries)
    });
  } catch (error) {
    next(error);
  }
};

const syncMyAchievements = async (req, res, next) => {
  try {
    const idUserProfile = req.user.id_user_profile;
    const { category } = req.body || {};

    const results = await achievementService.syncAllAchievementsForUser(idUserProfile, { category });
    const unlockedNow = await processUnlockResults(idUserProfile, results);

    const entries = await achievementService.getUserAchievements(idUserProfile, { category });

    res.json({
      message: 'Logros sincronizados',
      data: buildAchievementResponse(entries),
      unlocked: unlockedNow
    });
  } catch (error) {
    next(error);
  }
};

const listDefinitions = async (req, res, next) => {
  try {
    const { category, includeInactive } = req.query;
    const definitions = await achievementService.getDefinitions({
      category,
      includeInactive: includeInactive === 'true'
    });

    res.json({
      data: definitions
    });
  } catch (error) {
    next(error);
  }
};

const getDefinitionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const definitionId = Number(id);
    if (Number.isNaN(definitionId)) {
      throw new ValidationError('ID inválido');
    }
    const definition = await achievementService.getDefinitionById(definitionId);
    if (!definition) {
      return res.status(404).json({
        error: {
          code: 'ACHIEVEMENT_NOT_FOUND',
          message: 'Logro no encontrado'
        }
      });
    }
    res.json({
      data: definition
    });
  } catch (error) {
    next(error);
  }
};

const createDefinition = async (req, res, next) => {
  try {
    const definition = await achievementService.createDefinition(req.body);
    res.status(201).json({
      message: 'Logro creado con éxito',
      data: definition
    });
  } catch (error) {
    next(error);
  }
};

const updateDefinition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const definitionId = Number(id);
    if (Number.isNaN(definitionId)) {
      throw new ValidationError('ID inválido');
    }
    const definition = await achievementService.updateDefinition(definitionId, req.body);
    res.json({
      message: 'Logro actualizado con éxito',
      data: definition
    });
  } catch (error) {
    next(error);
  }
};

const deleteDefinition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const definitionId = Number(id);
    if (Number.isNaN(definitionId)) {
      throw new ValidationError('ID inválido');
    }
    await achievementService.deleteDefinition(definitionId);
    res.json({
      message: 'Logro eliminado con éxito'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyAchievements,
  syncMyAchievements,
  listDefinitions,
  createDefinition,
  updateDefinition,
  deleteDefinition
};
