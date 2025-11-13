const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const { checkMigrations } = require('../migrate');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check (liveness probe)
 *     description: Verifica que el servidor esté corriendo
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Tiempo en segundos que el servidor ha estado activo
 */
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development'
  });
});

/**
 * @swagger
 * /ready:
 *   get:
 *     summary: Readiness check
 *     description: Verifica que el servidor esté listo para recibir tráfico (DB conectada, migraciones aplicadas)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor listo para recibir tráfico
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ready
 *                 database:
 *                   type: string
 *                   example: connected
 *                 migrations:
 *                   type: string
 *                   example: up to date
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       503:
 *         description: Servidor no está listo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: not ready
 *                 reason:
 *                   type: string
 *                 database:
 *                   type: string
 *                 migrations:
 *                   type: object
 */
router.get('/ready', async (req, res) => {
  try {
    // Verificar conexión a DB
    await sequelize.authenticate();
    
    // Verificar que no hay migraciones pendientes
    const { pending } = await checkMigrations();
    
    if (pending.length > 0) {
      return res.status(503).json({
        status: 'not ready',
        reason: 'Pending migrations',
        database: 'connected',
        migrations: {
          status: 'pending',
          pending,
          count: pending.length
        },
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({ 
      status: 'ready',
      database: 'connected',
      migrations: 'up to date',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      reason: error.message,
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

