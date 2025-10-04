const express = require('express');
const router = express.Router();
const controller = require('../controllers/transaction-controller');
const { verificarToken, verificarUsuarioApp, verificarAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * /api/transactions/me:
 *   get:
 *     summary: Obtener todas las transacciones del usuario autenticado
 *     description: Retorna el historial completo de movimientos de tokens (asistencias, recompensas, etc.)
 *     tags: [Transacciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de transacciones del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Transacciones obtenidas con éxito
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_transaction:
 *                         type: integer
 *                       id_user:
 *                         type: integer
 *                       movement_type:
 *                         type: string
 *                         example: ASISTENCIA
 *                       amount:
 *                         type: integer
 *                         example: 10
 *                       result_balance:
 *                         type: integer
 *                         example: 150
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       reward:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           name:
 *                             type: string
 *                       userProfile:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           lastname:
 *                             type: string
 *       400:
 *         description: Error al obtener transacciones
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.get('/me', verificarToken, verificarUsuarioApp, controller.obtenerTransaccionesAutenticado);

/**
 * @swagger
 * /api/transactions/{id_user}:
 *   get:
 *     summary: Obtener todas las transacciones de un usuario específico (Admin)
 *     description: Permite a un administrador consultar el historial de transacciones de cualquier usuario
 *     tags: [Transacciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_user
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del user_profile
 *         example: 5
 *     responses:
 *       200:
 *         description: Lista de transacciones del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Transacciones obtenidas con éxito
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_transaction:
 *                         type: integer
 *                       id_user:
 *                         type: integer
 *                       movement_type:
 *                         type: string
 *                         example: GASTO
 *                       amount:
 *                         type: integer
 *                         example: 50
 *                       result_balance:
 *                         type: integer
 *                         example: 100
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       reward:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: Pase 1 día
 *                       userProfile:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           lastname:
 *                             type: string
 *       400:
 *         description: Error al obtener transacciones
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere permisos de administrador
 */
router.get('/:id_user', verificarToken, verificarAdmin, controller.obtenerTransaccionesPorUsuario);

module.exports = router;
