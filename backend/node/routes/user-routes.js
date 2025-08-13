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
 *         description: Perfil del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_user:
 *                   type: integer
 *                   example: 7
 *                 name:
 *                   type: string
 *                   example: Gonzalo
 *                 lastname:
 *                   type: string
 *                   example: Gómez
 *                 email:
 *                   type: string
 *                   example: gonzalo@test.com
 *                 gender:
 *                   type: string
 *                   example: M
 *                 locality:
 *                   type: string
 *                   example: Resistencia
 *                 age:
 *                   type: integer
 *                   example: 23
 *                 subscription:
 *                   type: string
 *                   example: FREE
 *                 tokens:
 *                   type: integer
 *                   example: 120
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
 *                 example: Gonzalo
 *               lastname:
 *                 type: string
 *                 example: Gómez
 *               gender:
 *                 type: string
 *                 example: M
 *               locality:
 *                 type: string
 *                 example: Resistencia
 *               age:
 *                 type: integer
 *                 example: 23
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       401:
 *         description: Token inválido o no enviado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/me', verificarToken, controller.actualizarPerfil);

/**
 * @swagger
 * /api/users/me/password:
 *   put:
 *     summary: Cambiar la contraseña del usuario autenticado
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: oldPass123
 *               newPassword:
 *                 type: string
 *                 example: newPass123
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       400:
 *         description: Error al cambiar la contraseña
 */
router.put('/me/password', verificarToken, controller.cambiarPassword);

module.exports = router;
