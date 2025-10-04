const express = require('express');
const router = express.Router();
const controller = require('../controllers/progress-controller');
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');

/**
 * @swagger
 * /api/progress:
 *   post:
 *     summary: Registrar el progreso corporal y de ejercicios del usuario
 *     description: Registra mediciones corporales (peso, grasa) y ejercicios realizados con pesos y repeticiones
 *     tags: [Progreso]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, body_weight, body_fat, ejercicios]
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Fecha del registro
 *                 example: 2025-10-04
 *               body_weight:
 *                 type: number
 *                 format: float
 *                 description: Peso corporal en kg
 *                 example: 70.5
 *               body_fat:
 *                 type: number
 *                 format: float
 *                 description: Porcentaje de grasa corporal
 *                 example: 15.2
 *               ejercicios:
 *                 type: array
 *                 description: Lista de ejercicios realizados
 *                 items:
 *                   type: object
 *                   required: [id_exercise, used_weight, reps]
 *                   properties:
 *                     id_exercise:
 *                       type: integer
 *                       description: ID del ejercicio
 *                       example: 2
 *                     used_weight:
 *                       type: number
 *                       format: float
 *                       description: Peso utilizado en kg
 *                       example: 80
 *                     reps:
 *                       type: integer
 *                       description: Número de repeticiones
 *                       example: 10
 *     responses:
 *       201:
 *         description: Progreso registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Progreso registrado con éxito
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_progress:
 *                       type: integer
 *                     id_user:
 *                       type: integer
 *                     date:
 *                       type: string
 *                       format: date
 *                     body_weight:
 *                       type: number
 *                     body_fat:
 *                       type: number
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
 *                       example: REGISTER_PROGRESS_FAILED
 *                     message:
 *                       type: string
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.post('/', verificarToken, verificarUsuarioApp, controller.registrarProgreso);

/**
 * @swagger
 * /api/progress/me/ejercicios/{id_exercise}/promedio:
 *   get:
 *     summary: Obtener el promedio de peso y repeticiones de un ejercicio
 *     tags: [Progreso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_exercise
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Promedio de peso y reps
 */
router.get('/me/ejercicios/:id_exercise/promedio', verificarToken, verificarUsuarioApp, controller.obtenerPromedioLevantamiento);

/**
 * @swagger
 * /api/progress/me/ejercicios/{id_exercise}/mejor:
 *   get:
 *     summary: Obtener el mejor levantamiento de un ejercicio
 *     description: Retorna el registro con mayor peso levantado para un ejercicio específico
 *     tags: [Progreso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_exercise
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio
 *         example: 2
 *     responses:
 *       200:
 *         description: Mejor levantamiento obtenido con éxito
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
 *                     date:
 *                       type: string
 *                       format: date
 *                     used_weight:
 *                       type: number
 *                     reps:
 *                       type: integer
 *       404:
 *         description: No se encontraron registros
 *       401:
 *         description: No autorizado
 */
router.get('/me/ejercicios/:id_exercise/mejor', verificarToken, verificarUsuarioApp, controller.obtenerMejorLevantamiento);

/**
 * @swagger
 * /api/progress/me/ejercicios/{id_exercise}:
 *   get:
 *     summary: Obtener historial de un ejercicio específico
 *     tags: [Progreso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_exercise
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2
 *     responses:
 *       200:
 *         description: Historial obtenido con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: No autorizado
 */
router.get('/me/ejercicios/:id_exercise', verificarToken, verificarUsuarioApp, controller.obtenerHistorialPorEjercicio);

/**
 * @swagger
 * /api/progress/me/ejercicios:
 *   get:
 *     summary: Obtener el historial completo de ejercicios
 *     tags: [Progreso]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial obtenido con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *       401:
 *         description: No autorizado
 */
router.get('/me/ejercicios', verificarToken, verificarUsuarioApp, controller.obtenerHistorialEjercicios);

/**
 * @swagger
 * /api/progress/me/estadistica:
 *   get:
 *     summary: Obtener la evolución del peso corporal
 *     tags: [Progreso]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       body_weight:
 *                         type: number
 *       401:
 *         description: No autorizado
 */
router.get('/me/estadistica', verificarToken, verificarUsuarioApp, controller.obtenerEstadisticaPeso);

/**
 * @swagger
 * /api/progress/me:
 *   get:
 *     summary: Obtener el historial general de progreso corporal
 *     tags: [Progreso]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progreso obtenido con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *       401:
 *         description: No autorizado
 */
router.get('/me', verificarToken, verificarUsuarioApp, controller.obtenerProgresoPorUsuario);

module.exports = router;