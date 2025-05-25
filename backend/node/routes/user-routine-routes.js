const express = require('express');
const router = express.Router();
const controller = require('../controllers/user-routine-controller');

/**
 * @swagger
 * /api/user-routines/{id_user}/active-routine:
 *   get:
 *     summary: Obtener la rutina activa del usuario con sus ejercicios
 *     tags: [Rutina Activa]
 *     parameters:
 *       - in: path
 *         name: id_user
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rutina activa detallada con ejercicios
 *       404:
 *         description: No hay rutina activa asignada
 */
router.get('/:id_user/active-routine', controller.getActiveRoutineWithExercises); // Primero

/**
 * @swagger
 * /api/user-routines:
 *   post:
 *     summary: Asignar una rutina activa a un usuario
 *     tags: [Rutina Activa]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_user, id_routine, start_date]
 *             properties:
 *               id_user:
 *                 type: integer
 *                 example: 1
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
router.post('/', controller.assignRoutineToUser);

/**
 * @swagger
 * /api/user-routines/{id_user}:
 *   get:
 *     summary: Obtener la rutina activa asignada a un usuario
 *     tags: [Rutina Activa]
 *     parameters:
 *       - in: path
 *         name: id_user
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rutina activa actual
 *       404:
 *         description: El usuario no tiene rutina activa
 */
router.get('/:id_user', controller.getActiveRoutine);

/**
 * @swagger
 * /api/user-routines/{id_user}/end:
 *   put:
 *     summary: Finalizar la rutina activa de un usuario
 *     tags: [Rutina Activa]
 *     parameters:
 *       - in: path
 *         name: id_user
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rutina finalizada correctamente
 *       404:
 *         description: No hay rutina activa para finalizar
 */
router.put('/:id_user/end', controller.endUserRoutine);

module.exports = router;
