const express = require('express');
const router = express.Router();
const controller = require('../controllers/achievement-controller');
const { verificarToken, verificarUsuarioApp, verificarAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * /api/achievements/me:
 *   get:
 *     summary: Listar los logros del usuario autenticado
 *     tags: [Logros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría de logro (STREAK, CHALLENGE, etc.)
 *     responses:
 *       200:
 *         description: Lista de logros con su progreso
 */
router.get(
  '/me',
  verificarToken,
  verificarUsuarioApp,
  controller.getMyAchievements
);

/**
 * @swagger
 * /api/achievements/sync:
 *   post:
 *     summary: Recalcular los logros del usuario
 *     tags: [Logros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 description: Si se especifica, recalcula sólo esa categoría
 *     responses:
 *       200:
 *         description: Logros recalculados
 */
router.post(
  '/sync',
  verificarToken,
  verificarUsuarioApp,
  controller.syncMyAchievements
);

/**
 * @swagger
 * /api/achievements/{id}/unlock:
 *   post:
 *     summary: Desbloquear un logro manualmente cuando se alcanza el 100%
 *     tags: [Logros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del AchievementDefinition a desbloquear (no el user_achievement ID)
 *     responses:
 *       200:
 *         description: Logro desbloqueado exitosamente
 *       400:
 *         description: ID inválido o progreso insuficiente
 *       404:
 *         description: Logro no encontrado
 *       409:
 *         description: El logro ya está desbloqueado
 */
router.post(
  '/:id/unlock',
  verificarToken,
  verificarUsuarioApp,
  controller.unlockMyAchievement
);

/**
 * @swagger
 * /api/achievements/definitions:
 *   get:
 *     summary: Listar definiciones de logros (Admin)
 *     tags: [Logros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Definiciones de logros
 */
router.use('/definitions', verificarToken, verificarAdmin);

router.get('/definitions', controller.listDefinitions);

/**
 * @swagger
 * /api/achievements/definitions/{id}:
 *   get:
 *     summary: Obtener una definición de logro por ID (Admin)
 *     tags: [Logros]
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
 *         description: Definición de logro
 *       404:
 *         description: Logro no encontrado
 */
router.get('/definitions/:id', controller.getDefinitionById);

/**
 * @swagger
 * /api/achievements/definitions:
 *   post:
 *     summary: Crear una nueva definición de logro (Admin)
 *     tags: [Logros]
 *     security:
 *       - bearerAuth: []
 */
router.post('/definitions', controller.createDefinition);
/**
 * @swagger
 * /api/achievements/definitions/{id}:
 *   put:
 *     summary: Actualizar una definición de logro (Admin)
 *     tags: [Logros]
 *     security:
 *       - bearerAuth: []
 */
router.put('/definitions/:id', controller.updateDefinition);
/**
 * @swagger
 * /api/achievements/definitions/{id}:
 *   delete:
 *     summary: Eliminar una definición de logro (Admin)
 *     tags: [Logros]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/definitions/:id', controller.deleteDefinition);

module.exports = router;
