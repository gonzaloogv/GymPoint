const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routine-controller');

/**
 * @swagger
 * /api/routines:
 *   post:
 *     summary: Crear una nueva rutina con ejercicios
 *     tags: [Rutinas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [routine_name, description, exercises, id_user]
 *             properties:
 *               routine_name:
 *                 type: string
 *                 example: Rutina Full Body
 *               description:
 *                 type: string
 *                 example: Rutina de 3 días completa
 *               id_user:
 *                 type: integer
 *                 example: 1
 *               exercises:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [id_exercise, series, reps, order]
 *                   properties:
 *                     id_exercise:
 *                       type: integer
 *                       example: 1
 *                     series:
 *                       type: integer
 *                       example: 4
 *                     reps:
 *                       type: integer
 *                       example: 12
 *                     order:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       201:
 *         description: Rutina creada correctamente
 */
router.post('/', routineController.createRoutineWithExercises);

/**
 * @swagger
 * /api/routines/user/{id_user}:
 *   get:
 *     summary: Obtener todas las rutinas creadas por un usuario
 *     tags: [Rutinas]
 *     parameters:
 *       - in: path
 *         name: id_user
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de rutinas del usuario
 */
router.get('/user/:id_user', routineController.getRoutinesByUser); // <-- primero

/**
 * @swagger
 * /api/routines/{id}:
 *   get:
 *     summary: Obtener una rutina con sus ejercicios
 *     tags: [Rutinas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rutina detallada con ejercicios
 *       404:
 *         description: Rutina no encontrada
 */
router.get('/:id', routineController.getRoutineWithExercises);

/**
 * @swagger
 * /api/routines/{id}:
 *   put:
 *     summary: Actualizar el nombre o descripción de una rutina
 *     tags: [Rutinas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               routine_name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rutina actualizada
 *       404:
 *         description: Rutina no encontrada
 */
router.put('/:id', routineController.updateRoutine);

/**
 * @swagger
 * /api/routines/{id}/exercises/{id_exercise}:
 *   put:
 *     summary: Actualizar series, reps u orden de un ejercicio dentro de una rutina
 *     tags: [Rutinas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id_exercise
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               series:
 *                 type: integer
 *                 example: 4
 *               reps:
 *                 type: integer
 *                 example: 10
 *               order:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Ejercicio actualizado
 *       404:
 *         description: Ejercicio no encontrado en la rutina
 */
router.put('/:id/exercises/:id_exercise', routineController.updateRoutineExercise);

/**
 * @swagger
 * /api/routines/{id}:
 *   delete:
 *     summary: Eliminar una rutina por ID
 *     tags: [Rutinas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Rutina eliminada
 *       404:
 *         description: Rutina no encontrada
 */
router.delete('/:id', routineController.deleteRoutine);

/**
 * @swagger
 * /api/routines/{id}/exercises/{id_exercise}:
 *   delete:
 *     summary: Eliminar un ejercicio específico de una rutina
 *     tags: [Rutinas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id_exercise
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Ejercicio eliminado de la rutina
 *       404:
 *         description: Ejercicio no encontrado en la rutina
 */
router.delete('/:id/exercises/:id_exercise', routineController.deleteRoutineExercise);

module.exports = router;
