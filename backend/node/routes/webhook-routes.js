const express = require('express');
const router = express.Router();
const controller = require('../controllers/webhook-controller');

/**
 * @swagger
 * /api/webhooks/mercadopago:
 *   post:
 *     summary: Webhook de notificaciones de MercadoPago
 *     description: Endpoint para recibir notificaciones de eventos de pago desde MercadoPago. Este endpoint procesa automáticamente los pagos aprobados y actualiza las membresías de los usuarios.
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [payment, plan, subscription, point_integration, invoice, merchant_order]
 *                 description: Tipo de notificación de MercadoPago
 *                 example: payment
 *               data:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID del recurso notificado
 *                     example: "1234567890"
 *                   resource:
 *                     type: string
 *                     description: URL del recurso (alternativo a id)
 *                     example: "https://api.mercadopago.com/v1/payments/1234567890"
 *               action:
 *                 type: string
 *                 description: Acción que generó la notificación
 *                 example: payment.created
 *               date_created:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de creación de la notificación
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario en MercadoPago
 *     responses:
 *       200:
 *         description: Webhook procesado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 processed:
 *                   type: boolean
 *                   description: Indica si el webhook fue procesado
 *                   example: true
 *                 reason:
 *                   type: string
 *                   description: Razón del resultado (solo cuando processed es false)
 *                   example: ignored_event
 *                   enum: [ignored_event, missing_payment_id, payment_already_processed]
 *                 payment:
 *                   type: object
 *                   description: Información del pago procesado (solo cuando processed es true)
 *                   properties:
 *                     id_mp_payment:
 *                       type: integer
 *                     payment_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [pending, approved, rejected, cancelled, refunded]
 *                     amount:
 *                       type: number
 *                     processed_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Datos inválidos en el webhook
 *       500:
 *         description: Error al procesar el webhook
 *     x-internal: true
 */
router.post('/mercadopago', controller.mercadopagoWebhook);

module.exports = router;
