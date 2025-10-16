const express = require('express');
const router = express.Router();
const controller = require('../controllers/assistance-controller');
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');

/**
 * @swagger
 * /api/assistances:
 *   post:
 *     summary: Registrar asistencia del usuario en un gimnasio con validación GPS, racha y tokens
 *     description: El usuario debe estar dentro del rango de proximidad del gimnasio (configurable via PROXIMITY_M). Se otorgan tokens configurables (TOKENS_ATTENDANCE) y se actualiza la racha.
 *     tags: [Asistencias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_gym
 *               - latitude
 *               - longitude
 *             properties:
 *               id_gym:
 *                 type: integer
 *                 description: ID del gimnasio
 *                 example: 3
 *               latitude:
 *                 type: number
 *                 format: float
 *                 description: Latitud actual del usuario
 *                 example: -34.603722
 *               longitude:
 *                 type: number
 *                 format: float
 *                 description: Longitud actual del usuario
 *                 example: -58.38159
 *     responses:
 *       201:
 *         description: Asistencia registrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Asistencia registrada con éxito
 *                 data:
 *                   type: object
 *                   properties:
 *                     asistencia:
 *                       type: object
 *                       properties:
 *                         id_assistance:
 *                           type: integer
 *                         id_user:
 *                           type: integer
 *                         id_gym:
 *                           type: integer
 *                         date:
 *                           type: string
 *                           format: date
 *                         check_in_time:
 *                           type: string
 *                           format: time
 *                           example: "14:30:00"
 *                           description: Hora de check-in (campo principal)
 *                         hour:
 *                           type: string
 *                           deprecated: true
 *                           description: DEPRECATED - Usar check_in_time en su lugar
 *                     distancia:
 *                       type: integer
 *                       description: Distancia en metros desde el gimnasio
 *                       example: 6
 *                     tokens_actuales:
 *                       type: integer
 *                       description: Tokens totales del usuario tras registrar asistencia
 *                       example: 30
 *                     racha_actual:
 *                       type: integer
 *                       description: Valor actual de la racha
 *                       example: 5
 *       400:
 *         description: Datos inválidos, asistencia ya registrada hoy, o fuera de rango
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
 *                       example: ASSISTANCE_REGISTRATION_FAILED
 *                     message:
 *                       type: string
 *                       example: Ya registraste asistencia hoy.
 *       401:
 *         description: No autorizado (token inválido o expirado)
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.post('/', verificarToken, verificarUsuarioApp, controller.registrarAsistencia);

/**
 * @swagger
 * /api/assistances/presence:
 *   post:
 *     summary: Registrar presencia del usuario en el rango geofence
 *     tags: [Asistencias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_gym, latitude, longitude]
 *             properties:
 *               id_gym:
 *                 type: integer
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Presencia registrada
 *       400:
 *         description: Error de validación o fuera de rango
 */
router.post('/presence', verificarToken, verificarUsuarioApp, controller.registrarPresencia);

/**
 * @swagger
 * /api/assistances/auto-checkin:
 *   post:
 *     summary: Verificar y registrar auto check-in si usuario cumplió permanencia mínima
 *     tags: [Asistencias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_gym]
 *             properties:
 *               id_gym:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Auto check-in registrado
 *       400:
 *         description: Permanencia insuficiente o error
 */
router.post('/auto-checkin', verificarToken, verificarUsuarioApp, controller.verificarAutoCheckIn);

/**
 * @swagger
 * /api/assistances/{id}/checkout:
 *   put:
 *     summary: Registrar check-out y bonus por duración
 *     tags: [Asistencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la asistencia
 *     responses:
 *       200:
 *         description: Check-out registrado
 *       400:
 *         description: Error de validación
 */
router.put('/:id/checkout', verificarToken, verificarUsuarioApp, controller.checkOut);

/**
 * @swagger
 * /api/assistances/me:
 *   get:
 *     summary: Obtener historial de asistencias del usuario autenticado
 *     description: Retorna todas las asistencias del usuario con información del gimnasio
 *     tags: [Asistencias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de asistencias con información del gimnasio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Historial de asistencias obtenido con éxito
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_assistance:
 *                         type: integer
 *                       id_user:
 *                         type: integer
 *                       id_gym:
 *                         type: integer
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: 2025-10-04
 *                       check_in_time:
 *                         type: string
 *                         format: time
 *                         example: 14:30:00
 *                         description: Hora de check-in
 *                       check_out_time:
 *                         type: string
 *                         format: time
 *                         example: 16:00:00
 *                         description: Hora de check-out (si existe)
 *                       hour:
 *                         type: string
 *                         deprecated: true
 *                         description: DEPRECATED - Usar check_in_time
 *                       gym:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: MegaGym Centro
 *                           city:
 *                             type: string
 *                             example: Córdoba
 *                           address:
 *                             type: string
 *                             example: Av. Colón 123
 *       400:
 *         description: Error al obtener historial
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.get('/me', verificarToken, verificarUsuarioApp, controller.obtenerHistorialAsistencias);

// Podés agregar otros endpoints como historial más adelante

module.exports = router;
