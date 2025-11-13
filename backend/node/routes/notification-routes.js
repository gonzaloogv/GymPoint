const express = require('express');
const router = express.Router({ mergeParams: true });
const controller = require('../controllers/notification-controller');
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');

router.use(verificarToken, verificarUsuarioApp);

/**
 * @swagger
 * /api/users/me/notifications:
 *   get:
 *     summary: Listar notificaciones del usuario autenticado
 *     description: Obtiene todas las notificaciones del usuario con opciones de paginación y filtrado
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Cantidad de notificaciones por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Offset para paginación
 *       - in: query
 *         name: includeRead
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir notificaciones leídas
 *       - in: query
 *         name: since
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Obtener notificaciones desde una fecha específica
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_notification:
 *                     type: integer
 *                   id_user_profile:
 *                     type: integer
 *                   type:
 *                     type: string
 *                     enum: [WORKOUT_REMINDER, STREAK_MILESTONE, REWARD_AVAILABLE, SYSTEM]
 *                   title:
 *                     type: string
 *                   message:
 *                     type: string
 *                   is_read:
 *                     type: boolean
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   read_at:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere perfil de usuario
 */
router.get('/', controller.listarNotificaciones);

/**
 * @swagger
 * /api/users/me/notifications/unread-count:
 *   get:
 *     summary: Contar notificaciones no leídas
 *     description: Obtiene el número total de notificaciones no leídas del usuario
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cantidad de notificaciones no leídas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unread:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere perfil de usuario
 */
router.get('/unread-count', controller.contarNoLeidas);

/**
 * @swagger
 * /api/users/me/notifications/settings:
 *   get:
 *     summary: Obtener configuraciones de notificaciones
 *     description: Obtiene las preferencias de notificaciones del usuario
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuraciones de notificaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_user_profile:
 *                   type: integer
 *                 workout_reminders_enabled:
 *                   type: boolean
 *                 streak_notifications_enabled:
 *                   type: boolean
 *                 reward_notifications_enabled:
 *                   type: boolean
 *                 system_notifications_enabled:
 *                   type: boolean
 *                 reminder_time:
 *                   type: string
 *                   format: time
 *                   example: "09:00:00"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere perfil de usuario
 *   put:
 *     summary: Actualizar configuraciones de notificaciones
 *     description: Actualiza las preferencias de notificaciones del usuario
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workout_reminders_enabled:
 *                 type: boolean
 *                 description: Activar/desactivar recordatorios de entrenamiento
 *               streak_notifications_enabled:
 *                 type: boolean
 *                 description: Activar/desactivar notificaciones de rachas
 *               reward_notifications_enabled:
 *                 type: boolean
 *                 description: Activar/desactivar notificaciones de recompensas
 *               system_notifications_enabled:
 *                 type: boolean
 *                 description: Activar/desactivar notificaciones del sistema
 *               reminder_time:
 *                 type: string
 *                 format: time
 *                 example: "09:00:00"
 *                 description: Hora para recordatorios de entrenamiento
 *     responses:
 *       200:
 *         description: Configuraciones actualizadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_user_profile:
 *                   type: integer
 *                 workout_reminders_enabled:
 *                   type: boolean
 *                 streak_notifications_enabled:
 *                   type: boolean
 *                 reward_notifications_enabled:
 *                   type: boolean
 *                 system_notifications_enabled:
 *                   type: boolean
 *                 reminder_time:
 *                   type: string
 *                   format: time
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere perfil de usuario
 */
router.get('/settings', controller.obtenerConfiguraciones);
router.put('/settings', controller.actualizarConfiguraciones);

/**
 * @swagger
 * /api/users/me/notifications/mark-all-read:
 *   put:
 *     summary: Marcar todas las notificaciones como leídas
 *     description: Marca todas las notificaciones del usuario como leídas
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificaciones marcadas como leídas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated:
 *                   type: integer
 *                   description: Número de notificaciones actualizadas
 *                   example: 8
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere perfil de usuario
 */
router.put('/mark-all-read', controller.marcarTodasComoLeidas);

/**
 * @swagger
 * /api/users/me/notifications/{id}/read:
 *   put:
 *     summary: Marcar una notificación como leída
 *     description: Marca una notificación específica del usuario como leída
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_notification:
 *                   type: integer
 *                 id_user_profile:
 *                   type: integer
 *                 type:
 *                   type: string
 *                 title:
 *                   type: string
 *                 message:
 *                   type: string
 *                 is_read:
 *                   type: boolean
 *                   example: true
 *                 read_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: ID de notificación inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere perfil de usuario
 *       404:
 *         description: Notificación no encontrada
 */
router.put('/:id/read', controller.marcarComoLeida);

module.exports = router;
