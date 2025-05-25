const express = require('express');
const router = express.Router();
const gymController = require('../controllers/gym-controller');

/**
 * @swagger
 * /api/gyms:
 *   get:
 *     summary: Obtener todos los gimnasios disponibles
 *     tags: [Gimnasios]
 *     responses:
 *       200:
 *         description: Lista completa de gimnasios
 */
router.get('/', gymController.getAllGyms);

/**
 * @swagger
 * /api/gyms/tipos:
 *   get:
 *     summary: Obtener los tipos de gimnasio disponibles
 *     tags: [Gimnasios]
 *     responses:
 *       200:
 *         description: Lista de tipos válidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/tipos', gymController.getGymTypes);

/**
 * @swagger
 * /api/gyms/filtro:
 *   get:
 *     summary: Filtrar gimnasios por ciudad, precio y tipo (solo PREMIUM)
 *     tags: [Gimnasios]
 *     parameters:
 *       - in: query
 *         name: id_user
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           description: Solo para usuarios PREMIUM
 *     responses:
 *       200:
 *         description: Lista filtrada de gimnasios y posible advertencia
 *       400:
 *         description: Usuario no encontrado o tipo inválido
 */
router.get('/filtro', gymController.filtrarGimnasios);

/**
 * @swagger
 * /api/gyms/cercanos:
 *   get:
 *     summary: Buscar gimnasios cercanos a una ubicación
 *     tags: [Gimnasios]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Lista ordenada por cercanía
 */
router.get('/cercanos', gymController.buscarGimnasiosCercanos);

/**
 * @swagger
 * /api/gyms/localidad:
 *   get:
 *     summary: Obtener gimnasios por ciudad
 *     tags: [Gimnasios]
 *     parameters:
 *       - in: query
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la ciudad
 *     responses:
 *       200:
 *         description: Lista de gimnasios en la ciudad
 */
router.get('/localidad', gymController.getGymsByCity);

/**
 * @swagger
 * /api/gyms/{id}:
 *   get:
 *     summary: Obtener un gimnasio por ID
 *     tags: [Gimnasios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gimnasio
 *     responses:
 *       200:
 *         description: Detalles del gimnasio
 *       404:
 *         description: Gimnasio no encontrado
 */
router.get('/:id', gymController.getGymById);

/**
 * @swagger
 * /api/gyms:
 *   post:
 *     summary: Registrar un nuevo gimnasio
 *     tags: [Gimnasios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - city
 *               - address
 *               - latitude
 *               - longitude
 *               - gym_type
 *               - equipment
 *               - month_price
 *               - week_price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               city:
 *                 type: string
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               website:
 *                 type: string
 *               social_media:
 *                 type: string
 *               gym_type:
 *                 type: string
 *               equipment:
 *                 type: string
 *               month_price:
 *                 type: number
 *               week_price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Gimnasio creado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', gymController.createGym);

/**
 * @swagger
 * /api/gyms/{id}:
 *   put:
 *     summary: Actualizar la información de un gimnasio
 *     tags: [Gimnasios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del gimnasio a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               city:
 *                 type: string
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               website:
 *                 type: string
 *               social_media:
 *                 type: string
 *               gym_type:
 *                 type: string
 *               equipment:
 *                 type: string
 *               month_price:
 *                 type: number
 *               week_price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Gimnasio actualizado correctamente
 *       404:
 *         description: Gimnasio no encontrado
 */
router.put('/:id', gymController.updateGym);

/**
 * @swagger
 * /api/gyms/{id}:
 *   delete:
 *     summary: Eliminar un gimnasio por su ID
 *     tags: [Gimnasios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del gimnasio a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Gimnasio eliminado correctamente
 *       404:
 *         description: Gimnasio no encontrado
 */
router.delete('/:id', gymController.deleteGym);

module.exports = router;
