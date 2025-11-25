const express = require('express');
const router = express.Router();
const controller = require('../controllers/location-controller');
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');

/**
 * @swagger
 * /api/location/update:
 *   post:
 *     summary: Actualizar ubicación y obtener gimnasios cercanos
 *     tags: [Ubicación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [latitude, longitude]
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               accuracy:
 *                 type: number
 *                 nullable: true
 *               radiusKm:
 *                 type: number
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Gimnasios cercanos
 *       400:
 *         description: Datos inválidos
 */
router.post('/update', verificarToken, verificarUsuarioApp, controller.updateLocation);

module.exports = router;

