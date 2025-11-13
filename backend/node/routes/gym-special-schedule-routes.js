const express = require('express');
const router = express.Router();
const controller = require('../controllers/gym-special-schedule-controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * /api/gym-special-schedules/{gymId}:
 *   get:
 *     summary: Listar horarios especiales de un gimnasio
 *     tags: [Gym Special Schedules]
 *     parameters:
 *       - in: path
 *         name: gymId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gimnasio
 *     responses:
 *       200:
 *         description: Lista de horarios especiales
 *       404:
 *         description: Gimnasio no encontrado
 */
/**
 * @swagger
 * /api/special-schedules/{id_gym}:
 *   get:
 *     summary: Obtener los horarios especiales de un gimnasio [LEGACY - usa /api/gym-special-schedules]
 *     tags: [Horarios Especiales]
 *     parameters:
 *       - in: path
 *         name: id_gym
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gimnasio
 *     responses:
 *       200:
 *         description: Lista de horarios especiales
 *       404:
 *         description: Gimnasio no encontrado o sin horarios especiales
 */
router.get('/:gymId', controller.listGymSpecialSchedules);

/**
 * @swagger
 * /api/gym-special-schedules/{gymId}:
 *   post:
 *     summary: Crear un horario especial
 *     tags: [Gym Special Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gymId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, closed, motive]
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               opening_time:
 *                 type: string
 *               closing_time:
 *                 type: string
 *               closed:
 *                 type: boolean
 *               motive:
 *                 type: string
 *     responses:
 *       201:
 *         description: Horario especial creado
 *       409:
 *         description: Ya existe un horario para esa fecha
 */
/**
 * @swagger
 * /api/special-schedules:
 *   post:
 *     summary: Crear un horario especial [LEGACY - usa /api/gym-special-schedules]
 *     tags: [Horarios Especiales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_gym, date, opening_time, closing_time, closed, motive]
 *             properties:
 *               id_gym:
 *                 type: integer
 *                 example: 2
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-25"
 *               opening_time:
 *                 type: string
 *                 example: "10:00"
 *               closing_time:
 *                 type: string
 *                 example: "14:00"
 *               closed:
 *                 type: boolean
 *                 example: false
 *               motive:
 *                 type: string
 *                 example: "Feriado de Navidad"
 *     responses:
 *       201:
 *         description: Horario especial creado correctamente
 *       400:
 *         description: Ya existe un horario especial para esa fecha
 *       401:
 *         description: Token no válido o no proporcionado
 *       403:
 *         description: Requiere permisos de administrador
 */
router.post('/:gymId', verificarToken, verificarAdmin, controller.createGymSpecialSchedule);

/**
 * @swagger
 * /api/gym-special-schedules/{id}:
 *   put:
 *     summary: Actualizar un horario especial
 *     tags: [Gym Special Schedules]
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
 *               id_gym:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               opening_time:
 *                 type: string
 *               closing_time:
 *                 type: string
 *               closed:
 *                 type: boolean
 *               motive:
 *                 type: string
 *     responses:
 *       200:
 *         description: Horario especial actualizado
 *       404:
 *         description: Horario especial no encontrado
 */
router.put('/:id', verificarToken, verificarAdmin, controller.updateGymSpecialSchedule);

/**
 * @swagger
 * /api/gym-special-schedules/{id}:
 *   delete:
 *     summary: Eliminar un horario especial
 *     tags: [Gym Special Schedules]
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
 *         description: Horario especial eliminado
 *       404:
 *         description: Horario especial no encontrado
 */
router.delete('/:id', verificarToken, verificarAdmin, controller.deleteGymSpecialSchedule);

module.exports = router;
