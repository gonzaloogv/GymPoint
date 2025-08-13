const express = require('express');
const router = express.Router();
const controller = require('../controllers/reward-controller');
const { verificarToken, verificarRol } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { z } = require('zod');

const canjearSchema = z.object({
  id_reward: z.number(),
  id_gym: z.number(),
});

const crearSchema = z.object({
  name: z.string(),
  description: z.string(),
  cost_tokens: z.number(),
  type: z.string(),
  stock: z.number(),
  start_date: z.string(),
  finish_date: z.string(),
});

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
 * /api/rewards/canjear:
 *   post:
 *     summary: Canjear una recompensa por tokens
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
 *                 example: 2
 *               id_gym:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Recompensa canjeada con éxito y código generado
 *       400:
 *         description: Tokens insuficientes o recompensa no disponible
 */
router.post('/canjear', verificarToken, validate(canjearSchema), controller.canjearRecompensa);

/**
 * @swagger
 * /api/rewards/me/historial:
 *   get:
 *     summary: Obtener el historial de recompensas canjeadas por el usuario autenticado
 *     tags: [Recompensas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de recompensas canjeadas con fecha y descripción
 */
router.get('/me/historial', verificarToken, controller.obtenerHistorialRecompensas);

/**
 * @swagger
 * /api/rewards/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de recompensas más canjeadas
 *     tags: [Recompensas]
 *     responses:
 *       200:
 *         description: Lista de recompensas con cantidad de canjeos
 */
router.get('/estadisticas', controller.obtenerEstadisticasDeRecompensas);

/**
 * @swagger
 * /api/rewards:
 *   post:
 *     summary: Crear una nueva recompensa (solo admin)
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
 *               description:
 *                 type: string
 *               cost_tokens:
 *                 type: integer
 *               type:
 *                 type: string
 *                 example: descuento
 *               stock:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-06-01
 *               finish_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-12-31
 *     responses:
 *       201:
 *         description: Recompensa creada correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/',
  verificarToken,
  verificarRol('ADMIN'),
  validate(crearSchema),
  controller.crearRecompensa
);
module.exports = router;
