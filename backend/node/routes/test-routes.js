const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/test/test:
 *   get:
 *     summary: Ruta de prueba básica
 *     description: Endpoint de prueba para verificar que el servidor está funcionando
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Test route working
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

module.exports = router;
