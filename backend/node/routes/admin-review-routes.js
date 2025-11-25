
const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin-review-controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth');

router.use(verificarToken, verificarAdmin);

/**
 * @swagger
 * /api/admin/reviews:
 *   get:
 *     summary: Obtener todas las reviews (para admin)
 *     tags: [Admin - Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *       - in: query
 *         name: is_approved
 *         schema: { type: boolean }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: 'created_at' }
 *       - in: query
 *         name: order
 *         schema: { type: string, default: 'DESC' }
 *     responses:
 *       200: { description: 'Lista de reviews' }
 */
router.get('/', controller.getAllReviews);

/**
 * @swagger
 * /api/admin/reviews/stats:
 *   get:
 *     summary: Obtener estadísticas de reviews (para admin)
 *     tags: [Admin - Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: 'Estadísticas de reviews' }
 */
router.get('/stats', controller.getReviewStats);

/**
 * @swagger
 * /api/admin/reviews/{id_review}/approve:
 *   put:
 *     summary: Aprobar o desaprobar una review
 *     tags: [Admin - Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_review
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [is_approved]
 *             properties:
 *               is_approved: { type: boolean }
 *     responses:
 *       200: { description: 'Review actualizada' }
 *       400: { description: 'Datos inválidos' }
 *       404: { description: 'Review no encontrada' }
 */
router.put('/:id_review/approve', controller.approveReview);

/**
 * @swagger
 * /api/admin/reviews/{id_review}:
 *   delete:
 *     summary: Eliminar una review (admin)
 *     tags: [Admin - Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_review
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: 'Review eliminada' }
 *       404: { description: 'Review no encontrada' }
 */
router.delete('/:id_review', controller.deleteReview);

module.exports = router;
