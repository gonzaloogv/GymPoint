const express = require('express');
const router = express.Router();
const controller = require('../controllers/token-controller');
const { verificarToken, verificarRol } = require('../middlewares/auth');

/**
 * @swagger
 * /api/tokens/ganar:
 *   post:
 *     summary: ADMIN - Otorgar tokens a un usuario
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
 *               motive:
 *                 type: string
 *                 example: "Premio por asistencia semanal"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tokens otorgados correctamente
 *       403:
 *         description: Solo administradores pueden otorgar tokens
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/ganar', verificarToken, verificarRol('ADMIN'), controller.otorgarTokens);

/**
 * @swagger
 * /api/tokens/me/saldo:
 *   get:
 *     summary: Obtener resumen del saldo de tokens y estadísticas
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalle del saldo de tokens y estadísticas
 */
router.get('/me/saldo', verificarToken, controller.obtenerResumenTokens);

module.exports = router;
