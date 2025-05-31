const express = require('express');
const router = express.Router();
const controller = require('../controllers/gym-schedule-controller');
const { verificarToken, verificarRolMultiple } = require('../middlewares/auth');

/**
 * @swagger
 * /api/gym-schedule:
 *   post:
 *     summary: Registrar un nuevo horario para un gimnasio
 *     tags: [Horarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_gym, day_of_week, opening_time, closing_time, closed]
 *             properties:
 *               id_gym:
 *                 type: integer
 *                 example: 1
 *               day_of_week:
 *                 type: string
 *                 example: Lunes
 *               opening_time:
 *                 type: string
 *                 example: "08:00"
 *               closing_time:
 *                 type: string
 *                 example: "22:00"
 *               closed:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Horario registrado correctamente
 *       400:
 *         description: Ya existe un horario para ese día y gimnasio
 */
router.post('/', verificarToken, verificarRolMultiple(['ADMIN', 'GYM']), controller.crearHorario);

/**
 * @swagger
 * /api/gym-schedule/{id_gym}:
 *   get:
 *     summary: Obtener los horarios configurados para un gimnasio
 *     tags: [Horarios]
 *     parameters:
 *       - in: path
 *         name: id_gym
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gimnasio
 *     responses:
 *       200:
 *         description: Lista de horarios del gimnasio
 *       404:
 *         description: Gimnasio no encontrado o sin horarios
 */
router.get('/:id_gym', controller.obtenerHorariosPorGimnasio);

/**
 * @swagger
 * /api/gym-schedule/{id_schedule}:
 *   put:
 *     summary: Actualizar un horario existente
 *     tags: [Horarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_schedule
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del horario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               opening_time:
 *                 type: string
 *                 example: "09:00"
 *               closing_time:
 *                 type: string
 *                 example: "20:00"
 *               closed:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Horario actualizado correctamente
 *       404:
 *         description: Horario no encontrado
 */
router.put('/:id_schedule', verificarToken, verificarRolMultiple(['ADMIN', 'GYM']), controller.actualizarHorario);

module.exports = router;