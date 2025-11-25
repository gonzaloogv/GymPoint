const express = require('express');
const router = express.Router();
const controller = require('../controllers/challenge-controller');
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');

/**
 * @swagger
 * /api/challenges/today:
 *   get:
 *     summary: Obtener desafío diario de hoy y progreso del usuario
 *     tags: [Desafíos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Desafío del día
 */
router.get('/today', verificarToken, verificarUsuarioApp, controller.getToday);

/**
 * @swagger
 * /api/challenges/{id}/progress:
 *   put:
 *     summary: Actualizar progreso del desafío diario
 *     tags: [Desafíos]
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
 *             required: [value]
 *             properties:
 *               value:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Progreso actualizado
 */
router.put('/:id/progress', verificarToken, verificarUsuarioApp, controller.updateProgress);

module.exports = router;

