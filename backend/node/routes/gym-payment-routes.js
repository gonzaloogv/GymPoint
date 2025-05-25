const express = require('express');
const router = express.Router();
const controller = require('../controllers/gym-payment-controller');

/**
 * @swagger
 * /api/gym-payment:
 *   post:
 *     summary: Registrar un nuevo pago hacia un gimnasio
 *     tags: [Pagos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_user, id_gym, mount, payment_method, payment_date, status]
 *             properties:
 *               id_user:
 *                 type: integer
 *                 example: 1
 *               id_gym:
 *                 type: integer
 *                 example: 2
 *               mount:
 *                 type: number
 *                 example: 8000
 *               payment_method:
 *                 type: string
 *                 example: transferencia
 *               payment_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-05-01
 *               status:
 *                 type: string
 *                 example: PAGADO
 *     responses:
 *       201:
 *         description: Pago registrado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', controller.registrarPago);

/**
 * @swagger
 * /api/gym-payment/gimnasio/{id_gym}:
 *   get:
 *     summary: Obtener los pagos realizados a un gimnasio
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: id_gym
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gimnasio
 *     responses:
 *       200:
 *         description: Lista de pagos con información del usuario
 *       404:
 *         description: Gimnasio no encontrado o sin pagos
 */
router.get('/gimnasio/:id_gym', controller.obtenerPagosPorGimnasio);

/**
 * @swagger
 * /api/gym-payment/{id_user}:
 *   get:
 *     summary: Obtener los pagos realizados por un usuario
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: id_user
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de pagos realizados por el usuario
 *       404:
 *         description: Usuario no encontrado o sin pagos
 */
router.put('/:id_payment', controller.actualizarEstadoPago);

/**
 * @swagger
 * /api/gym-payment/{id_payment}:
 *   put:
 *     summary: Actualizar el estado de un pago
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: id_payment
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pago
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 example: CONFIRMADO
 *     responses:
 *       200:
 *         description: Estado del pago actualizado correctamente
 *       404:
 *         description: Pago no encontrado
 */
router.get('/:id_user', controller.obtenerPagosPorUsuario);

module.exports = router;
