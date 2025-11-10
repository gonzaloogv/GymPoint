/**
 * Reward Routes - Lote 5
 * Rutas para gestión de recompensas y canjes
 */

const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/reward-controller');
const { verificarToken, verificarUsuarioApp, verificarAdmin } = require('../middlewares/auth');

// ============================================================================
// REWARDS - Public and Admin
// ============================================================================

/**
 * GET /api/rewards
 * Lista recompensas disponibles (públicas o filtradas)
 */
router.get('/', rewardController.listRewards);

/**
 * POST /api/rewards
 * Crea una nueva recompensa (admin)
 */
router.post('/', verificarToken, verificarAdmin, rewardController.createReward);

// ============================================================================
// RUTAS MÁS ESPECÍFICAS PRIMERO (antes de /:rewardId)
// ============================================================================

/**
 * POST /api/rewards/:rewardId/claim
 * Canjea una recompensa por tokens
 */
router.post('/:rewardId/claim', verificarToken, verificarUsuarioApp, rewardController.claimReward);

/**
 * GET /api/rewards/:rewardId/codes
 * Lista códigos de una recompensa (admin)
 */
router.get('/:rewardId/codes', verificarToken, verificarAdmin, rewardController.listRewardCodes);

/**
 * POST /api/rewards/:rewardId/codes
 * Crea un código de recompensa (admin)
 */
router.post('/:rewardId/codes', verificarToken, verificarAdmin, rewardController.createRewardCode);

// ============================================================================
// RUTAS GENÉRICAS CON PARÁMETROS (al final)
// ============================================================================

/**
 * GET /api/rewards/:rewardId
 * Obtiene una recompensa específica
 */
router.get('/:rewardId', rewardController.getReward);

/**
 * PUT /api/rewards/:rewardId
 * Actualiza una recompensa (admin)
 */
router.put('/:rewardId', verificarToken, verificarAdmin, rewardController.updateReward);

/**
 * DELETE /api/rewards/:rewardId
 * Elimina una recompensa (admin)
 */
router.delete('/:rewardId', verificarToken, verificarAdmin, rewardController.deleteReward);

module.exports = router;
