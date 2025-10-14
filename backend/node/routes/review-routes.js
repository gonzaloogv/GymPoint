const express = require('express');
const router = express.Router();
const controller = require('../controllers/review-controller');
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');

/**
 * @swagger
 * /api/reviews/gym/{id_gym}:
 *   get:
 *     summary: Obtener reviews de un gimnasio
 *     description: Lista paginada de reviews de un gimnasio específico
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id_gym
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gimnasio
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de reviews por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset para paginación
 *     responses:
 *       200:
 *         description: Lista de reviews del gimnasio
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_review:
 *                     type: integer
 *                   id_gym:
 *                     type: integer
 *                   id_user_profile:
 *                     type: integer
 *                   rating:
 *                     type: number
 *                     format: float
 *                     minimum: 1
 *                     maximum: 5
 *                   title:
 *                     type: string
 *                   comment:
 *                     type: string
 *                   cleanliness_rating:
 *                     type: integer
 *                   equipment_rating:
 *                     type: integer
 *                   staff_rating:
 *                     type: integer
 *                   value_rating:
 *                     type: integer
 *                   helpful_count:
 *                     type: integer
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   author:
 *                     type: object
 *                     properties:
 *                       id_user_profile:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       lastname:
 *                         type: string
 *       400:
 *         description: ID de gimnasio inválido
 *       404:
 *         description: Gimnasio no encontrado
 */
router.get('/gym/:id_gym', controller.listarPorGym);

/**
 * @swagger
 * /api/reviews/gym/{id_gym}/stats:
 *   get:
 *     summary: Obtener estadísticas de rating de un gimnasio
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id_gym
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gimnasio
 *     responses:
 *       200:
 *         description: Estadísticas de rating del gimnasio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_gym:
 *                   type: integer
 *                 avg_rating:
 *                   type: number
 *                   format: float
 *                 total_reviews:
 *                   type: integer
 *                 rating_5_count:
 *                   type: integer
 *                 rating_4_count:
 *                   type: integer
 *                 rating_3_count:
 *                   type: integer
 *                 rating_2_count:
 *                   type: integer
 *                 rating_1_count:
 *                   type: integer
 *                 avg_cleanliness:
 *                   type: number
 *                 avg_equipment:
 *                   type: number
 *                 avg_staff:
 *                   type: number
 *                 avg_value:
 *                   type: number
 *                 last_review_date:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: ID de gimnasio inválido
 *       404:
 *         description: Gimnasio no encontrado
 */
router.get('/gym/:id_gym/stats', controller.obtenerStats);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Crear una review de gimnasio
 *     description: El usuario debe haber asistido previamente al gimnasio. Otorga tokens por crear review.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_gym
 *               - rating
 *             properties:
 *               id_gym:
 *                 type: integer
 *                 description: ID del gimnasio
 *               rating:
 *                 type: number
 *                 format: float
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating general (1-5)
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 description: Título de la review
 *               comment:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Comentario detallado
 *               cleanliness_rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               equipment_rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               staff_rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               value_rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       201:
 *         description: Review creada exitosamente
 *       400:
 *         description: Datos inválidos o ya existe una review del usuario para este gimnasio
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app o no ha asistido al gimnasio
 */
router.post('/', verificarToken, verificarUsuarioApp, controller.crearReview);

/**
 * @swagger
 * /api/reviews/{id_review}:
 *   patch:
 *     summary: Actualizar una review
 *     description: Solo el autor o un admin puede actualizar la review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_review
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 format: float
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               comment:
 *                 type: string
 *               cleanliness_rating:
 *                 type: integer
 *               equipment_rating:
 *                 type: integer
 *               staff_rating:
 *                 type: integer
 *               value_rating:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Review actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permiso para actualizar esta review
 *       404:
 *         description: Review no encontrada
 *   delete:
 *     summary: Eliminar una review
 *     description: Solo el autor o un admin puede eliminar la review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_review
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la review
 *     responses:
 *       204:
 *         description: Review eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permiso para eliminar esta review
 *       404:
 *         description: Review no encontrada
 */
router.patch('/:id_review', verificarToken, verificarUsuarioApp, controller.actualizarReview);
router.delete('/:id_review', verificarToken, verificarUsuarioApp, controller.eliminarReview);

/**
 * @swagger
 * /api/reviews/{id_review}/helpful:
 *   post:
 *     summary: Marcar una review como útil
 *     description: El usuario no puede marcar su propia review como útil
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_review
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la review
 *     responses:
 *       200:
 *         description: Review marcada como útil exitosamente
 *       400:
 *         description: Ya marcaste esta review como útil o es tu propia review
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 *       404:
 *         description: Review no encontrada
 *   delete:
 *     summary: Remover marca de útil de una review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_review
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la review
 *     responses:
 *       200:
 *         description: Marca de útil removida exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 *       404:
 *         description: Review no encontrada
 */
router.post('/:id_review/helpful', verificarToken, verificarUsuarioApp, controller.marcarUtil);
router.delete('/:id_review/helpful', verificarToken, verificarUsuarioApp, controller.removerUtil);

module.exports = router;
