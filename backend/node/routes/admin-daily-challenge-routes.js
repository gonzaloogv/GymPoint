const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin-daily-challenge-controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth');

router.use(verificarToken, verificarAdmin);

// Daily challenges
router.get('/templates', controller.listTemplates);
router.post('/templates', controller.createTemplate);
router.put('/templates/:id', controller.updateTemplate);
router.delete('/templates/:id', controller.deleteTemplate);

// Config and utilities
router.get('/config/settings', controller.getConfig);
router.put('/config/settings', controller.updateConfig);
router.post('/actions/run', controller.forceRotation);

// Daily challenges CRUD
router.get('/', controller.listChallenges);
router.post('/', controller.createChallenge);
router.get('/:id', controller.getChallenge);
router.put('/:id', controller.updateChallenge);
router.delete('/:id', controller.deleteChallenge);

module.exports = router;
