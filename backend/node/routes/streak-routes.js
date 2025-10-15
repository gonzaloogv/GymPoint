const express = require('express');
const router = express.Router();
const controller = require('../controllers/streak-controller');
const { verificarToken, verificarUsuarioApp, verificarAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * /api/streak/me:
 *   get:
 *     summary: Obtener la racha actual del usuario autenticado
 *     description: Retorna la racha de asistencias del usuario con su valor actual, items de recuperación y estadísticas relacionadas
 *     tags: [Racha]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Racha del usuario obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_streak:
 *                   type: integer
 *                   description: ID de la racha
 *                   example: 1
 *                 value:
 *                   type: integer
 *                   description: Valor actual de la racha (días consecutivos)
 *                   example: 15
 *                 last_value:
 *                   type: integer
 *                   description: Último valor de racha antes de perderla
 *                   example: 10
 *                 recovery_items:
 *                   type: integer
 *                   description: Items de recuperación disponibles
 *                   example: 2
 *                 user:
 *                   type: object
 *                   properties:
 *                     id_user_profile:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     lastname:
 *                       type: string
 *                 frequency:
 *                   type: object
 *                   description: Información de frecuencia semanal asociada
 *                   properties:
 *                     goal:
 *                       type: integer
 *                     assist:
 *                       type: integer
 *                     achieved_goal:
 *                       type: boolean
 *       404:
 *         description: Racha no encontrada para el usuario
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.get('/me', verificarToken, verificarUsuarioApp, controller.obtenerRachaActual);

/**
 * @swagger
 * /api/streak/use-recovery:
 *   post:
 *     summary: Usar un item de recuperación para mantener la racha
 *     description: Consume un item de recuperación para evitar perder la racha cuando no se asiste consecutivamente
 *     tags: [Racha]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Item de recuperación usado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item de recuperación usado exitosamente
 *                 recovery_items_remaining:
 *                   type: integer
 *                   example: 1
 *                 streak_value:
 *                   type: integer
 *                   example: 15
 *       400:
 *         description: No hay items de recuperación disponibles o error en la operación
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.post('/use-recovery', verificarToken, verificarUsuarioApp, controller.usarRecuperacion);

/**
 * @swagger
 * /api/streak/stats:
 *   get:
 *     summary: Obtener estadísticas globales de rachas (Admin)
 *     description: Retorna estadísticas generales del sistema de rachas para análisis administrativo
 *     tags: [Racha]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_rachas:
 *                   type: integer
 *                   description: Total de rachas en el sistema
 *                   example: 150
 *                 racha_maxima:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: integer
 *                       example: 365
 *                     usuario:
 *                       type: object
 *                 promedio_racha:
 *                   type: number
 *                   example: 12.5
 *                 rachas_por_rango:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rango:
 *                         type: string
 *                         example: "1-7"
 *                       cantidad:
 *                         type: integer
 *                         example: 45
 *                 items_recuperacion_total:
 *                   type: integer
 *                   example: 300
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de administrador
 */
router.get('/stats', verificarToken, verificarAdmin, controller.obtenerEstadisticas);

/**
 * @swagger
 * /api/streak/{id_user_profile}/reset:
 *   put:
 *     summary: Resetear la racha de un usuario (Admin)
 *     description: Reinicia la racha de un usuario específico a cero, guardando el valor anterior
 *     tags: [Racha]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_user_profile
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del perfil de usuario
 *     responses:
 *       200:
 *         description: Racha reseteada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Racha reseteada exitosamente
 *                 racha:
 *                   type: object
 *       400:
 *         description: Error al resetear la racha
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de administrador
 */
router.put('/:id_user_profile/reset', verificarToken, verificarAdmin, controller.resetearRacha);

/**
 * @swagger
 * /api/streak/{id_user_profile}/grant-recovery:
 *   post:
 *     summary: Otorgar items de recuperación a un usuario (Admin)
 *     description: Añade items de recuperación a la racha de un usuario específico
 *     tags: [Racha]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_user_profile
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del perfil de usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cantidad]
 *             properties:
 *               cantidad:
 *                 type: integer
 *                 description: Cantidad de items de recuperación a otorgar
 *                 example: 3
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Items de recuperación otorgados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Se otorgaron 3 item(s) de recuperación
 *                 racha:
 *                   type: object
 *       400:
 *         description: Datos inválidos o error en la operación
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de administrador
 */
router.post('/:id_user_profile/grant-recovery', verificarToken, verificarAdmin, controller.otorgarRecuperacion);

module.exports = router;
