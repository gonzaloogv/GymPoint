const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routine-controller');
const { verificarToken } = require('../middlewares/auth')

/**
 * @swagger
 * /api/routines:
 *   post:
 *     summary: Crear una nueva rutina con ejercicios
 *     tags: [Rutinas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [routine_name, description, exercises]
 *             properties:
 *               routine_name:
 *                 type: string
 *               description:
 *                 type: string
 *               exercises:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [id_exercise, series, reps, order]
 */
router.post('/', verificarToken, routineController.createRoutineWithExercises);

/**
 * @swagger
 * /api/routines/me:
 *   get:
 *     summary: Obtener todas las rutinas creadas por el usuario autenticado
 *     tags: [Rutinas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de rutinas del usuario
 */
router.get('/me', verificarToken, routineController.getRoutinesByUser); // <-- primero

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
