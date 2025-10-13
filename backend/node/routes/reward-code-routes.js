const express = require('express');
const router = express.Router();
const controller = require('../controllers/reward-code-controller');
const { verificarToken, verificarAdmin, verificarUsuarioApp, requireRole } = require('../middlewares/auth');

/**
 * @swagger
 * /api/reward-codes/estadisticas/gimnasios:
 *   get:
 *     summary: Obtener cantidad de códigos generados por gimnasio (Solo Admin)
 *     tags: [Códigos de Recompensa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de códigos por gimnasio
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Requiere permisos de administrador
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
 *                       example: FORBIDDEN
 *                     message:
 *                       type: string
 *                       example: Insufficient role
 */
router.get('/estadisticas/gimnasios', verificarToken, requireRole('ADMIN'), controller.obtenerEstadisticasPorGimnasio);

/**
 * @swagger
 * /api/reward-codes/{id_code}/usar:
 *   put:
 *     summary: Marcar un código de recompensa como usado
 *     tags: [Códigos de Recompensa]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_code
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del código de recompensa
 *     responses:
 *       200:
 *         description: Código marcado como usado correctamente
 *       400:
 *         description: Código inválido, expirado o ya usado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.put('/:id_code/usar', verificarToken, verificarUsuarioApp, controller.marcarComoUsado);

/**
 * @swagger
 * /api/reward-codes/me/activos:
 *   get:
 *     summary: Obtener códigos de recompensa activos del usuario autenticado
 *     tags: [Códigos de Recompensa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de códigos activos y vigentes
 *       401:
 *         description: Token no válido o no proporcionado
 */
router.get('/me/activos', verificarToken, controller.obtenerCodigosActivos);

/**
 * @swagger
 * /api/reward-codes/me/expirados:
 *   get:
 *     summary: Obtener códigos de recompensa expirados o ya utilizados
 *     tags: [Códigos de Recompensa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de códigos expirados o utilizados
 *       401:
 *         description: Token no válido o no proporcionado
 */
router.get('/me/expirados', verificarToken, controller.obtenerCodigosExpirados);

/**
 * @swagger
 * /api/reward-codes/me:
 *   get:
 *     summary: Obtener todos los códigos de recompensa del usuario autenticado
 *     tags: [Códigos de Recompensa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de códigos de recompensa
 *       401:
 *         description: Token no válido o no proporcionado
 */
router.get('/me', verificarToken, controller.obtenerCodigosPorUsuario);

module.exports = router;