const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routine-controller');
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');

/**
 * @swagger
 * /api/routines:
 *   post:
 *     summary: Crear una nueva rutina con ejercicios
 *     description: Crea una rutina. IMPORTANTE - La rutina debe tener al menos 3 ejercicios para ser válida.
 *     tags: [Rutinas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [routine_name, exercises]
 *             properties:
 *               routine_name:
 *                 type: string
 *                 description: Nombre de la rutina
 *                 example: Rutina Fuerza Día A
 *               description:
 *                 type: string
 *                 description: Descripción opcional
 *                 example: Enfocada en tren superior
 *               exercises:
 *                 type: array
 *                 minItems: 3
 *                 description: Lista de ejercicios (mínimo 3)
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
 *                       example: 10
 *                     order:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       201:
 *         description: Rutina creada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Rutina creada con éxito
 *                 data:
 *                   type: object
 *       400:
 *         description: Datos inválidos o menos de 3 ejercicios
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
 *                       example: INVALID_EXERCISES
 *                     message:
 *                       type: string
 *                       example: La rutina debe tener al menos 3 ejercicios
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.post('/', verificarToken, verificarUsuarioApp, routineController.createRoutineWithExercises);

/**
 * @swagger
 * /api/routines/me:
 *   get:
 *     summary: Obtener todas las rutinas del usuario autenticado
 *     description: Retorna todas las rutinas creadas por el usuario
 *     tags: [Rutinas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rutinas obtenidas con éxito
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
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.get('/me', verificarToken, verificarUsuarioApp, routineController.getRoutinesByUser);

/**
 * @swagger
 * /api/routines/{id}:
 *   get:
 *     summary: Obtener una rutina con sus ejercicios
 *     description: Obtiene los detalles completos de una rutina incluyendo ejercicios ordenados
 *     tags: [Rutinas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la rutina
 *         example: 5
 *     responses:
 *       200:
 *         description: Rutina obtenida con éxito
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
 *                     id_routine:
 *                       type: integer
 *                     routine_name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     created_by:
 *                       type: integer
 *                     creator:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         lastname:
 *                           type: string
 *                     exercises:
 *                       type: array
 *       404:
 *         description: Rutina no encontrada
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
 *                       example: ROUTINE_NOT_FOUND
 *                     message:
 *                       type: string
 */
router.get('/:id', routineController.getRoutineWithExercises);

/**
 * @swagger
 * /api/routines/{id}:
 *   put:
 *     summary: Actualizar el nombre o descripción de una rutina
 *     tags: [Rutinas]
 *     security:
 *       - bearerAuth: []
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
 *                 example: Rutina Actualizada
 *               description:
 *                 type: string
 *                 example: Nueva descripción
 *     responses:
 *       200:
 *         description: Rutina actualizada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: Rutina no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.put('/:id', verificarToken, verificarUsuarioApp, routineController.updateRoutine);

/**
 * @swagger
 * /api/routines/{id}/exercises/{id_exercise}:
 *   put:
 *     summary: Actualizar series, reps u orden de un ejercicio dentro de una rutina
 *     tags: [Rutinas]
 *     security:
 *       - bearerAuth: []
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
 *         description: Ejercicio actualizado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: Ejercicio no encontrado en la rutina
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.put('/:id/exercises/:id_exercise', verificarToken, verificarUsuarioApp, routineController.updateRoutineExercise);

/**
 * @swagger
 * /api/routines/{id}:
 *   delete:
 *     summary: Eliminar una rutina por ID
 *     tags: [Rutinas]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.delete('/:id', verificarToken, verificarUsuarioApp, routineController.deleteRoutine);

/**
 * @swagger
 * /api/routines/{id}/exercises/{id_exercise}:
 *   delete:
 *     summary: Eliminar un ejercicio específico de una rutina
 *     tags: [Rutinas]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.delete('/:id/exercises/:id_exercise', verificarToken, verificarUsuarioApp, routineController.deleteRoutineExercise);

module.exports = router;
