const templateService = require('../services/template-service');

// POST /api/admin/routines/templates
const createTemplate = async (req, res) => {
  try {
    const { routine_name, description, recommended_for, template_order, days, exercises } = req.body || {};
    const routine = await templateService.createTemplate({ routine_name, description, recommended_for, template_order, days, exercises });
    res.status(201).json({ id_routine: routine.id_routine, routine_name: routine.routine_name });
  } catch (err) {
    res.status(400).json({ error: { code: 'CREATE_TEMPLATE_FAILED', message: err.message } });
  }
};

// GET /api/admin/routines/templates
const listTemplates = async (req, res) => {
  try {
    const { difficulty, limit, offset } = req.query;
    const templates = await templateService.listTemplates({ difficulty, limit: limit ? parseInt(limit, 10) : 50, offset: offset ? parseInt(offset, 10) : 0 });
    res.json({ templates });
  } catch (err) {
    res.status(400).json({ error: { code: 'LIST_TEMPLATES_FAILED', message: err.message } });
  }
};

// PUT /api/admin/routines/templates/:id
const updateTemplateMeta = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: { code: 'INVALID_ID', message: 'ID inválido' } });
    const routine = await templateService.updateTemplateMeta(id, req.body || {});
    res.json({ id_routine: routine.id_routine, routine_name: routine.routine_name, recommended_for: routine.recommended_for, template_order: routine.template_order });
  } catch (err) {
    res.status(400).json({ error: { code: 'UPDATE_TEMPLATE_FAILED', message: err.message } });
  }
};

// DELETE /api/admin/routines/templates/:id
const deleteTemplate = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: { code: 'INVALID_ID', message: 'ID inválido' } });
    await templateService.deleteTemplate(id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: { code: 'DELETE_TEMPLATE_FAILED', message: err.message } });
  }
};

module.exports = { createTemplate, listTemplates, updateTemplateMeta, deleteTemplate };

