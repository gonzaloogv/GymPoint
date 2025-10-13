const express = require('express');
const router = express.Router();
const gymController = require('../controllers/gym-controller');
const { verificarToken, verificarRol } = require('../middlewares/auth');

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
 * /api/gyms/amenities:
 *   get:
 *     summary: Listar amenidades disponibles para los gimnasios
 *     tags: [Gimnasios]
 *     responses:
 *       200:
 *         description: Lista de amenidades agrupadas por categoría
 */
router.get('/amenities', gymController.getAmenities);

/**
 * @swagger
 * /api/gyms/filtro:
 *   get:
 *     summary: Filtrar gimnasios por ciudad, precio y tipo (solo usuarios PREMIUM)
 *     tags: [Gimnasios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Ciudad donde buscar gimnasios
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Precio m�nimo mensual
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Precio m�ximo mensual
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Tipo de gimnasio (solo v�lido para usuarios PREMIUM)
 *       - in: query
 *         name: amenities
 *         schema:
 *           type: string
 *         description: IDs de amenidades separados por coma (solo usuarios PREMIUM)
 *     responses:
 *       200:
 *         description: Lista filtrada de gimnasios y posible advertencia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gimnasios:
 *                   type: array
 *                   items:
 *                     type: object
 *                 advertencia:
 *                   type: string
 *                   nullable: true
 *                   example: "Filtro por tipo ignorado para usuarios FREE"
 *       400:
 *         description: Parometros involidos
 *       403:
 *         description: Solo usuarios PREMIUM pueden filtrar por tipo
 * @swagger
 * /api/gyms/cercanos:
 *   get:
 *     summary: Buscar gimnasios cercanos usando búsqueda geográfica optimizada (bounding box + Haversine)
 *     tags: [Gimnasios]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: Latitud del centro de búsqueda
 *         example: -31.4201
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: Longitud del centro de búsqueda (también acepta 'lon')
 *         example: -64.1888
 *       - in: query
 *         name: radiusKm
 *         required: false
 *         schema:
 *           type: number
 *           minimum: 0.1
 *           maximum: 100
 *           default: 5
 *         description: Radio de búsqueda en kilómetros
 *         example: 10
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Límite de resultados
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Offset para paginación
 *     responses:
 *       200:
 *         description: Gimnasios dentro del radio ordenados por distancia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Gimnasios cercanos obtenidos con éxito
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_gym:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       address:
 *                         type: string
 *                       city:
 *                         type: string
 *                       latitude:
 *                         type: number
 *                       longitude:
 *                         type: number
 *                       distance_km:
 *                         type: string
 *                         description: Distancia en kilómetros (2 decimales)
 *                         example: "2.45"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Cantidad de resultados
 *                     center:
 *                       type: object
 *                       properties:
 *                         lat:
 *                           type: number
 *                         lng:
 *                           type: number
 *                     radius_km:
 *                       type: number
 *       400:
 *         description: Parámetros inválidos o faltantes
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
 *                       example: MISSING_PARAMS
 *                     message:
 *                       type: string
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
 *               whatsapp:
 *                 type: string
 *               instagram:
 *                 type: string
 *               facebook:
 *                 type: string
 *               google_maps_url:
 *                 type: string
 *               max_capacity:
 *                 type: integer
 *               area_sqm:
 *                 type: number
 *               verified:
 *                 type: boolean
 *               featured:
 *                 type: boolean
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Gimnasio creado correctamente
 *       400:
 *         description: Datos invalidos
 */
router.post('/', verificarToken, verificarRol('ADMIN'), gymController.createGym);

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
 *               whatsapp:
 *                 type: string
 *               instagram:
 *                 type: string
 *               facebook:
 *                 type: string
 *               google_maps_url:
 *                 type: string
 *               max_capacity:
 *                 type: integer
 *               area_sqm:
 *                 type: number
 *               verified:
 *                 type: boolean
 *               featured:
 *                 type: boolean
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Gimnasio actualizado correctamente
 *       404:
 *         description: Gimnasio no encontrado
 */
router.delete('/:id', verificarToken, verificarRol('ADMIN'), gymController.deleteGym);

module.exports = router;



