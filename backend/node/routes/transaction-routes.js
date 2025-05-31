const express = require('express');
const router = express.Router();
const controller = require('../controllers/transaction-controller');
const { verificarToken, verificarRol } = require('../middlewares/auth');

/**
 * @swagger
 * /api/transactions/me:
 *   get:
 *     summary: Obtener todas las transacciones del usuario autenticado
 *     tags: [Transacciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de transacciones del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   movement_type:
 *                     type: string
 *                   amount:
 *                     type: integer
 *                   result_balance:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   Reward:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *       404:
 *         description: Usuario sin transacciones
 */
router.get('/me', verificarToken, controller.obtenerTransaccionesAutenticado);

/**
 * @swagger
 * /api/transactions/{id_user}:
 *   get:
 *     summary: Obtener todas las transacciones de un usuario específico (admin)
 *     tags: [Transacciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_user
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de transacciones del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   movement_type:
 *                     type: string
 *                   amount:
 *                     type: integer
 *                   result_balance:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   Reward:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *       404:
 *         description: Usuario sin transacciones
 */
router.get('/:id_user', verificarToken, verificarRol('ADMIN'), controller.obtenerTransaccionesPorUsuario);

module.exports = router;
