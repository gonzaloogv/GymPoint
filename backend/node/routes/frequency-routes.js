const express = require('express');
const router = express.Router();
const controller = require('../controllers/frequency-controller');

/**
 * @swagger
 * /api/frecuencia:
 *   post:
 *     summary: Crear o actualizar la meta semanal de asistencias de un usuario
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
 *                 example: 1
 *               goal:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       200:
 *         description: Meta semanal creada o actualizada correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', controller.crearMeta);

/**
 * @swagger
 * /api/frecuencia/{id_user}:
 *   get:
 *     summary: Consultar el estado actual de la meta semanal del usuario
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
 *         description: Estado actual de la frecuencia semanal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_user:
 *                   type: integer
 *                 goal:
 *                   type: integer
 *                 assist:
 *                   type: integer
 *                 achieved_goal:
 *                   type: boolean
 *       404:
 *         description: Meta no encontrada para el usuario
 */
router.get('/:id_user', controller.consultarMetaSemanal);

/**
 * @swagger
 * /api/frecuencia/reset:
 *   put:
 *     summary: Reiniciar todas las metas semanales (asistencias y cumplimiento)
 *     tags: [Frecuencia]
 *     responses:
 *       200:
 *         description: Todas las metas fueron reiniciadas correctamente
 */
router.put('/reset', controller.reiniciarSemana);

module.exports = router;
