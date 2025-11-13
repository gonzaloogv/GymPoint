const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/reward-controller');
const adminRewardsController = require('../controllers/admin-rewards-controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth');

router.use(verificarToken, verificarAdmin);

// Alias legacy: /api/admin/rewards/all
router.get('/all', rewardController.listarTodasLasRecompensas);

// GET /api/admin/rewards
router.get('/', rewardController.listarTodasLasRecompensas);

// GET /api/admin/rewards/stats (Top rewards)
router.get('/stats', rewardController.obtenerEstadisticasDeRecompensas);

// GET /api/admin/rewards/summary?from=&to=
router.get('/summary', adminRewardsController.getGlobalRewardStats);

// GET /api/admin/rewards/gyms/:id_gym/summary?from=&to=
router.get('/gyms/:id_gym/summary', adminRewardsController.getGymRewardStats);

// GET /api/admin/rewards/:id
router.get('/:id', rewardController.obtenerRecompensaPorId);

// POST /api/admin/rewards
router.post('/', rewardController.crearRecompensa);

// PUT /api/admin/rewards/:id
router.put('/:id', rewardController.actualizarRecompensa);

// DELETE /api/admin/rewards/:id
router.delete('/:id', rewardController.eliminarRecompensa);

module.exports = router;

