const express = require('express');
const router = express.Router();
const controller = require('../controllers/reward-controller');
const { verificarToken, verificarUsuarioApp, verificarAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * /api/rewards:
 *   get:
 *     summary: Listar recompensas disponibles para canjear
 *     tags: [Recompensas]
 *     responses:
 *       200:
 *         description: Lista de recompensas activas y en stock
 */
router.get('/', controller.listarRecompensas);

/**
 * @swagger
 * /api/rewards/redeem:
 *   post:
 *     summary: Canjear una recompensa por tokens
 *     description: Canjea tokens del usuario por una recompensa. Se genera un código único.
 *     tags: [Recompensas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_reward, id_gym]
 *             properties:
 *               id_reward:
 *                 type: integer
 *                 description: ID de la recompensa a canjear
 *                 example: 2
 *               id_gym:
 *                 type: integer
 *                 description: ID del gimnasio donde se canjeará
 *                 example: 3
 *     responses:
 *       201:
 *         description: Recompensa canjeada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Recompensa canjeada con éxito
 *                 data:
 *                   type: object
 *                   properties:
 *                     claimed:
 *                       type: object
 *                     codigo:
 *                       type: string
 *                       example: ABC123XYZ
 *                     nuevo_saldo:
 *                       type: integer
 *                       example: 100
 *       400:
 *         description: Tokens insuficientes o recompensa no disponible
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: REDEEM_REWARD_FAILED
 *                     message:
 *                       type: string
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.post('/redeem', verificarToken, verificarUsuarioApp, controller.canjearRecompensa);

/**
 * @swagger
 * /api/rewards/me:
 *   get:
 *     summary: Obtener el historial de recompensas canjeadas
 *     description: Retorna todas las recompensas que el usuario ha canjeado
 *     tags: [Recompensas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial obtenido con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.get('/me', verificarToken, verificarUsuarioApp, controller.obtenerHistorialRecompensas);

/**
 * @swagger
 * /api/rewards/stats:
 *   get:
 *     summary: Obtener estadísticas de recompensas más canjeadas (Admin)
 *     tags: [Recompensas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de administrador
 */
router.get('/stats', verificarToken, verificarAdmin, controller.obtenerEstadisticasDeRecompensas);

/**
 * @swagger
 * /api/rewards:
 *   post:
 *     summary: Crear una nueva recompensa (Admin)
 *     description: Permite a un administrador crear una nueva recompensa para el sistema
 *     tags: [Recompensas]
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
 *                 example: Pase 1 día gratis
 *               description:
 *                 type: string
 *                 example: Acceso completo al gimnasio por 1 día
 *               cost_tokens:
 *                 type: integer
 *                 example: 50
 *               type:
 *                 type: string
 *                 example: descuento
 *               stock:
 *                 type: integer
 *                 example: 100
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-10-01
 *               finish_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-12-31
 *     responses:
 *       201:
 *         description: Recompensa creada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: CREATE_REWARD_FAILED
 *                     message:
 *                       type: string
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de administrador
 */
router.post('/', verificarToken, verificarAdmin, controller.crearRecompensa);

module.exports = router;