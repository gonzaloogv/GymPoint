const express = require('express');
const router = express.Router();
const controller = require('../controllers/reward-controller');

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_user, id_reward, id_gym]
 *             properties:
 *               id_user:
 *                 type: integer
 *                 example: 1
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
router.post('/canjear', controller.canjearRecompensa);

/**
 * @swagger
 * /api/rewards/historial/{id_user}:
 *   get:
 *     summary: Obtener el historial de recompensas canjeadas por un usuario
 *     tags: [Recompensas]
 *     parameters:
 *       - in: path
 *         name: id_user
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de recompensas canjeadas con fecha y descripción
 */
router.get('/historial/:id_user', controller.obtenerHistorialRecompensas);

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

module.exports = router;
