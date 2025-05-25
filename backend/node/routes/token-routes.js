const express = require('express');
const router = express.Router();
const controller = require('../controllers/token-controller');

/**
 * @swagger
 * /api/tokens/ganar:
 *   post:
 *     summary: Otorgar tokens a un usuario
 *     tags: [Tokens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_user, amount, motivo]
 *             properties:
 *               id_user:
 *                 type: integer
 *                 example: 1
 *               amount:
 *                 type: integer
 *                 example: 50
 *               motivo:
 *                 type: string
 *                 example: "Premio por asistencia semanal"
 *     responses:
 *       200:
 *         description: Tokens otorgados correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/ganar', controller.otorgarTokens);

/**
 * @swagger
 * /api/tokens/saldo/{id_user}:
 *   get:
 *     summary: Obtener resumen del saldo de tokens y estadísticas
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: id_user
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Detalle del saldo de tokens y estadísticas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_user:
 *                   type: integer
 *                 tokens_actuales:
 *                   type: integer
 *                 total_ganados:
 *                   type: integer
 *                 total_gastados:
 *                   type: integer
 *                 canjes_realizados:
 *                   type: integer
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/saldo/:id_user', controller.obtenerResumenTokens);

module.exports = router;
