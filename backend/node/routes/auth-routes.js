const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');
const rateLimit = require('express-rate-limit');
const validate = require('../middlewares/validate');
const { z } = require('zod');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true, // X-RateLimit-*
  legacyHeaders: false,
  message: 'Too many login attempts',
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  name: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  gender: z.string(),
  locality: z.string(),
  subscription: z.string(),
  age: z.number(),
  frequency_goal: z.number(),
});

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints relacionados a autenticación y sesión
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - lastname
 *               - email
 *               - password
 *               - gender
 *               - locality
 *               - subscription
 *               - age
 *               - frequency_goal
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gonzalo
 *               lastname:
 *                 type: string
 *                 example: Gómez
 *               email:
 *                 type: string
 *                 example: usuario@test.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               gender:
 *                 type: string
 *                 example: M
 *               locality:
 *                 type: string
 *                 example: Resistencia
 *               subscription:
 *                 type: string
 *                 example: FREE
 *               age:
 *                 type: integer
 *                 example: 23
 *               frequency_goal:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Email ya registrado o datos inválidos
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión con email y contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@test.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Usuario autenticado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', loginLimiter, validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Iniciar sesión con Google
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: ID token de Google
 *                 example: ya29.a0AWY7Ckk...
 *     responses:
 *       200:
 *         description: Usuario autenticado por Google
 *       401:
 *         description: Token de Google inválido o expirado
 */
router.post('/google', authController.googleLogin);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Obtener un nuevo access token usando un refresh token válido
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsIn...
 *     responses:
 *       200:
 *         description: Nuevo token de acceso emitido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       403:
 *         description: Refresh token inválido o expirado
 *       401:
 *         description: Error de verificación
 */
router.post('/refresh-token', authController.refreshAccessToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión (revoca refresh token)
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Refresh token a revocar
 *                 example: eyJhbGciOiJIUzI1NiIsIn...
 *     responses:
 *       200:
 *         description: Logout exitoso, token revocado
 *       500:
 *         description: Error en el cierre de sesión
 */
router.post('/logout', authController.logout);

module.exports = router;
