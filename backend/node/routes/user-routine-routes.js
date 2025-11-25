const express = require('express');
const router = express.Router();
const controller = require('../controllers/user-routine-controller');
const { verificarToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/user-routines/me/active-routine:
 *   get:
 *     summary: Obtener la rutina activa del usuario con sus ejercicios
 *     tags: [Rutina Activa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rutina activa detallada con ejercicios
 *       404:
 *         description: No hay rutina activa asignada
 */
router.get('/me/active-routine', verificarToken, controller.getActiveRoutineWithExercises);

/**
 * @swagger
 * /api/user-routines:
 *   post:
 *     summary: Asignar una rutina activa a un usuario
 *     tags: [Rutina Activa]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_routine, start_date]
 *             properties:
 *               id_routine:
 *                 type: integer
 *                 example: 3
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-06-01
 *     responses:
 *       201:
 *         description: Rutina asignada correctamente
 *       400:
 *         description: El usuario ya tiene una rutina activa
 */
router.post('/', verificarToken, controller.assignRoutineToUser);

/**
 * @swagger
 * /api/user-routines/me:
 *   get:
 *     summary: Obtener la rutina activa asignada al usuario
 *     tags: [Rutina Activa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rutina activa actual
 *       404:
 *         description: El usuario no tiene rutina activa
 */
router.get('/me', verificarToken, controller.getActiveRoutine);

/**
 * @swagger
 * /api/user-routines/me/end:
 *   put:
 *     summary: Finalizar la rutina activa del usuario
 *     tags: [Rutina Activa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rutina finalizada correctamente
 *       404:
 *         description: No hay rutina activa para finalizar
 */
router.put('/me/end', verificarToken, controller.endUserRoutine);

module.exports = router;
