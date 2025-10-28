const express = require('express');
const router = express.Router();
const gymRequestController = require('../controllers/gym-request-controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * /api/gym-requests:
 *   get:
 *     summary: Obtener todas las solicitudes de gimnasios (solo admin)
 *     tags: [GymRequests]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', verificarToken, verificarAdmin, gymRequestController.getAllGymRequests);

/**
 * @swagger
 * /api/gym-requests/{id}:
 *   get:
 *     summary: Obtener una solicitud por ID (solo admin)
 *     tags: [GymRequests]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', verificarToken, verificarAdmin, gymRequestController.getGymRequestById);

/**
 * @swagger
 * /api/gym-requests:
 *   post:
 *     summary: Crear una nueva solicitud de gimnasio (público desde landing)
 *     tags: [GymRequests]
 */
router.post('/', gymRequestController.createGymRequest);

/**
 * @swagger
 * /api/gym-requests/{id}/approve:
 *   post:
 *     summary: Aprobar una solicitud y crear el gimnasio (solo admin)
 *     tags: [GymRequests]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/approve', verificarToken, verificarAdmin, gymRequestController.approveGymRequest);

/**
 * @swagger
 * /api/gym-requests/{id}/reject:
 *   post:
 *     summary: Rechazar una solicitud (solo admin)
 *     tags: [GymRequests]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/reject', verificarToken, verificarAdmin, gymRequestController.rejectGymRequest);

/**
 * @swagger
 * /api/gym-requests/{id}:
 *   delete:
 *     summary: Eliminar una solicitud (solo admin)
 *     tags: [GymRequests]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', verificarToken, verificarAdmin, gymRequestController.deleteGymRequest);

module.exports = router;
