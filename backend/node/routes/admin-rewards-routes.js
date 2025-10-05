const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin-rewards-controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth');

router.get('/rewards/stats', verificarToken, verificarAdmin, controller.getGlobalRewardStats);
router.get('/gyms/:gymId/rewards/summary', verificarToken, verificarAdmin, controller.getGymRewardStats);

module.exports = router;
