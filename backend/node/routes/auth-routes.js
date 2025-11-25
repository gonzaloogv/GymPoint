const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');
const { verificarToken } = require('../middlewares/auth');

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
 *     summary: Renovar tokens de autenticación
 *     description: |
 *       Renueva el access token y genera un nuevo refresh token.
 *       El refresh token anterior es revocado automáticamente.
 *       Esto implementa la rotación de refresh tokens como medida de seguridad.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token activo obtenido en login
 *                 example: eyJhbGciOiJIUzI1NiIsIn...
 *     responses:
 *       200:
 *         description: Tokens renovados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Nuevo access token (válido por 15 minutos)
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   description: Nuevo refresh token (válido por 30 días)
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Refresh token no proporcionado
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
 *                       example: El refresh token es requerido
 *       401:
 *         description: Refresh token inválido, expirado, o revocado
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
 *                       example: TOKEN_REFRESH_FAILED
 *                     message:
 *                       type: string
 *                       example: Refresh token inválido o expirado
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
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token a revocar
 *                 example: eyJhbGciOiJIUzI1NiIsIn...
 *     responses:
 *       204:
 *         description: Refresh token revocado
 *       500:
 *         description: Error en el cierre de sesión
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Verificar email usando token enviado por correo
 *     description: |
 *       Verifica el email de un usuario mediante el token UUID recibido por correo.
 *       - Marca el email como verificado (email_verified = true)
 *       - Revoca el token usado
 *       - Envía email de bienvenida automáticamente
 *       - Redirige a la app móvil si se accede desde navegador
 *     tags: [Autenticación]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Token de verificación UUID recibido por email
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Email verificado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: ¡Email verificado exitosamente! Ya puedes iniciar sesión en la aplicación.
 *                 account:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     verified:
 *                       type: boolean
 *                       example: true
 *       302:
 *         description: Redirige a la app móvil (si APP_DEEP_LINK_SCHEME está configurado)
 *       400:
 *         description: Token inválido, expirado o ya usado
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
 *                       example: VERIFICATION_FAILED
 *                     message:
 *                       type: string
 *                       example: Token de verificación inválido o expirado. Solicita un nuevo enlace desde la aplicación.
 */
router.get('/verify-email', authController.verifyEmail);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Reenviar email de verificación
 *     description: |
 *       Genera un nuevo token de verificación y reenvía el email.
 *       - Valida que el email exista y no esté ya verificado
 *       - Revoca tokens anteriores del mismo usuario
 *       - Implementa rate limiting: máximo 1 envío cada 5 minutos
 *       - Expiración del nuevo token: 24 horas
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario que solicita reenvío
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Email de verificación reenviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email de verificación enviado. Revisa tu bandeja de entrada y spam.
 *       400:
 *         description: Email ya verificado o no existe
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
 *                       enum: [ALREADY_VERIFIED, MISSING_EMAIL, RESEND_FAILED]
 *                       example: ALREADY_VERIFIED
 *                     message:
 *                       type: string
 *                       example: Este email ya está verificado
 *       429:
 *         description: Rate limit excedido (intentos muy frecuentes)
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
 *                       example: RATE_LIMIT_EXCEEDED
 *                     message:
 *                       type: string
 *                       example: Ya enviamos un email de verificación recientemente. Por favor revisa tu bandeja de entrada y spam, o intenta nuevamente en 5 minutos.
 */
router.post('/resend-verification', authController.resendVerification);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     description: |
 *       Envía un email con enlace para restablecer contraseña.
 *       - Solo funciona para cuentas con proveedor local (no Google OAuth)
 *       - Genera token UUID con expiración de 1 hora
 *       - Revoca tokens de reset anteriores del mismo usuario
 *       - No revela si el email existe (seguridad anti-enumeración)
 *       - Rastrea IP y user-agent para auditoría
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de la cuenta
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Solicitud procesada (siempre responde con éxito por seguridad)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y spam.
 *       400:
 *         description: Email no proporcionado
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
 *                       example: MISSING_EMAIL
 *                     message:
 *                       type: string
 *                       example: El email es requerido
 *       500:
 *         description: Error del servidor
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
 *                       example: FORGOT_PASSWORD_FAILED
 *                     message:
 *                       type: string
 *                       example: Ocurrió un error al procesar tu solicitud. Intenta nuevamente más tarde.
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con token
 *     description: |
 *       Restablece la contraseña usando el token recibido por email.
 *       - Valida que el token sea válido, no usado y no expirado
 *       - Actualiza la contraseña con hash bcrypt (salt rounds: 12)
 *       - Marca email_verified como true automáticamente
 *       - Revoca todos los refresh tokens (fuerza re-login en todos los dispositivos)
 *       - Envía email de confirmación con IP y fecha del cambio
 *       - Tokens son single-use (se marcan como usados)
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *                 format: uuid
 *                 description: Token UUID recibido por email
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña (mínimo 6 caracteres)
 *                 example: nuevaPassword123
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
 *       400:
 *         description: Token inválido, expirado, o contraseña débil
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
 *                       enum: [MISSING_TOKEN, MISSING_PASSWORD, INVALID_OR_EXPIRED_TOKEN, WEAK_PASSWORD]
 *                       example: INVALID_OR_EXPIRED_TOKEN
 *                     message:
 *                       type: string
 *                       example: Token de restablecimiento inválido o expirado. Solicita un nuevo enlace desde la aplicación.
 *       500:
 *         description: Error del servidor
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
 *                       example: RESET_PASSWORD_FAILED
 *                     message:
 *                       type: string
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /api/auth/complete-onboarding:
 *   post:
 *     summary: Completar onboarding de usuario (frecuencia, fecha de nacimiento, género)
 *     description: |
 *       Completa el perfil de usuario para cuentas de Google OAuth.
 *       - Solo aplica a cuentas de Google con profile_completed = false
 *       - Actualiza frequency_goal, birth_date y gender
 *       - Marca profile_completed = true al finalizar
 *       - Requiere autenticación con Bearer token
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [frequency_goal, birth_date]
 *             properties:
 *               frequency_goal:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 7
 *                 description: Meta de días de entrenamiento por semana
 *                 example: 3
 *               birth_date:
 *                 type: string
 *                 format: date
 *                 description: Fecha de nacimiento (YYYY-MM-DD)
 *                 example: "1990-01-15"
 *               gender:
 *                 type: string
 *                 enum: [M, F, O]
 *                 description: Género del usuario (opcional, default O)
 *                 example: M
 *     responses:
 *       200:
 *         description: Perfil completado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Perfil completado exitosamente
 *                 user:
 *                   type: object
 *                   description: Usuario actualizado con profile_completed = true
 *                 needsOnboarding:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: Datos inválidos o perfil ya completado
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
 *                       enum: [MISSING_FREQUENCY, MISSING_BIRTH_DATE, ONBOARDING_FAILED]
 *                     message:
 *                       type: string
 *       401:
 *         description: Usuario no autenticado
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
 *                       example: UNAUTHORIZED
 *                     message:
 *                       type: string
 *                       example: Usuario no autenticado
 */
router.post('/complete-onboarding', verificarToken, authController.completeOnboarding);

module.exports = router;



