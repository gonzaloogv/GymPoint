const express = require('express');
const router = express.Router();
const gymController = require('../controllers/gym-controller');
const gymScheduleController = require('../controllers/gym-schedule-controller');
const { verificarToken, verificarRol, verificarUsuarioApp, verificarAdmin } = require('../middlewares/auth');

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
 * /api/gyms/amenidades:
 *   get:
 *     summary: Obtener lista de amenidades disponibles
 *     description: Lista todas las amenidades que pueden tener los gimnasios
 *     tags: [Gimnasios]
 *     responses:
 *       200:
 *         description: Lista de amenidades disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_amenity:
 *                     type: integer
 *                     description: ID de la amenidad
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: Nombre de la amenidad
 *                     example: Estacionamiento
 *       500:
 *         description: Error al obtener amenidades
 */
router.get('/amenidades', gymController.getAmenities);

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
 *         example: Resistencia
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Precio mínimo mensual
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Precio máximo mensual
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Tipo de gimnasio (solo válido para usuarios PREMIUM)
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
 *         description: Parámetros inválidos
 *       403:
 *         description: Solo usuarios PREMIUM pueden filtrar por tipo
 */
router.get('/filtro', verificarToken, gymController.filtrarGimnasios);

/**
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
 * /api/gyms/nearby:
 *   get:
 *     summary: Buscar gimnasios cercanos (alias en inglés)
 *     description: Alias en inglés de /cercanos para compatibilidad con plan MVP (fase 1.1). Usa el mismo algoritmo optimizado (bounding box + Haversine).
 *     tags: [Gimnasios]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitud del centro de búsqueda
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitud del centro de búsqueda
 *       - in: query
 *         name: radiusKm
 *         schema:
 *           type: number
 *           default: 10
 *         description: Radio de búsqueda en kilómetros
 *     responses:
 *       200:
 *         description: Lista de gimnasios cercanos ordenada por distancia
 *       400:
 *         description: Parámetros inválidos
 */
router.get('/nearby', gymController.buscarGimnasiosCercanos);

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
 * /api/gyms/me/favorites:
 *   get:
 *     summary: Listar gimnasios favoritos del usuario autenticado
 *     tags: [Gimnasios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de gimnasios favoritos
 */
router.get('/me/favorites', verificarToken, verificarUsuarioApp, gymController.obtenerFavoritos);

// ============================================================================
// NESTED SCHEDULE ROUTES - RESTful Pattern
// IMPORTANT: These routes must be BEFORE /:id routes to avoid conflicts
// ============================================================================

router.get('/:gymId/schedules', gymScheduleController.listGymSchedules);
router.post('/:gymId/schedules', verificarToken, verificarAdmin, gymScheduleController.createGymSchedule);
router.patch('/:gymId/schedules/:scheduleId', verificarToken, verificarAdmin, gymScheduleController.updateGymSchedule);
router.delete('/:gymId/schedules/:scheduleId', verificarToken, verificarAdmin, gymScheduleController.deleteGymSchedule);

router.get('/:gymId/special-schedules', gymScheduleController.listGymSpecialSchedules);
router.post('/:gymId/special-schedules', verificarToken, verificarAdmin, gymScheduleController.createGymSpecialSchedule);
router.patch('/:gymId/special-schedules/:specialScheduleId', verificarToken, verificarAdmin, gymScheduleController.updateGymSpecialSchedule);
router.delete('/:gymId/special-schedules/:specialScheduleId', verificarToken, verificarAdmin, gymScheduleController.deleteGymSpecialSchedule);

// ============================================================================
// GYM ROUTES WITH :id PARAMETER
// IMPORTANT: These routes must be AFTER more specific routes
// ============================================================================

/**
 * @swagger
 * /api/gyms/{id}/favorite:
 *   post:
 *     summary: Alternar favorito para un gimnasio (agrega o quita para el usuario actual)
 *     tags: [Gimnasios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gimnasio
 *     responses:
 *       200:
 *         description: Estado actualizado del favorito
 */
router.post('/:id/favorite', verificarToken, verificarUsuarioApp, gymController.toggleFavorito);
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
 *     responses:
 *       200:
 *         description: Gimnasio actualizado correctamente
 *       404:
 *         description: Gimnasio no encontrado
 */
router.put('/:id', verificarToken, verificarRol('ADMIN'), gymController.updateGym);

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
router.delete('/:id', verificarToken, verificarRol('ADMIN'), gymController.deleteGym);

module.exports = router;