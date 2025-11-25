const express = require('express');
const router = express.Router();
const controller = require('../controllers/user-gym-controller');
const { verificarToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/user-gym/alta:
 *   post:
 *     summary: Dar de alta a un usuario en un gimnasio
 *     tags: [Membresías]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_gym, plan]
 *             properties:
 *               id_gym:
 *                 type: integer
 *                 description: ID del gimnasio
 *                 example: 2
 *               plan:
 *                 type: string
 *                 description: Plan de membresía (case-insensitive)
 *                 enum:
 *                   - MENSUAL
 *                   - SEMANAL
 *                   - ANUAL
 *                 example: mensual
 *     responses:
 *       201:
 *         description: Usuario dado de alta correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Alta en gimnasio realizada con éxito
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_user:
 *                       type: integer
 *                     id_gym:
 *                       type: integer
 *                     plan:
 *                       type: string
 *                       example: MENSUAL
 *                     active:
 *                       type: boolean
 *                     start_date:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Faltan datos requeridos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: MISSING_FIELDS
 *                     message:
 *                       type: string
 *       401:
 *         description: Token no válido
 *       422:
 *         description: Plan inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: INVALID_PLAN
 *                     message:
 *                       type: string
 *                       example: Plan inválido. Valores aceptados MENSUAL, SEMANAL, ANUAL
 *                     accepted_values:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [MENSUAL, SEMANAL, ANUAL]
 */
router.post('/alta', verificarToken, controller.darAltaEnGimnasio);

/**
 * @swagger
 * /api/user-gym/baja:
 *   put:
 *     summary: Dar de baja al usuario en un gimnasio
 *     tags: [Membresías]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_gym]
 *             properties:
 *               id_gym:
 *                 type: integer
 *                 example: 2
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario dado de baja correctamente
 */
router.put('/baja', verificarToken, controller.darBajaEnGimnasio);

/**
 * @swagger
 * /api/user-gym/gimnasio/{id_gym}/conteo:
 *   get:
 *     summary: Obtener cantidad de usuarios activos en un gimnasio
 *     tags: [Membresías]
 *     parameters:
 *       - in: path
 *         name: id_gym
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cantidad de usuarios activos
 */
router.get('/gimnasio/:id_gym/conteo', controller.contarUsuariosActivosEnGimnasio);

/**
 * @swagger
 * /api/user-gym/me/historial:
 *   get:
 *     summary: Obtener historial completo de membresías del usuario autenticado
 *     tags: [Membresías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado (activo o no)
 *     responses:
 *       200:
 *         description: Lista de membresías por gimnasio
 */
router.get('/me/historial', verificarToken, controller.obtenerHistorialGimnasiosPorUsuario);

/**
 * @swagger
 * /api/user-gym/gimnasio/{id_gym}:
 *   get:
 *     summary: Obtener historial de usuarios de un gimnasio
 *     tags: [Membresías]
 *     parameters:
 *       - in: path
 *         name: id_gym
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: active
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado (activo o no)
 *     responses:
 *       200:
 *         description: Lista de usuarios que pasaron por el gimnasio
 */
router.get('/gimnasio/:id_gym', controller.obtenerHistorialUsuariosPorGimnasio);

/**
 * @swagger
 * /api/user-gym/me/activos:
 *   get:
 *     summary: Obtener los gimnasios activos del usuario autenticado
 *     tags: [Membresías]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de gimnasios donde el usuario está activo
 */
router.get('/me/activos', verificarToken, controller.obtenerGimnasiosActivos);

module.exports = router;