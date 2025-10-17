const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin-rewards-controller');
const rewardController = require('../controllers/reward-controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * /api/admin/rewards/all:
 *   get:
 *     summary: Listar todas las recompensas (Admin)
 *     description: Obtiene todas las recompensas sin filtros de disponibilidad
 *     tags: [Admin - Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las recompensas
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de administrador
 */
router.get('/rewards/all', (req, res, next) => {
  console.log('🎯 [ADMIN-REWARDS] Petición recibida en /admin/rewards/all');
  next();
}, verificarToken, verificarAdmin, rewardController.listarTodasLasRecompensas);

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
 * /api/admin/gyms/{id_gym}/rewards/summary:
 *   get:
 *     summary: Obtener resumen de recompensas de un gimnasio específico
 *     tags: [Admin - Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_gym
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
router.get('/gyms/:id_gym/rewards/summary', verificarToken, verificarAdmin, controller.getGymRewardStats);

/**
 * @swagger
 * /api/admin/rewards/{id}:
 *   get:
 *     summary: Obtener una recompensa por ID
 *     tags: [Admin - Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recompensa encontrada
 *       404:
 *         description: Recompensa no encontrada
 */
router.get('/rewards/:id', verificarToken, verificarAdmin, rewardController.obtenerRecompensaPorId);

/**
 * @swagger
 * /api/admin/rewards:
 *   post:
 *     summary: Crear una nueva recompensa
 *     tags: [Admin - Rewards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, cost_tokens, type, stock, start_date, finish_date]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               cost_tokens:
 *                 type: integer
 *               type:
 *                 type: string
 *               stock:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date
 *               finish_date:
 *                 type: string
 *                 format: date
 *               available:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Recompensa creada con éxito
 */
router.post('/rewards', verificarToken, verificarAdmin, rewardController.crearRecompensa);

/**
 * @swagger
 * /api/admin/rewards/{id}:
 *   put:
 *     summary: Actualizar una recompensa
 *     tags: [Admin - Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Recompensa actualizada
 *       404:
 *         description: Recompensa no encontrada
 */
router.put('/rewards/:id', verificarToken, verificarAdmin, rewardController.actualizarRecompensa);

/**
 * @swagger
 * /api/admin/rewards/{id}:
 *   delete:
 *     summary: Eliminar una recompensa
 *     tags: [Admin - Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recompensa eliminada con éxito
 *       404:
 *         description: Recompensa no encontrada
 */
router.delete('/rewards/:id', verificarToken, verificarAdmin, rewardController.eliminarRecompensa);

module.exports = router;
