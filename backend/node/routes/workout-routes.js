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
// Session operations
router.post('/sessions', controller.iniciarSesion);
router.get('/sessions/active', controller.getActiveSesion);
router.get('/sessions/me', controller.listarSesiones);
router.get('/stats', controller.getStats);
router.get('/sessions/:id', controller.getSesion);
router.put('/sessions/:id', controller.updateSesion);
router.put('/sessions/:id/complete', controller.completarSesion);
router.put('/sessions/:id/cancel', controller.cancelarSesion);

// Set operations
router.get('/sessions/:id/sets', controller.listarSets);
router.post('/sessions/:id/sets', controller.registrarSet);
router.put('/sets/:id', controller.updateSet);
router.delete('/sets/:id', controller.deleteSet);

module.exports = router;
