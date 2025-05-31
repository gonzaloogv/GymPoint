const express = require('express');
const router = express.Router();
const controller = require('../controllers/frequency-controller');
const { verificarToken, verificarRol } = require('../middlewares/auth');

/**
 * @swagger
 * /api/frecuencia:
 *   post:
 *     summary: Crear o actualizar la frecuencia semanal (meta de asistencias) de un usuario
 *     tags: [Frecuencia]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_user, goal]
 *             properties:
 *               id_user:
 *                 type: integer
 *                 description: ID del usuario
 *                 example: 7
 *               goal:
 *                 type: integer
 *                 description: Número de asistencias objetivo por semana
 *                 example: 3
 *     responses:
 *       200:
 *         description: Frecuencia creada o actualizada correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', verificarToken, controller.crearMeta);

/**
 * @swagger
 * /api/frecuencia/{id_user}:
 *   get:
 *     summary: Consultar el estado actual de la frecuencia semanal de un usuario
 *     tags: [Frecuencia]
 *     parameters:
 *       - in: path
 *         name: id_user
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Estado actual de la frecuencia del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_user:
 *                   type: integer
 *                   example: 7
 *                 goal:
 *                   type: integer
 *                   description: Meta semanal propuesta por el usuario
 *                   example: 3
 *                 assist:
 *                   type: integer
 *                   description: Cantidad de asistencias realizadas esta semana
 *                   example: 2
 *                 achieved_goal:
 *                   type: boolean
 *                   description: Si el usuario alcanzó o no su meta
 *                   example: false
 *       404:
 *         description: Frecuencia no encontrada para el usuario
 */
router.get('/me', verificarToken, controller.consultarMetaSemanal);

/**
 * @swagger
 * /api/frecuencia/reset:
 *   put:
 *     summary: Reiniciar todas las frecuencias semanales (asistencias y cumplimientos)
 *     tags: [Frecuencia]
 *     responses:
 *       200:
 *         description: Todas las frecuencias fueron reiniciadas correctamente
 */
router.put('/reset', verificarToken, verificarRol('ADMIN'), controller.reiniciarSemana);

module.exports = router;
