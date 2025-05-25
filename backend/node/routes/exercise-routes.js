const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exercise-controller');

/**
 * @swagger
 * /api/exercises:
 *   get:
 *     summary: Obtener todos los ejercicios disponibles
 *     tags: [Ejercicios]
 *     responses:
 *       200:
 *         description: Lista de ejercicios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', exerciseController.getAllExercises);

/**
 * @swagger
 * /api/exercises/{id}:
 *   get:
 *     summary: Obtener un ejercicio por su ID
 *     tags: [Ejercicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio
 *     responses:
 *       200:
 *         description: Detalle del ejercicio
 *       404:
 *         description: Ejercicio no encontrado
 */
router.get('/:id', exerciseController.getExerciseById);

/**
 * @swagger
 * /api/exercises:
 *   post:
 *     summary: Crear un nuevo ejercicio
 *     tags: [Ejercicios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [exercise_name, muscular_group]
 *             properties:
 *               exercise_name:
 *                 type: string
 *                 example: Press Banca
 *               muscular_group:
 *                 type: string
 *                 example: Pecho
 *     responses:
 *       201:
 *         description: Ejercicio creado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', exerciseController.createExercise);

/**
 * @swagger
 * /api/exercises/{id}:
 *   put:
 *     summary: Actualizar un ejercicio existente
 *     tags: [Ejercicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio a modificar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               exercise_name:
 *                 type: string
 *               muscular_group:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ejercicio actualizado correctamente
 *       404:
 *         description: Ejercicio no encontrado
 */
router.put('/:id', exerciseController.updateExercise);

/**
 * @swagger
 * /api/exercises/{id}:
 *   delete:
 *     summary: Eliminar un ejercicio
 *     tags: [Ejercicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ejercicio
 *     responses:
 *       204:
 *         description: Ejercicio eliminado correctamente
 *       404:
 *         description: Ejercicio no encontrado
 */
router.delete('/:id', exerciseController.deleteExercise);

module.exports = router;
