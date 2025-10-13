const express = require('express');
const router = express.Router();
const controller = require('../controllers/body-metrics-controller');
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');

router.use(verificarToken, verificarUsuarioApp);

/**
 * @swagger
 * /api/body-metrics:
 *   get:
 *     summary: Listar métricas corporales del usuario
 *     description: Retorna el historial de métricas corporales ordenadas por fecha
 *     tags: [Body Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Cantidad de registros a retornar
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset para paginación
 *     responses:
 *       200:
 *         description: Lista de métricas corporales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_body_metric:
 *                     type: integer
 *                   id_user_profile:
 *                     type: integer
 *                   measured_at:
 *                     type: string
 *                     format: date-time
 *                   weight_kg:
 *                     type: number
 *                     format: float
 *                   height_cm:
 *                     type: number
 *                     format: float
 *                   bmi:
 *                     type: number
 *                     format: float
 *                     description: Índice de Masa Corporal (calculado automáticamente)
 *                   body_fat_percent:
 *                     type: number
 *                     format: float
 *                   muscle_mass_kg:
 *                     type: number
 *                     format: float
 *                   waist_cm:
 *                     type: number
 *                     format: float
 *                   hip_cm:
 *                     type: number
 *                     format: float
 *                   notes:
 *                     type: string
 *                   source:
 *                     type: string
 *                     enum: [MANUAL, SMART_SCALE, TRAINER]
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 *   post:
 *     summary: Registrar nuevas métricas corporales
 *     description: Registra nuevas mediciones corporales. El BMI se calcula automáticamente.
 *     tags: [Body Metrics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               measured_at:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de la medición (por defecto ahora)
 *               weight_kg:
 *                 type: number
 *                 format: float
 *                 minimum: 20
 *                 maximum: 300
 *                 description: Peso en kilogramos
 *               height_cm:
 *                 type: number
 *                 format: float
 *                 minimum: 50
 *                 maximum: 250
 *                 description: Altura en centímetros
 *               body_fat_percent:
 *                 type: number
 *                 format: float
 *                 minimum: 3
 *                 maximum: 60
 *                 description: Porcentaje de grasa corporal
 *               muscle_mass_kg:
 *                 type: number
 *                 format: float
 *                 description: Masa muscular en kilogramos
 *               waist_cm:
 *                 type: number
 *                 format: float
 *                 description: Circunferencia de cintura en cm
 *               hip_cm:
 *                 type: number
 *                 format: float
 *                 description: Circunferencia de cadera en cm
 *               notes:
 *                 type: string
 *                 maxLength: 255
 *                 description: Notas adicionales
 *               source:
 *                 type: string
 *                 enum: [MANUAL, SMART_SCALE, TRAINER]
 *                 default: MANUAL
 *                 description: Fuente de la medición
 *     responses:
 *       201:
 *         description: Métricas registradas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_body_metric:
 *                   type: integer
 *                 bmi:
 *                   type: number
 *                   description: BMI calculado
 *                 weight_kg:
 *                   type: number
 *                 height_cm:
 *                   type: number
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 */
router.get('/', controller.listarMetricas);
router.post('/', controller.registrarMetricas);

/**
 * @swagger
 * /api/body-metrics/latest:
 *   get:
 *     summary: Obtener la métrica más reciente del usuario
 *     tags: [Body Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métrica más reciente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_body_metric:
 *                   type: integer
 *                 id_user_profile:
 *                   type: integer
 *                 measured_at:
 *                   type: string
 *                   format: date-time
 *                 weight_kg:
 *                   type: number
 *                 height_cm:
 *                   type: number
 *                 bmi:
 *                   type: number
 *                 body_fat_percent:
 *                   type: number
 *                 muscle_mass_kg:
 *                   type: number
 *                 waist_cm:
 *                   type: number
 *                 hip_cm:
 *                   type: number
 *                 notes:
 *                   type: string
 *                 source:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de usuario de la app
 *       404:
 *         description: No se encontraron métricas
 */
router.get('/latest', controller.obtenerUltimaMetrica);

module.exports = router;
