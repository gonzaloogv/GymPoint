const express = require('express');
const router = express.Router();
const controller = require('../controllers/payment-controller');
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');

router.use(verificarToken);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Obtener historial de pagos del usuario autenticado
 *     description: Lista todos los pagos realizados por el usuario con opciones de paginación
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Cantidad de pagos por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Offset para paginación
 *     responses:
 *       200:
 *         description: Historial de pagos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_mp_payment:
 *                     type: integer
 *                     description: ID del pago en el sistema
 *                   id_user_profile:
 *                     type: integer
 *                     description: ID del perfil de usuario
 *                   id_gym:
 *                     type: integer
 *                     description: ID del gimnasio
 *                   payment_id:
 *                     type: string
 *                     description: ID del pago en MercadoPago
 *                   external_reference:
 *                     type: string
 *                     description: Referencia externa única
 *                   status:
 *                     type: string
 *                     enum: [pending, approved, rejected, cancelled, refunded]
 *                     description: Estado del pago
 *                   amount:
 *                     type: number
 *                     format: float
 *                     description: Monto del pago
 *                   currency:
 *                     type: string
 *                     example: ARS
 *                     description: Moneda del pago
 *                   subscription_type:
 *                     type: string
 *                     enum: [MONTHLY, QUARTERLY, BIANNUAL, ANNUAL]
 *                     description: Tipo de suscripción
 *                   auto_renew:
 *                     type: boolean
 *                     description: Si la suscripción se renueva automáticamente
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   processed_at:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                   gym:
 *                     type: object
 *                     properties:
 *                       id_gym:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       city:
 *                         type: string
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere perfil de usuario
 */
router.get('/', verificarUsuarioApp, controller.historialPagos);

/**
 * @swagger
 * /api/payments/create-preference:
 *   post:
 *     summary: Crear preferencia de pago en MercadoPago
 *     description: Genera una preferencia de pago para suscribirse a un gimnasio
 *     tags: [Pagos]
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
 *             properties:
 *               id_gym:
 *                 type: integer
 *                 description: ID del gimnasio al que se suscribirá
 *                 example: 1
 *               subscriptionType:
 *                 type: string
 *                 enum: [MONTHLY, QUARTERLY, BIANNUAL, ANNUAL]
 *                 default: MONTHLY
 *                 description: Tipo de suscripción
 *               autoRenew:
 *                 type: boolean
 *                 default: false
 *                 description: Si la suscripción se renovará automáticamente
 *     responses:
 *       201:
 *         description: Preferencia de pago creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID de la preferencia en MercadoPago
 *                 init_point:
 *                   type: string
 *                   description: URL de pago para web
 *                   example: https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...
 *                 sandbox_init_point:
 *                   type: string
 *                   description: URL de pago para entorno de pruebas
 *       400:
 *         description: Datos inválidos o id_gym no proporcionado
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
 *                       example: GYM_ID_REQUIRED
 *                     message:
 *                       type: string
 *                       example: id_gym es requerido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere perfil de usuario
 *       404:
 *         description: Gimnasio no encontrado
 */
router.post('/create-preference', verificarUsuarioApp, controller.crearPreferencia);

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Obtener historial de pagos del usuario autenticado
 *     description: Alias de GET /api/payments - Lista todos los pagos realizados por el usuario
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Cantidad de pagos por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Offset para paginación
 *     responses:
 *       200:
 *         description: Historial de pagos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_mp_payment:
 *                     type: integer
 *                   id_user_profile:
 *                     type: integer
 *                   id_gym:
 *                     type: integer
 *                   payment_id:
 *                     type: string
 *                   external_reference:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [pending, approved, rejected, cancelled, refunded]
 *                   amount:
 *                     type: number
 *                   currency:
 *                     type: string
 *                   subscription_type:
 *                     type: string
 *                     enum: [MONTHLY, QUARTERLY, BIANNUAL, ANNUAL]
 *                   auto_renew:
 *                     type: boolean
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   processed_at:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                   gym:
 *                     type: object
 *                     properties:
 *                       id_gym:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       city:
 *                         type: string
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere perfil de usuario
 */
router.get('/history', verificarUsuarioApp, controller.historialPagos);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Obtener detalle de un pago específico
 *     description: Obtiene información detallada de un pago. Solo el propietario o un admin pueden verlo.
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pago en el sistema
 *     responses:
 *       200:
 *         description: Detalle del pago
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_mp_payment:
 *                   type: integer
 *                 id_user_profile:
 *                   type: integer
 *                 id_gym:
 *                   type: integer
 *                 payment_id:
 *                   type: string
 *                   description: ID del pago en MercadoPago
 *                 external_reference:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [pending, approved, rejected, cancelled, refunded]
 *                 amount:
 *                   type: number
 *                   format: float
 *                 currency:
 *                   type: string
 *                 subscription_type:
 *                   type: string
 *                   enum: [MONTHLY, QUARTERLY, BIANNUAL, ANNUAL]
 *                 auto_renew:
 *                   type: boolean
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 processed_at:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 gym:
 *                   type: object
 *                   properties:
 *                     id_gym:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     city:
 *                       type: string
 *                     address:
 *                       type: string
 *                 memberships:
 *                   type: array
 *                   description: Membresías asociadas a este pago
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_user_gym:
 *                         type: integer
 *                       start_date:
 *                         type: string
 *                         format: date
 *                       finish_date:
 *                         type: string
 *                         format: date
 *                       active:
 *                         type: boolean
 *                       subscription_type:
 *                         type: string
 *                         enum: [MONTHLY, QUARTERLY, BIANNUAL, ANNUAL]
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permiso para ver este pago
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
 *                       example: PAYMENT_FORBIDDEN
 *                     message:
 *                       type: string
 *                       example: No tienes permiso para ver este pago
 *       404:
 *         description: Pago no encontrado
 */
router.get('/:id', controller.obtenerPago);

module.exports = router;
