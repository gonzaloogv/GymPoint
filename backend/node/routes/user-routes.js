const express = require('express');
const router = express.Router();
const controller = require('../controllers/user-controller');
const { verificarToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obtener el perfil del usuario autenticado
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_user:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 lastname:
 *                   type: string
 *                 email:
 *                   type: string
 *                 gender:
 *                   type: string
 *                 locality:
 *                   type: string
 *                 age:
 *                   type: integer
 *                 subscription:
 *                   type: string
 *                 tokens:
 *                   type: integer
 *       401:
 *         description: Token inválido o no enviado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/me', verificarToken, controller.obtenerPerfil);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Actualizar los datos del perfil del usuario autenticado
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               lastname:
 *                 type: string
 *               gender:
 *                 type: string
 *               locality:
 *                 type: string
 *               age:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       401:
 *         description: Token inválido o no enviado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/me', verificarToken, controller.actualizarPerfil);

module.exports = router;
