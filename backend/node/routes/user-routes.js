const express = require('express');
const router = express.Router();
const controller = require('../controllers/user-controller');
const bodyMetricsRoutes = require('./body-metrics-routes');
const notificationRoutes = require('./notification-routes');
const { verificarToken, verificarAdmin, verificarUsuarioApp } = require('../middlewares/auth');

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obtener el perfil del usuario autenticado
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_user:
 *                   type: integer
 *                   example: 7
 *                 name:
 *                   type: string
 *                   example: Gonzalo
 *                 lastname:
 *                   type: string
 *                   example: Gómez
 *                 email:
 *                   type: string
 *                   example: gonzalo@test.com
 *                 gender:
 *                   type: string
 *                   example: M
 *                 locality:
 *                   type: string
 *                   example: Resistencia
 *                 birth_date:
 *                   type: string
 *                   format: date
 *                   example: 2002-04-15
 *                 role:
 *                   type: string
 *                   example: USER
 *                 tokens:
 *                   type: integer
 *                   example: 120
 *       401:
 *         description: Token inválido o no enviado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/me', verificarToken, verificarUsuarioApp, controller.obtenerPerfil);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Actualizar los datos del perfil del usuario autenticado
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gonzalo
 *               lastname:
 *                 type: string
 *                 example: Gómez
 *               gender:
 *                 type: string
 *                 example: M
 *               locality:
 *                 type: string
 *                 example: Resistencia
 *               birth_date:
 *                 type: string
 *                 format: date
 *                 example: 2002-04-15
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       401:
 *         description: Token inválido o no enviado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/me', verificarToken, verificarUsuarioApp, controller.actualizarPerfil);

/**
 * @swagger
 * /api/users/me/email:
 *   put:
 *     summary: Actualizar email del usuario autenticado
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nuevo@example.com
 *     responses:
 *       200:
 *         description: Email actualizado correctamente
 *       400:
 *         description: Email inválido o ya en uso
 *       401:
 *         description: No autorizado
 */
router.put('/me/email', verificarToken, verificarUsuarioApp, controller.actualizarEmail);

/**
 * @swagger
 * /api/users/me/change-password:
 *   post:
 *     summary: Cambiar contraseña del usuario autenticado
 *     description: |
 *       Permite cambiar la contraseña del usuario desde su perfil.
 *       - Solo funciona para cuentas con auth_provider 'local'
 *       - Requiere la contraseña actual para validar identidad
 *       - Revoca todas las sesiones activas por seguridad
 *       - Envía email de confirmación
 *       - La nueva contraseña debe ser diferente a la actual
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Contraseña actual del usuario
 *                 example: miPassword123
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña (mínimo 6 caracteres)
 *                 example: nuevaPassword456
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmación de la nueva contraseña
 *                 example: nuevaPassword456
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Contraseña actualizada exitosamente. Se han cerrado todas tus sesiones activas por seguridad.
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
 *                       enum: [MISSING_CURRENT_PASSWORD, MISSING_NEW_PASSWORD, MISSING_CONFIRM_PASSWORD, PASSWORD_MISMATCH, WEAK_PASSWORD, SAME_AS_CURRENT, GOOGLE_ACCOUNT, INVALID_DATA]
 *                       example: PASSWORD_MISMATCH
 *                     message:
 *                       type: string
 *                       example: La nueva contraseña y su confirmación no coinciden
 *       401:
 *         description: Contraseña actual incorrecta o no autorizado
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
 *                       enum: [UNAUTHORIZED, INCORRECT_CURRENT_PASSWORD]
 *                       example: INCORRECT_CURRENT_PASSWORD
 *                     message:
 *                       type: string
 *                       example: La contraseña actual es incorrecta
 *       500:
 *         description: Error del servidor
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
 *                       example: CHANGE_PASSWORD_FAILED
 *                     message:
 *                       type: string
 */
router.post('/me/change-password', verificarToken, verificarUsuarioApp, controller.cambiarContrasena);

/**
 * @swagger
 * /api/users/me:
 *   delete:
 *     summary: Solicitar eliminación programada de la cuenta
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Solicitud registrada correctamente
 *       401:
 *         description: No autorizado
 *       409:
 *         description: Ya existe una solicitud activa
 *       500:
 *         description: Error al registrar solicitud
 */
router.delete('/me', verificarToken, verificarUsuarioApp, controller.solicitarEliminacionCuenta);

/**
 * @swagger
 * /api/users/me/deletion-request:
 *   get:
 *     summary: Obtener estado de la solicitud de eliminación
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado recuperado correctamente
 *       401:
 *         description: No autorizado
 *   delete:
 *     summary: Cancelar solicitud de eliminación
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Solicitud cancelada correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: No hay solicitud activa para cancelar
 */
router
  .route('/me/deletion-request')
  .get(verificarToken, verificarUsuarioApp, controller.obtenerEstadoEliminacion)
  .delete(verificarToken, verificarUsuarioApp, controller.cancelarSolicitudEliminacion);

// Subrutas especiales de usuario
router.use('/me/body-metrics', bodyMetricsRoutes);
router.use('/me/notifications', notificationRoutes);

// ============================================================================
// LOTE 5 - REWARDS & TOKENS
// ============================================================================

const rewardController = require('../controllers/reward-controller');
const tokenController = require('../controllers/token-controller');

/**
 * GET /api/users/me/tokens/balance
 * Obtiene el balance de tokens del usuario autenticado
 */
router.get('/me/tokens/balance', verificarToken, verificarUsuarioApp, tokenController.getMyTokenBalance);

/**
 * GET /api/users/me/tokens/ledger
 * Lista el historial de movimientos de tokens del usuario autenticado
 */
router.get('/me/tokens/ledger', verificarToken, verificarUsuarioApp, tokenController.getMyTokenLedger);

/**
 * GET /api/users/me/tokens/stats
 * Obtiene estadísticas de tokens del usuario autenticado
 */
router.get('/me/tokens/stats', verificarToken, verificarUsuarioApp, tokenController.getMyTokenStats);

/**
 * GET /api/users/:userId/claimed-rewards
 * Lista recompensas canjeadas por un usuario
 */
router.get('/:userId/claimed-rewards', verificarToken, rewardController.listClaimedRewards);

/**
 * POST /api/users/:userId/tokens/add
 * Añade tokens a un usuario (admin)
 */
router.post('/:userId/tokens/add', verificarToken, verificarAdmin, tokenController.addTokens);

/**
 * POST /api/users/:userId/tokens/spend
 * Gasta tokens de un usuario (admin/system)
 */
router.post('/:userId/tokens/spend', verificarToken, verificarAdmin, tokenController.spendTokens);

/**
 * GET /api/users/:userId/tokens/balance
 * Obtiene el balance de tokens de un usuario
 */
router.get('/:userId/tokens/balance', verificarToken, tokenController.getTokenBalance);

/**
 * GET /api/users/:userId/tokens/ledger
 * Lista el historial de movimientos de tokens
 */
router.get('/:userId/tokens/ledger', verificarToken, tokenController.listTokenLedger);

/**
 * GET /api/users/:userId/tokens/stats
 * Obtiene estadísticas de tokens de un usuario
 */
router.get('/:userId/tokens/stats', verificarToken, tokenController.getTokenStats);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener perfil de usuario por ID (solo admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del user_profile
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de admin
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', verificarToken, verificarAdmin, controller.obtenerUsuarioPorId);

/**
 * @swagger
 * /api/users/{id}/tokens:
 *   post:
 *     summary: Actualizar tokens de un usuario (solo admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del user_profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - delta
 *             properties:
 *               delta:
 *                 type: integer
 *                 example: 50
 *                 description: Cantidad a sumar (positivo) o restar (negativo)
 *               reason:
 *                 type: string
 *                 example: Bonus por evento especial
 *     responses:
 *       200:
 *         description: Tokens actualizados correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de admin
 */
router.post('/:id/tokens', verificarToken, verificarAdmin, controller.actualizarTokens);

/**
 * @swagger
 * /api/users/{id}/subscription:
 *   put:
 *     summary: Actualizar suscripción de un usuario (solo admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del user_profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscription
 *             properties:
 *               subscription:
 *                 type: string
 *                 enum: [FREE, PREMIUM]
 *                 example: PREMIUM
 *     responses:
 *       200:
 *         description: Suscripción actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de admin
 */
router.put('/:id/subscription', verificarToken, verificarAdmin, controller.actualizarSuscripcion);

module.exports = router;
