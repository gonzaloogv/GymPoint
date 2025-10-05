const express = require('express');
const router = express.Router();
const controller = require('../controllers/gym-special-schedule-controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * /api/gym-special-schedule:
 *   post:
 *     summary: Crear un horario especial para un gimnasio (ej. feriados)
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
 */
router.post('/', verificarToken, verificarAdmin, controller.crearHorarioEspecial);

/**
 * @swagger
 * /api/gym-special-schedule/{id_gym}:
 *   get:
 *     summary: Obtener los horarios especiales de un gimnasio
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
router.get('/:id_gym', controller.obtenerHorariosEspecialesPorGimnasio);

module.exports = router;
