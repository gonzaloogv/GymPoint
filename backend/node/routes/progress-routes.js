const express = require('express');
const router = express.Router();
const controller = require('../controllers/progress-controller');
const { verificarToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/progress:
 *   post:
 *     summary: Registrar el progreso corporal y de ejercicios del usuario
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
 *                 example: 2025-06-01
 *               body_weight:
 *                 type: number
 *                 example: 70.5
 *               body_fat:
 *                 type: number
 *                 example: 15.2
 *               ejercicios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_exercise:
 *                       type: integer
 *                       example: 2
 *                     used_weight:
 *                       type: number
 *                       example: 80
 *                     reps:
 *                       type: integer
 *                       example: 10
 *     responses:
 *       201:
 *         description: Progreso registrado correctamente
 */
router.post('/', verificarToken, controller.registrarProgreso);

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
router.get('/me/ejercicios/:id_exercise/promedio', verificarToken, controller.obtenerPromedioLevantamiento);

/**
 * @swagger
 * /api/progress/me/ejercicios/{id_exercise}/mejor:
 *   get:
 *     summary: Obtener el mejor levantamiento de un ejercicio
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
 *         description: Mayor peso levantado registrado
 */
router.get('/me/ejercicios/:id_exercise/mejor', verificarToken, controller.obtenerMejorLevantamiento);

/**
 * @swagger
 * /api/progress/me/ejercicios/{id_exercise}:
 *   get:
 *     summary: Obtener historial de un ejercicio específico por usuario
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
 *         description: Lista de progresos del ejercicio
 */
router.get('/me/ejercicios/:id_exercise', verificarToken, controller.obtenerHistorialPorEjercicio);

/**
 * @swagger
 * /api/progress/me/ejercicios:
 *   get:
 *     summary: Obtener el historial completo de ejercicios del usuario
 *     tags: [Progreso]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Registros de ejercicios realizados por el usuario
 */
router.get('/me/ejercicios', verificarToken, controller.obtenerHistorialEjercicios);

/**
 * @swagger
 * /api/progress/me/estadistica:
 *   get:
 *     summary: Obtener la evolución del peso corporal del usuario
 *     tags: [Progreso]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista con fechas y peso corporal
 */
router.get('/me/estadistica', verificarToken, controller.obtenerEstadisticaPeso);

/**
 * @swagger
 * /api/progress/me:
 *   get:
 *     summary: Obtener el historial general de progreso corporal del usuario
 *     tags: [Progreso]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de registros de progreso
 */
router.get('/me', verificarToken, controller.obtenerProgresoPorUsuario);

module.exports = router;