const express = require('express');
const router = express.Router();
const controller = require('../controllers/token-controller');
const { verificarToken, verificarRol, verificarUsuarioApp } = require('../middlewares/auth');

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
 *             required: [id_user, amount, motive]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: integer
 *                   description: Balance actual de tokens
 *                   example: 150
 *                 total_earned:
 *                   type: integer
 *                   description: Total de tokens ganados
 *                   example: 200
 *                 total_spent:
 *                   type: integer
 *                   description: Total de tokens gastados
 *                   example: 50
 *                 total_movements:
 *                   type: integer
 *                   description: Número total de movimientos
 *                   example: 15
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/me/saldo', verificarToken, verificarUsuarioApp, controller.obtenerResumenTokens);

/**
 * @swagger
 * components:
 *   schemas:
 *     TokenLedgerEntry:
 *       type: object
 *       properties:
 *         id_ledger:
 *           type: integer
 *           description: ID único del movimiento
 *           example: 1
 *         id_user_profile:
 *           type: integer
 *           description: ID del perfil de usuario
 *           example: 123
 *         delta:
 *           type: integer
 *           description: Cantidad de tokens (positivo=ganancia, negativo=gasto)
 *           example: 10
 *         reason:
 *           type: string
 *           description: Motivo del movimiento
 *           enum: [ATTENDANCE, ROUTINE_COMPLETE, REWARD_CLAIM, WEEKLY_BONUS, ADMIN_ADJUSTMENT, STREAK_RECOVERY]
 *           example: ATTENDANCE
 *         ref_type:
 *           type: string
 *           description: Tipo de referencia asociada
 *           nullable: true
 *           example: assistance
 *         ref_id:
 *           type: integer
 *           description: ID de la referencia asociada
 *           nullable: true
 *           example: 456
 *         balance_after:
 *           type: integer
 *           description: Balance después del movimiento
 *           example: 110
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora del movimiento
 *           example: "2025-10-07T18:30:00.000Z"
 */

module.exports = router;
