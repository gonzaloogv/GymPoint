const express = require('express');
const router = express.Router();
const controller = require('../controllers/assistance-controller');

// Registrar asistencia con validación GPS + tokens + racha
/**
 * @swagger
 * /api/assistances/registrar:
 *   post:
 *     summary: Registrar asistencia del usuario en un gimnasio con validación GPS, racha y tokens
 *     tags: [Asistencias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_user
 *               - id_gym
 *               - latitude
 *               - longitude
 *             properties:
 *               id_user:
 *                 type: integer
 *                 example: 7
 *               id_gym:
 *                 type: integer
 *                 example: 3
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: -34.603722
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: -58.38159
 *     responses:
 *       201:
 *         description: Asistencia registrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 asistencia:
 *                   type: object
 *                 distancia:
 *                   type: integer
 *                   description: Distancia en metros desde el gimnasio
 *                   example: 6
 *                 tokens_actuales:
 *                   type: integer
 *                   description: Tokens totales del usuario tras registrar asistencia
 *                   example: 30
 *       400:
 *         description: Datos inválidos o asistencia ya registrada hoy
 *       403:
 *         description: Usuario fuera de rango o sin racha válida
 */
router.post('/registrar', controller.registrarAsistencia);
/**
 * @swagger
 * /api/assistances/{id_user}:
 *   get:
 *     summary: Obtener historial de asistencias del usuario
 *     tags: [Asistencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_user
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de asistencias con información del gimnasio
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                   hour:
 *                     type: string
 *                   Gym:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       city:
 *                         type: string
 *                       address:
 *                         type: string
 *       404:
 *         description: Usuario no encontrado o sin asistencias
 */
router.get('/:id_user', controller.obtenerHistorialAsistencias);

// Podés agregar otros endpoints como historial más adelante

module.exports = router;
