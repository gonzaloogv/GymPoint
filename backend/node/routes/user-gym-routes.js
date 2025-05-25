const express = require('express');
const router = express.Router();
const controller = require('../controllers/user-gym-controller');

/**
 * @swagger
 * /api/user-gym/alta:
 *   post:
 *     summary: Dar de alta a un usuario en un gimnasio
 *     tags: [Membresías]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_user, id_gym, plan]
 *             properties:
 *               id_user:
 *                 type: integer
 *                 example: 1
 *               id_gym:
 *                 type: integer
 *                 example: 2
 *               plan:
 *                 type: string
 *                 example: "completo"
 *     responses:
 *       200:
 *         description: Usuario dado de alta correctamente
 *       400:
 *         description: Ya estaba activo en este gimnasio
 */
router.post('/alta', controller.darAltaEnGimnasio);

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
 *             required: [id_user, id_gym]
 *             properties:
 *               id_user:
 *                 type: integer
 *                 example: 1
 *               id_gym:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Usuario dado de baja correctamente
 *       400:
 *         description: El usuario no tiene una membresía activa
 */
router.put('/baja', controller.darBajaEnGimnasio);

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
 * /api/user-gym/historial/{id_user}:
 *   get:
 *     summary: Obtener historial completo de membresías de un usuario
 *     tags: [Membresías]
 *     parameters:
 *       - in: path
 *         name: id_user
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
 *         description: Lista de membresías por gimnasio
 */
router.get('/historial/:id_user', controller.obtenerHistorialGimnasiosPorUsuario);

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
 * /api/user-gym/activos/{id_user}:
 *   get:
 *     summary: Obtener los gimnasios activos del usuario
 *     tags: [Membresías]
 *     parameters:
 *       - in: path
 *         name: id_user
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de gimnasios donde el usuario está activo
 */
router.get('/activos/:id_user', controller.obtenerGimnasiosActivos);

module.exports = router;
