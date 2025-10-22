/**
 * Commands para el dominio Auth
 *
 * Los Commands son objetos puros (POJOs) que representan una intención
 * de modificar el estado del sistema. No contienen lógica de negocio.
 *
 * Basado en: backend/plan/gym_point_contexto_de_logica_de_negocio_consolidado_p_1_p_35.md
 * - UC-AUTH-01: Registro
 * - UC-AUTH-02: Login
 * - UC-AUTH-03: Refresh token
 * - UC-AUTH-04: Google OAuth
 */

/**
 * Command para registrar una nueva cuenta
 *
 * Flujo UC-AUTH-01:
 * 1. Validar email único
 * 2. Hashear password
 * 3. Crear Account (email_verified=false, is_active=true)
 * 4. Crear UserProfile
 * 5. Asignar Role: USER
 * 6. Crear Streak inicial
 * 7. Crear Frequency inicial
 * 8. Crear UserNotificationSettings por defecto
 * 9. Enviar verificación por email
 * 10. Emitir access y refresh tokens
 *
 * @typedef {Object} RegisterCommand
 * @property {string} email - Email único del usuario
 * @property {string} password - Contraseña sin hashear (se hasheará en el service)
 * @property {string} name - Nombre del usuario
 * @property {string} lastname - Apellido del usuario
 * @property {string} [gender='O'] - Género (M, F, O)
 * @property {string} [locality] - Localidad del usuario
 * @property {string|null} [birthDate] - Fecha de nacimiento (YYYY-MM-DD)
 * @property {number} [frequencyGoal=3] - Meta semanal de asistencias
 */
class RegisterCommand {
  constructor({
    email,
    password,
    name,
    lastname,
    gender = 'O',
    locality = null,
    birthDate = null,
    frequencyGoal = 3,
  }) {
    this.email = email;
    this.password = password;
    this.name = name;
    this.lastname = lastname;
    this.gender = gender;
    this.locality = locality;
    this.birthDate = birthDate;
    this.frequencyGoal = frequencyGoal;
  }
}

/**
 * Command para login con email y password
 *
 * Flujo UC-AUTH-02:
 * 1. Email → Account
 * 2. Validar password
 * 3. No se bloquea por email_verified
 * 4. Actualizar last_login
 * 5. Generar access y refresh tokens
 *
 * @typedef {Object} LoginCommand
 * @property {string} email - Email de la cuenta
 * @property {string} password - Contraseña sin hashear
 */
class LoginCommand {
  constructor({ email, password }) {
    this.email = email;
    this.password = password;
  }
}

/**
 * Command para refresh token
 *
 * Flujo UC-AUTH-03:
 * - Duración refresh: 30 días
 * - Entrega nuevo access
 * - No hay rotación por ahora
 *
 * @typedef {Object} RefreshTokenCommand
 * @property {string} refreshToken - Token de refresh
 */
class RefreshTokenCommand {
  constructor({ refreshToken }) {
    this.refreshToken = refreshToken;
  }
}

/**
 * Command para autenticación con Google OAuth
 *
 * Flujo UC-AUTH-04:
 * 1. Validar ID token. Email, nombre, foto.
 * 2. Si existe por google_id → login
 * 3. Si no existe, buscar por email:
 *    - Si existe → vincular automáticamente google_id a la cuenta
 *    - Si no existe → crear cuenta auth_provider='google', email_verified=true,
 *      crear UserProfile, Streak, Frequency, Settings
 * 4. Retornar tokens
 *
 * @typedef {Object} GoogleAuthCommand
 * @property {string} idToken - ID token de Google
 * @property {string} email - Email del usuario (extraído del token)
 * @property {string} name - Nombre del usuario
 * @property {string} googleId - Google ID único
 * @property {string} [picture] - URL de la foto de perfil
 */
class GoogleAuthCommand {
  constructor({ idToken, email, name, googleId, picture = null }) {
    this.idToken = idToken;
    this.email = email;
    this.name = name;
    this.googleId = googleId;
    this.picture = picture;
  }
}

/**
 * Command para logout (invalidar refresh token)
 *
 * @typedef {Object} LogoutCommand
 * @property {string} refreshToken - Token de refresh a invalidar
 * @property {number} accountId - ID de la cuenta
 */
class LogoutCommand {
  constructor({ refreshToken, accountId }) {
    this.refreshToken = refreshToken;
    this.accountId = accountId;
  }
}

module.exports = {
  RegisterCommand,
  LoginCommand,
  RefreshTokenCommand,
  GoogleAuthCommand,
  LogoutCommand,
};
