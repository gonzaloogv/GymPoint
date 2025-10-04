const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin-controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth');

// Aplicar middlewares a todas las rutas de admin
router.use(verificarToken, verificarAdmin);

/**
 * @swagger
 * /api/admin/me:
 *   get:
 *     summary: Obtener perfil del admin actual
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del administrador
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de admin
 */
router.get('/me', controller.obtenerPerfilAdmin);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Obtener estadísticas generales del sistema
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     by_subscription:
 *                       type: array
 *                     recent_registrations:
 *                       type: integer
 *                 admins:
 *                   type: object
 *                 tokens:
 *                   type: object
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de admin
 */
router.get('/stats', controller.obtenerEstadisticas);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Listar todos los usuarios con paginación
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *       - in: query
 *         name: subscription
 *         schema:
 *           type: string
 *           enum: [FREE, PREMIUM]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, apellido o email
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, tokens, name]
 *           default: created_at
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: Lista paginada de usuarios
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de admin
 */
router.get('/users', controller.listarUsuarios);

/**
 * @swagger
 * /api/admin/users/search:
 *   get:
 *     summary: Buscar usuario por email
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       400:
 *         description: Email no proporcionado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de admin
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/users/search', controller.buscarUsuario);

/**
 * @swagger
 * /api/admin/users/{id}/tokens:
 *   post:
 *     summary: Otorgar o revocar tokens a un usuario
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
 *                 example: 100
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
router.post('/users/:id/tokens', controller.otorgarTokens);

/**
 * @swagger
 * /api/admin/users/{id}/subscription:
 *   put:
 *     summary: Actualizar suscripción de un usuario
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
router.put('/users/:id/subscription', controller.actualizarSuscripcion);

/**
 * @swagger
 * /api/admin/users/{id}/deactivate:
 *   post:
 *     summary: Desactivar cuenta de usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del account
 *     responses:
 *       200:
 *         description: Usuario desactivado correctamente
 *       400:
 *         description: Error al desactivar
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de admin
 */
router.post('/users/:id/deactivate', controller.desactivarUsuario);

/**
 * @swagger
 * /api/admin/users/{id}/activate:
 *   post:
 *     summary: Activar cuenta de usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del account
 *     responses:
 *       200:
 *         description: Usuario activado correctamente
 *       400:
 *         description: Error al activar
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de admin
 */
router.post('/users/:id/activate', controller.activarUsuario);

/**
 * @swagger
 * /api/admin/activity:
 *   get:
 *     summary: Obtener actividad reciente del sistema
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Días hacia atrás
 *     responses:
 *       200:
 *         description: Actividad reciente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de admin
 */
router.get('/activity', controller.obtenerActividad);

/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     summary: Obtener log de transacciones de tokens
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de user_profile (opcional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Lista de transacciones
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de admin
 */
router.get('/transactions', controller.obtenerTransacciones);

module.exports = router;

