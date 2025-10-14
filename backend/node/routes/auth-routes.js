const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');

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
 *               role:
 *                 type: string
 *                 example: USER
 *                 enum: [USER, PREMIUM, ADMIN]
 *                 default: USER
 *               birth_date:
 *                 type: string
 *                 format: date
 *                 example: 1995-05-20
 *               frequency_goal:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Datos inválidos
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
 *                       example: INVALID_DATA
 *                     message:
 *                       type: string
 *       409:
 *         description: Email ya registrado
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
 *                       example: EMAIL_ALREADY_EXISTS
 *                     message:
 *                       type: string
 *                       example: El email ya está registrado
 */
router.post('/register', authController.register);

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
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Iniciar sesión con Google OAuth2
 *     description: |
 *       Autentica a un usuario mediante Google OAuth2. Si el usuario no existe, se crea automáticamente.
 *       - Si el email ya existe con auth local, se vincula con Google
 *       - Si es un usuario nuevo, se crea con frecuencia semanal por defecto (3 días)
 *       - Se genera un streak inicial
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: ID token de Google obtenido desde el cliente
 *                 example: eyJhbGciOiJSUzI1NiIsImtpZCI6IjdlM...
 *     responses:
 *       200:
 *         description: Usuario autenticado correctamente con Google
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Token JWT de acceso (válido 15 minutos)
 *                 refreshToken:
 *                   type: string
 *                   description: Token de refresco (válido 30 días)
 *                 user:
 *                   type: object
 *                   properties:
 *                     id_user:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     lastname:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [USER, PREMIUM, ADMIN]
 *                     auth_provider:
 *                       type: string
 *                       enum: [local, google]
 *                     google_id:
 *                       type: string
 *       400:
 *         description: El idToken no fue proporcionado
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
 *                       example: MISSING_TOKEN
 *                     message:
 *                       type: string
 *                       example: El idToken de Google es requerido
 *       401:
 *         description: Token de Google inválido o expirado
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
 *                       example: GOOGLE_AUTH_FAILED
 *                     message:
 *                       type: string
 *                       example: Token de Google inválido o expirado
 *       500:
 *         description: Error en integración con Google API
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
 *                       example: GOOGLE_API_ERROR
 *                     message:
 *                       type: string
 *                       example: Error al comunicarse con Google
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
