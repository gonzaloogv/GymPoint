/**
 * Claimed Reward Routes - Lote 5
 * Rutas para gestión de recompensas canjeadas
 */

const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/reward-controller');
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');

// ============================================================================
// CLAIMED REWARDS
// ============================================================================

/**
 * GET /api/claimed-rewards/:claimedRewardId
 * Obtiene una recompensa canjeada específica
 */
router.get('/:claimedRewardId', verificarToken, verificarUsuarioApp, rewardController.getClaimedReward);

/**
 * POST /api/claimed-rewards/:claimedRewardId/use
 * Marca una recompensa canjeada como usada
 */
router.post('/:claimedRewardId/use', verificarToken, verificarUsuarioApp, rewardController.markClaimedRewardAsUsed);

module.exports = router;
