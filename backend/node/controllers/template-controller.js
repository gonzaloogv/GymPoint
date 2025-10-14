const templateService = require('../services/template-service');

// GET /api/routines/templates
const getTemplates = async (req, res) => {
  try {
    const { difficulty = 'BEGINNER', limit } = req.query;
    const lim = limit ? parseInt(limit, 10) : 5;
    const routines = await templateService.getRecommendedRoutines(difficulty, lim);
    res.json({ routines });
  } catch (err) {
    res.status(400).json({ error: { code: 'GET_TEMPLATES_FAILED', message: err.message } });
  }
};

// POST /api/routines/:id/import
const importTemplate = async (req, res) => {
  try {
    const idUser = req.user.id_user_profile;
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: { code: 'INVALID_ID', message: 'ID inválido' } });

    const copy = await templateService.importTemplate(idUser, id);
    res.status(201).json({ id_routine_copy: copy.id_routine, routine: copy });
  } catch (err) {
    res.status(400).json({ error: { code: 'IMPORT_TEMPLATE_FAILED', message: err.message } });
  }
};

module.exports = { getTemplates, importTemplate };

