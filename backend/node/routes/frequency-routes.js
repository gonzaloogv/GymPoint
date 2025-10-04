const express = require('express');
const router = express.Router();
const controller = require('../controllers/frequency-controller');
const { verificarToken, verificarUsuarioApp, verificarAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * /api/frecuencia:
 *   post:
 *     summary: Crear o actualizar la frecuencia semanal (meta de asistencias)
 *     description: Define la meta semanal de asistencias del usuario autenticado
 *     tags: [Frecuencia]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [goal]
 *             properties:
 *               goal:
 *                 type: integer
 *                 description: Número de asistencias objetivo por semana (mínimo 1)
 *                 example: 3
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Frecuencia creada o actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_frequency:
 *                       type: integer
 *                     id_user:
 *                       type: integer
 *                     goal:
 *                       type: integer
 *                     assist:
 *                       type: integer
 *                     achieved_goal:
 *                       type: boolean
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.post('/', verificarToken, verificarUsuarioApp, controller.crearMeta);

/**
 * @swagger
 * /api/frecuencia/me:
 *   get:
 *     summary: Consultar el estado actual de la frecuencia semanal
 *     description: Retorna la meta semanal y el progreso del usuario autenticado
 *     tags: [Frecuencia]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado actual de la frecuencia del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_frequency:
 *                       type: integer
 *                     id_user:
 *                       type: integer
 *                     goal:
 *                       type: integer
 *                       description: Meta semanal propuesta por el usuario
 *                       example: 3
 *                     assist:
 *                       type: integer
 *                       description: Cantidad de asistencias realizadas esta semana
 *                       example: 2
 *                     achieved_goal:
 *                       type: boolean
 *                       description: Si el usuario alcanzó o no su meta
 *                       example: false
 *                     userProfile:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         lastname:
 *                           type: string
 *       404:
 *         description: Frecuencia no encontrada para el usuario
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.get('/me', verificarToken, verificarUsuarioApp, controller.consultarMetaSemanal);

/**
 * @swagger
 * /api/frecuencia/reset:
 *   put:
 *     summary: Reiniciar todas las frecuencias semanales (Admin)
 *     description: Reinicia los contadores de asistencias y cumplimientos de todos los usuarios. Se ejecuta típicamente vía cron semanal.
 *     tags: [Frecuencia]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las frecuencias fueron reiniciadas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Frecuencias reiniciadas con éxito
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de administrador
 */
router.put('/reset', verificarToken, verificarAdmin, controller.reiniciarSemana);

module.exports = router;
