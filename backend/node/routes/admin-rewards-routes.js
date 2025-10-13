const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin-rewards-controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * /api/admin/rewards/stats:
 *   get:
 *     summary: Obtener estadísticas globales de recompensas
 *     tags: [Admin - Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas globales de recompensas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_rewards:
 *                   type: integer
 *                   description: Total de recompensas en el sistema
 *                 total_claimed:
 *                   type: integer
 *                   description: Total de recompensas canjeadas
 *                 total_available:
 *                   type: integer
 *                   description: Total de recompensas disponibles
 *                 tokens_spent:
 *                   type: integer
 *                   description: Total de tokens gastados en recompensas
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de admin
 */
router.get('/rewards/stats', verificarToken, verificarAdmin, controller.getGlobalRewardStats);

/**
 * @swagger
 * /api/admin/gyms/{gymId}/rewards/summary:
 *   get:
 *     summary: Obtener resumen de recompensas de un gimnasio específico
 *     tags: [Admin - Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gymId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gimnasio
 *     responses:
 *       200:
 *         description: Resumen de recompensas del gimnasio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gym_id:
 *                   type: integer
 *                 total_rewards:
 *                   type: integer
 *                 active_rewards:
 *                   type: integer
 *                 total_claimed:
 *                   type: integer
 *                 tokens_earned:
 *                   type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de admin
 *       404:
 *         description: Gimnasio no encontrado
 */
router.get('/gyms/:gymId/rewards/summary', verificarToken, verificarAdmin, controller.getGymRewardStats);

module.exports = router;
