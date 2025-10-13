const express = require('express');
const router = express.Router();
const controller = require('../controllers/workout-controller');
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');

router.use(verificarToken, verificarUsuarioApp);

/**
 * @swagger
 * /api/workouts:
 *   get:
 *     summary: Listar sesiones de entrenamiento del usuario
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: Filtrar por estado (puede ser múltiple separado por comas)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de sesiones por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset para paginación
 *     responses:
 *       200:
 *         description: Lista de sesiones de entrenamiento
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_workout_session:
 *                     type: integer
 *                   id_user_profile:
 *                     type: integer
 *                   id_routine:
 *                     type: integer
 *                   id_routine_day:
 *                     type: integer
 *                   status:
 *                     type: string
 *                     enum: [IN_PROGRESS, COMPLETED, CANCELLED]
 *                   started_at:
 *                     type: string
 *                     format: date-time
 *                   ended_at:
 *                     type: string
 *                     format: date-time
 *                   duration_seconds:
 *                     type: integer
 *                   total_sets:
 *                     type: integer
 *                   total_reps:
 *                     type: integer
 *                   total_weight:
 *                     type: number
 *                     format: float
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 *   post:
 *     summary: Iniciar una nueva sesión de entrenamiento
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_routine:
 *                 type: integer
 *                 description: ID de la rutina (opcional)
 *               id_routine_day:
 *                 type: integer
 *                 description: ID del día de rutina (opcional)
 *               started_at:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de inicio (por defecto ahora)
 *               notes:
 *                 type: string
 *                 description: Notas de la sesión
 *     responses:
 *       201:
 *         description: Sesión iniciada exitosamente
 *       400:
 *         description: Ya existe una sesión en progreso
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.get('/', controller.listarSesiones);
router.post('/', controller.iniciarSesion);

/**
 * @swagger
 * /api/workouts/{id}/sets:
 *   post:
 *     summary: Registrar una serie en una sesión de entrenamiento
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sesión de entrenamiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_exercise
 *             properties:
 *               id_exercise:
 *                 type: integer
 *                 description: ID del ejercicio
 *               weight:
 *                 type: number
 *                 format: float
 *                 description: Peso utilizado en kg
 *               reps:
 *                 type: integer
 *                 description: Número de repeticiones
 *               rpe:
 *                 type: number
 *                 format: float
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Rate of Perceived Exertion (1-10)
 *               rest_seconds:
 *                 type: integer
 *                 description: Segundos de descanso después de la serie
 *               is_warmup:
 *                 type: boolean
 *                 default: false
 *                 description: Si es una serie de calentamiento
 *               notes:
 *                 type: string
 *                 description: Notas sobre la serie
 *               performed_at:
 *                 type: string
 *                 format: date-time
 *                 description: Momento en que se realizó la serie
 *     responses:
 *       201:
 *         description: Serie registrada exitosamente
 *       400:
 *         description: Datos inválidos o sesión no está en progreso
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 *       404:
 *         description: Sesión o ejercicio no encontrado
 */
router.post('/:id/sets', controller.registrarSet);

/**
 * @swagger
 * /api/workouts/{id}/complete:
 *   post:
 *     summary: Completar una sesión de entrenamiento
 *     description: Finaliza la sesión, recalcula totales y otorga tokens
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sesión de entrenamiento
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ended_at:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de finalización (por defecto ahora)
 *               notes:
 *                 type: string
 *                 description: Notas finales de la sesión
 *     responses:
 *       200:
 *         description: Sesión completada exitosamente
 *       400:
 *         description: La sesión no está en progreso
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 *       404:
 *         description: Sesión no encontrada
 */
router.post('/:id/complete', controller.completarSesion);

/**
 * @swagger
 * /api/workouts/{id}/cancel:
 *   post:
 *     summary: Cancelar una sesión de entrenamiento
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sesión de entrenamiento
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Motivo de cancelación
 *     responses:
 *       200:
 *         description: Sesión cancelada exitosamente
 *       400:
 *         description: Solo se pueden cancelar sesiones activas
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 *       404:
 *         description: Sesión no encontrada
 */
router.post('/:id/cancel', controller.cancelarSesion);

module.exports = router;
