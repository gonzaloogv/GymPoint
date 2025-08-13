const express = require('express');
const router = express.Router();
const controller = require('../controllers/reward-code-controller');
const { verificarToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/reward-code/estadisticas/gimnasios:
 *   get:
 *     summary: Obtener cantidad de códigos generados por gimnasio
 *     tags: [Códigos de Recompensa]
 *     responses:
 *       200:
 *         description: Estadísticas de códigos por gimnasio
 */
router.get('/estadisticas/gimnasios', controller.obtenerEstadisticasPorGimnasio);

/**
 * @swagger
 * /api/reward-code/{id_code}/usar:
 *   put:
 *     summary: Marcar un código de recompensa como usado
 *     tags: [Códigos de Recompensa]
 *     parameters:
 *       - in: path
 *         name: id_code
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Código marcado como usado correctamente
 *       400:
 *         description: Código inválido, expirado o ya usado
 */
router.put('/:id_code/usar', controller.marcarComoUsado);

/**
 * @swagger
 * /api/reward-code/me/activos:
 *   get:
 *     summary: Obtener códigos de recompensa activos del usuario autenticado
 *     tags: [Códigos de Recompensa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de códigos activos y vigentes
 */
router.get('/me/activos', verificarToken, controller.obtenerCodigosActivos);

/**
 * @swagger
 * /api/reward-code/me/expirados:
 *   get:
 *     summary: Obtener códigos de recompensa expirados o ya utilizados
 *     tags: [Códigos de Recompensa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de códigos expirados o utilizados
 */
router.get('/me/expirados', verificarToken, controller.obtenerCodigosExpirados);

/**
 * @swagger
 * /api/reward-code/me:
 *   get:
 *     summary: Obtener todos los códigos de recompensa del usuario autenticado
 *     tags: [Códigos de Recompensa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de códigos de recompensa
 */
router.get('/me', verificarToken, controller.obtenerCodigosPorUsuario);

module.exports = router;
