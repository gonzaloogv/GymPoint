const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dns = require('dns').promises;
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const frequencyService = require('./frequency-service');
const GoogleAuthProvider = require('../utils/auth-providers/google-provider');
const emailService = require('../utils/email/email.service');
const {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} = require('../utils/errors');
const { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL_DAYS } = require('../config/constants');
const { runWithRetryableTransaction } = require('../utils/transaction-helper');
const {
  accountRepository,
  userProfileRepository,
  refreshTokenRepository,
  emailVerificationRepository,
  passwordResetRepository,
  streakRepository,
} = require('../infra/db/repositories');
const {
  RegisterCommand,
  LoginCommand,
  RefreshTokenCommand,
  GoogleAuthCommand,
  LogoutCommand,
} = require('./commands/auth.commands');

const ACCESS_EXPIRATION = ACCESS_TOKEN_TTL;
const REFRESH_EXPIRATION_DAYS = REFRESH_TOKEN_TTL_DAYS;
const googleProvider = new GoogleAuthProvider();

// ---------------------------------------------------------------------------
// Email Validation
// ---------------------------------------------------------------------------

/**
 * Schema de validación Joi para emails
 * - Formato estándar de email
 * - Mínimo 2 segmentos de dominio (user@domain.com, no user@localhost)
 * - Sin restricción de TLDs específicos para soportar dominios internacionales
 */
const emailSchema = Joi.string()
  .trim()
  .lowercase()
  .email({ minDomainSegments: 2, tlds: { allow: false } })
  .required();

/**
 * Valida que el dominio del email pueda recibir correo
 *
 * IMPORTANTE: Esta validación NO garantiza que el email existe, pero sí que:
 * 1. El dominio tiene registros MX (Mail Exchange) configurados, O
 * 2. El dominio resuelve a una IP (fallback para catch-all servers)
 *
 * Casos cubiertos:
 * - gmail.com, outlook.com → tienen MX records ✅
 * - dominios corporativos con MX ✅
 * - dominios con servidores catch-all (solo A/AAAA) ✅
 *
 * Casos rechazados:
 * - dominios inexistentes (typos: gmial.com) ❌
 * - dominios sin MX ni A records ❌
 *
 * @param {string} email - Email a validar
 * @param {number} timeoutMs - Timeout en milisegundos (default: 5000)
 * @throws {ValidationError} Si el dominio no existe o no puede recibir correo
 */
const ensureDomainAcceptsMail = async (email, timeoutMs = 5000) => {
  const domain = email.split('@')[1];

  if (!domain) {
    throw new ValidationError('Formato de email inválido');
  }

  try {
    // Crear promise con timeout para evitar bloqueos largos
    await Promise.race([
      (async () => {
        try {
          // Intento 1: Verificar registros MX (el estándar para servidores de correo)
          const mx = await dns.resolveMx(domain);
          if (mx && mx.length > 0) {
            return; // Dominio válido con MX records
          }
          throw new Error('No MX records, trying A/AAAA...');
        } catch (mxError) {
          // Intento 2: Fallback a registros A/AAAA (para servidores catch-all)
          // Algunos proveedores pequeños usan el mismo servidor para web y correo
          try {
            await dns.resolve(domain);
            // Si resuelve, asumimos que puede recibir correo
          } catch (aError) {
            throw new ValidationError(
              `El dominio "${domain}" no existe o no está configurado para recibir correo. ` +
              'Verifica que el email sea correcto.'
            );
          }
        }
      })(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DNS_TIMEOUT')), timeoutMs)
      ),
    ]);
  } catch (error) {
    if (error.message === 'DNS_TIMEOUT') {
      // En caso de timeout, loguear advertencia pero NO bloquear el registro
      // Esto previene DoS por DNS lento y mejora UX en redes problemáticas
      console.warn(`[Auth] DNS timeout validating domain: ${domain}`);
      return; // Permitir el registro con advertencia
    }

    if (error instanceof ValidationError) {
      throw error;
    }

    // Otros errores de red/DNS → rechazar con mensaje claro
    throw new ValidationError(
      `No se pudo verificar el dominio "${domain}". Verifica tu conexión o intenta con otro email.`
    );
  }
};

/**
 * Valida y normaliza un email
 *
 * @param {string} email - Email a validar
 * @returns {string} Email normalizado (lowercase, trimmed)
 * @throws {ValidationError} Si el formato es inválido o el dominio no existe
 */
const validateAndNormalizeEmail = async (email) => {
  // 1. Validar formato con Joi
  const { value: normalizedEmail, error } = emailSchema.validate(email);

  if (error) {
    throw new ValidationError(
      'Formato de email inválido. Debe ser: usuario@dominio.com'
    );
  }

  // 2. Validar que el dominio puede recibir correo
  await ensureDomainAcceptsMail(normalizedEmail);

  return normalizedEmail;
};

// ---------------------------------------------------------------------------
// Email Verification Helpers
// ---------------------------------------------------------------------------

/**
 * Genera y envía un email de verificación
 *
 * @param {Object} options
 * @param {number} options.accountId - ID de la cuenta
 * @param {string} options.email - Email del usuario
 * @param {string} options.name - Nombre del usuario
 * @param {Object} [options.transaction] - Transacción Sequelize
 * @returns {Promise<string>} Token generado
 */
const generateAndSendVerificationEmail = async ({ accountId, email, name, transaction }) => {
  // Generar token UUID
  const token = uuidv4();

  // Expiración: 24 horas desde ahora
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Guardar token en DB
  await emailVerificationRepository.createVerificationToken(
    {
      id_account: accountId,
      token,
      expires_at: expiresAt,
    },
    { transaction }
  );

  // Enviar email asincrónicamente (sin bloquear la transacción)
  // Si falla el envío, el usuario puede solicitar reenvío
  setImmediate(async () => {
    try {
      await emailService.sendVerificationEmail({
        email,
        name,
        token,
      });
      console.log(`[Auth] Email de verificación enviado a: ${email}`);
    } catch (error) {
      console.error(`[Auth] Error enviando email de verificación a ${email}:`, error.message);
      // NO lanzamos error aquí para no romper el registro
      // El usuario puede solicitar reenvío más tarde
    }
  });

  return token;
};

/**
 * Verifica un token de email y marca la cuenta como verificada
 *
 * @param {string} token - Token UUID
 * @returns {Promise<Object>} Cuenta verificada con perfil
 * @throws {ValidationError} Si el token es inválido o expirado
 */
const verifyEmailToken = async (token) => {
  // Buscar token válido (no usado y no expirado)
  const verificationToken = await emailVerificationRepository.findValidToken(token);

  if (!verificationToken) {
    throw new ValidationError(
      'Token de verificación inválido o expirado. Solicita un nuevo enlace desde la aplicación.'
    );
  }

  // Marcar token como usado y actualizar cuenta
  await runWithRetryableTransaction(async (transaction) => {
    // Marcar token como usado
    await emailVerificationRepository.markAsUsed(token, { transaction });

    // Marcar cuenta como verificada y limpiar deadline
    await accountRepository.updateAccount(
      verificationToken.id_account,
      {
        email_verified: true,
        email_verification_deadline: null, // Limpiar deadline de verificación
      },
      { transaction }
    );

    console.log(`[Auth] Email verificado para cuenta ID: ${verificationToken.id_account}`);
  });

  // Obtener cuenta actualizada con perfil
  const account = await accountRepository.findById(verificationToken.id_account, {
    includeRoles: true,
    includeUserProfile: true,
  });

  // Enviar email de bienvenida (opcional, asíncrono)
  if (account && account.userProfile) {
    setImmediate(async () => {
      try {
        await emailService.sendWelcomeEmail({
          email: account.email,
          name: account.userProfile.name,
        });
        console.log(`[Auth] Email de bienvenida enviado a: ${account.email}`);
      } catch (error) {
        console.error(`[Auth] Error enviando email de bienvenida:`, error.message);
      }
    });
  }

  return account;
};

/**
 * Reenvía el email de verificación
 *
 * @param {string} email - Email del usuario
 * @returns {Promise<void>}
 * @throws {ValidationError} Si el email ya está verificado o no existe
 * @throws {Error} Si se excede el límite de reintentos
 */
const resendVerificationEmail = async (email) => {
  // Normalizar email
  const normalizedEmail = email.trim().toLowerCase();

  // Buscar cuenta
  const account = await accountRepository.findByEmail(normalizedEmail, {
    includeUserProfile: true,
  });

  if (!account) {
    throw new ValidationError('No existe una cuenta con ese email');
  }

  if (account.email_verified) {
    throw new ValidationError('Este email ya está verificado');
  }

  // Limitar reintentos: verificar si ya se envió un token en las últimas 5 minutos
  const recentTokens = await emailVerificationRepository.findByAccount(account.id_account);
  const recentToken = recentTokens.find(
    (t) => !t.used_at && new Date(t.created_at) > new Date(Date.now() - 5 * 60 * 1000)
  );

  if (recentToken) {
    throw new Error(
      'Ya enviamos un email de verificación recientemente. Por favor revisa tu bandeja de entrada y spam, o intenta nuevamente en 5 minutos.'
    );
  }

  // Revocar tokens anteriores
  await emailVerificationRepository.revokeAllByAccount(account.id_account);

  // Generar y enviar nuevo token
  const name = account.userProfile?.name || 'Usuario';
  await generateAndSendVerificationEmail({
    accountId: account.id_account,
    email: normalizedEmail,
    name,
  });

  console.log(`[Auth] Email de verificación reenviado a: ${normalizedEmail}`);
};

// ---------------------------------------------------------------------------
// Password Reset Helpers
// ---------------------------------------------------------------------------

/**
 * Solicita un restablecimiento de contraseña
 *
 * SEGURIDAD: No revela si el email existe o no (timing-safe)
 *
 * @param {string} email - Email de la cuenta
 * @param {Object} [meta] - Metadata (IP, user-agent)
 * @returns {Promise<void>}
 */
const requestPasswordReset = async (email, meta = {}) => {
  // Normalizar email (lowercase, trim)
  const normalizedEmail = email.trim().toLowerCase();

  // Buscar cuenta por email
  const account = await accountRepository.findByEmail(normalizedEmail, {
    includeUserProfile: true,
  });

  // SEGURIDAD: No revelar si el email existe o no
  // Siempre responder "Email enviado" aunque la cuenta no exista
  if (!account) {
    console.log(`[Auth] Intento de reset para email no registrado: ${normalizedEmail}`);
    // Simular tiempo de procesamiento para evitar timing attacks
    await new Promise((resolve) => setTimeout(resolve, 100));
    return;
  }

  // Solo permitir reset para cuentas con proveedor local
  if (account.auth_provider !== 'local') {
    console.log(`[Auth] Intento de reset para cuenta ${account.auth_provider}: ${normalizedEmail}`);
    // No revelar el tipo de proveedor, solo ignorar silenciosamente
    return;
  }

  // Revocar todos los tokens anteriores de reset de esta cuenta
  await passwordResetRepository.revokeAllByAccount(account.id_account);

  // Generar token UUID
  const token = uuidv4();

  // Expiración: 1 hora desde ahora
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  // Guardar token en DB
  await passwordResetRepository.createResetToken({
    id_account: account.id_account,
    token,
    expires_at: expiresAt,
    ip_address: meta.ipAddress || null,
    user_agent: meta.userAgent || null,
  });

  // Enviar email asincrónicamente (sin bloquear la request)
  const name = account.userProfile?.name || 'Usuario';
  setImmediate(async () => {
    try {
      await emailService.sendPasswordResetEmail({
        email: normalizedEmail,
        name,
        token,
      });
      console.log(`[Auth] Email de reset de contraseña enviado a: ${normalizedEmail}`);
    } catch (error) {
      console.error(`[Auth] Error enviando email de reset a ${normalizedEmail}:`, error.message);
      // NO lanzamos error aquí para no romper el flujo
      // El usuario puede reintentar más tarde
    }
  });

  console.log(`[Auth] Token de reset generado para cuenta ID: ${account.id_account}`);
};

/**
 * Restablece la contraseña usando un token válido
 *
 * @param {string} token - Token UUID de reset
 * @param {string} newPassword - Nueva contraseña
 * @param {Object} [meta] - Metadata (IP, user-agent)
 * @returns {Promise<void>}
 * @throws {ValidationError} Si el token es inválido, expirado o usado
 */
const resetPassword = async (token, newPassword, meta = {}) => {
  // Validar que la contraseña cumpla requisitos mínimos
  if (!newPassword || newPassword.length < 6) {
    throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
  }

  // Buscar token válido (no usado y no expirado)
  const resetToken = await passwordResetRepository.findValidToken(token);

  if (!resetToken) {
    throw new ValidationError(
      'Token de restablecimiento inválido o expirado. Solicita un nuevo enlace desde la aplicación.'
    );
  }

  // Obtener cuenta
  const account = await accountRepository.findById(resetToken.id_account);
  if (!account) {
    throw new NotFoundError('Cuenta no encontrada');
  }

  // Hashear nueva contraseña
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await runWithRetryableTransaction(async (transaction) => {
    // Actualizar contraseña en la cuenta
    await accountRepository.updateAccount(
      resetToken.id_account,
      {
        password_hash: passwordHash,
        // Opcionalmente marcar email como verificado si aún no lo está
        // (reset de contraseña confirma que tiene acceso al email)
        email_verified: true,
        email_verification_deadline: null,
      },
      { transaction }
    );

    // Marcar token como usado
    await passwordResetRepository.markAsUsed(token, { transaction });

    // SEGURIDAD: Revocar todos los refresh tokens para forzar re-login en todos los dispositivos
    await refreshTokenRepository.revokeAllByAccount(resetToken.id_account, { transaction });

    console.log(`[Auth] Contraseña restablecida para cuenta ID: ${resetToken.id_account}`);
  });

  // Enviar email de confirmación (opcional, asíncrono)
  const updatedAccount = await accountRepository.findById(resetToken.id_account, {
    includeUserProfile: true,
  });

  if (updatedAccount && updatedAccount.userProfile) {
    setImmediate(async () => {
      try {
        await emailService.sendPasswordResetSuccessEmail({
          email: updatedAccount.email,
          name: updatedAccount.userProfile.name || 'Usuario',
          ipAddress: meta.ipAddress || null,
        });
        console.log(`[Auth] Email de confirmación de reset enviado a: ${updatedAccount.email}`);
      } catch (error) {
        console.error(`[Auth] Error enviando email de confirmación de reset:`, error.message);
      }
    });
  }
};

/**
 * Cambia la contraseña de un usuario autenticado
 *
 * @param {Object} params
 * @param {number} params.accountId - ID de la cuenta
 * @param {string} params.currentPassword - Contraseña actual
 * @param {string} params.newPassword - Nueva contraseña
 * @returns {Promise<void>}
 * @throws {ValidationError} Si la contraseña no cumple requisitos
 * @throws {UnauthorizedError} Si la contraseña actual es incorrecta
 */
const changePassword = async ({ accountId, currentPassword, newPassword }) => {
  // Validar que la nueva contraseña cumpla requisitos mínimos
  if (!newPassword || newPassword.length < 6) {
    throw new ValidationError('La nueva contraseña debe tener al menos 6 caracteres');
  }

  // Obtener cuenta
  const account = await accountRepository.findById(accountId, {
    includeUserProfile: true,
  });

  if (!account) {
    throw new NotFoundError('Cuenta no encontrada');
  }

  // Solo permitir cambio para cuentas con proveedor local
  if (account.auth_provider !== 'local') {
    throw new ValidationError(
      'No puedes cambiar la contraseña de una cuenta vinculada con Google. Gestiona tu contraseña desde tu cuenta de Google.'
    );
  }

  if (!account.password_hash) {
    throw new UnauthorizedError('Esta cuenta no tiene contraseña configurada');
  }

  // Verificar que la contraseña actual sea correcta
  const matches = await bcrypt.compare(currentPassword, account.password_hash);
  if (!matches) {
    throw new UnauthorizedError('La contraseña actual es incorrecta');
  }

  // Validar que la nueva contraseña sea diferente (opcional pero recomendado)
  const sameAsOld = await bcrypt.compare(newPassword, account.password_hash);
  if (sameAsOld) {
    throw new ValidationError('La nueva contraseña debe ser diferente a la actual');
  }

  // Hashear nueva contraseña
  const newHash = await bcrypt.hash(newPassword, 12);

  await runWithRetryableTransaction(async (transaction) => {
    // Actualizar contraseña en la cuenta
    await accountRepository.updateAccount(
      accountId,
      { password_hash: newHash },
      { transaction }
    );

    // SEGURIDAD: Revocar todos los refresh tokens para forzar re-login en todos los dispositivos
    // Esto previene que sesiones comprometidas sigan activas después del cambio
    await refreshTokenRepository.revokeAllByAccount(accountId, { transaction });

    console.log(`[Auth] Contraseña cambiada para cuenta ID: ${accountId}`);
  });

  // Enviar email de confirmación (opcional, asíncrono)
  if (account.userProfile) {
    setImmediate(async () => {
      try {
        await emailService.sendPasswordResetSuccessEmail({
          email: account.email,
          name: account.userProfile.name || 'Usuario',
          ipAddress: null, // No tenemos IP aquí, podría pasarse como parámetro
        });
        console.log(`[Auth] Email de confirmación de cambio enviado a: ${account.email}`);
      } catch (error) {
        console.error(`[Auth] Error enviando email de confirmación de cambio:`, error.message);
      }
    });
  }
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ensureRegisterCommand = (input = {}) =>
  input instanceof RegisterCommand
    ? input
    : new RegisterCommand({
        email: input.email,
        password: input.password,
        name: input.name,
        lastname: input.lastname,
        gender: input.gender || 'O',
        locality: input.locality ?? null,
        birthDate: input.birth_date ?? input.birthDate ?? null,
        frequencyGoal: input.frequency_goal ?? input.frequencyGoal ?? 3,
      });

const ensureLoginCommand = (input = {}) =>
  input instanceof LoginCommand
    ? input
    : new LoginCommand({
        email: input.email,
        password: input.password,
      });

const ensureRefreshTokenCommand = (input = {}) =>
  input instanceof RefreshTokenCommand
    ? input
    : new RefreshTokenCommand({
        refreshToken: input.refreshToken || input.refresh_token || input.token || input,
      });

const ensureLogoutCommand = (input = {}) =>
  input instanceof LogoutCommand
    ? input
    : new LogoutCommand({
        refreshToken: input.refreshToken || input.refresh_token || input.token || input,
        accountId: input.accountId || input.id_account || null,
      });

const extractTokenMeta = (source = {}) => {
  if (source && typeof source === 'object' && source.headers) {
    const forwarded = source.headers['x-forwarded-for'];
    return {
      userAgent: source.headers['user-agent'] || '',
      ipAddress:
        forwarded?.split(',')[0]?.trim() ||
        source.connection?.remoteAddress ||
        source.ip ||
        '',
    };
  }

  return {
    userAgent: source.userAgent || source['user_agent'] || '',
    ipAddress: source.ipAddress || source.ip || source['ip_address'] || '',
  };
};

const normalizeBirthDate = (value) => {
  if (value == null || value === '') return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError('birth_date invalida (use YYYY-MM-DD)');
  }

  const today = new Date();
  const ageYears = Math.floor((today - date) / (365.25 * 24 * 3600 * 1000));
  if (ageYears < 13 || ageYears > 100) {
    throw new ValidationError('Edad fuera de rango (13-100)');
  }

  return date.toISOString().slice(0, 10);
};

const buildAccessTokenPayload = (account, roles = [], profile = null) => {
  const payload = {
    id: account.id_account,
    email: account.email,
    roles: roles.map((role) => role.role_name || role),
  };

  if (profile && profile.app_tier) {
    payload.subscription = profile.app_tier;
  }

  if (profile && profile.id_user_profile) {
    payload.id_user_profile = profile.id_user_profile;
  }

  if (account.adminProfile?.id_admin_profile) {
    payload.id_admin_profile = account.adminProfile.id_admin_profile;
  } else if (profile && profile.id_admin_profile) {
    payload.id_admin_profile = profile.id_admin_profile;
  }

  return payload;
};

const generateAccessToken = (account, roles = [], profile = null) => {
  const payload = buildAccessTokenPayload(account, roles, profile);
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRATION });
};

const generateRefreshToken = async (accountId, meta = {}) => {
  const refreshToken = jwt.sign(
    { id_account: accountId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: `${REFRESH_EXPIRATION_DAYS}d` }
  );

  await refreshTokenRepository.createRefreshToken({
    id_account: accountId,
    token: refreshToken,
    expires_at: new Date(Date.now() + REFRESH_EXPIRATION_DAYS * 86400000),
    is_revoked: false,
  });

  return refreshToken;
};

const resolveGoogleCommand = async (input) => {
  if (input instanceof GoogleAuthCommand && input.email && input.googleId) {
    return input;
  }

  const idToken =
    input instanceof GoogleAuthCommand
      ? input.idToken
      : input.idToken || input.id_token || input;

  if (!idToken) {
    throw new ValidationError('idToken requerido');
  }

  const googleUser = await googleProvider.verifyToken(idToken);

  return new GoogleAuthCommand({
    idToken,
    email: googleUser.email,
    name: googleUser.name || googleUser.lastName || '',
    googleId: googleUser.googleId,
    picture: googleUser.picture || null,
  });
};

// ---------------------------------------------------------------------------
// Use cases
// ---------------------------------------------------------------------------

const register = async (input, context = {}) => {
  const command = ensureRegisterCommand(input);
  const birthDate = normalizeBirthDate(command.birthDate);
  const frequencyGoal = Number(command.frequencyGoal ?? 3) || 3;

  // CRÍTICO: Validar y normalizar email ANTES de iniciar transacción
  // Esto evita validaciones DNS costosas dentro de transacciones DB
  const normalizedEmail = await validateAndNormalizeEmail(command.email);

  const accountId = await runWithRetryableTransaction(async (transaction) => {
    // Usar el email normalizado (lowercase, trimmed) para verificar unicidad
    const existing = await accountRepository.findByEmail(normalizedEmail, { transaction });
    if (existing) {
      throw new ConflictError('El email ya esta registrado');
    }

    const passwordHash = await bcrypt.hash(command.password, 12);

    // Calcular deadline de verificación: 7 días desde registro
    const verificationDeadline = new Date();
    verificationDeadline.setDate(verificationDeadline.getDate() + 7);

    const account = await accountRepository.createAccount(
      {
        email: normalizedEmail, // Usar email normalizado (lowercase)
        password_hash: passwordHash,
        auth_provider: 'local',
        email_verified: false,
        email_verification_deadline: verificationDeadline,
        is_active: true,
      },
      { transaction }
    );

    const userRole = await accountRepository.findRoleByName('USER', { transaction });
    if (!userRole) {
      throw new NotFoundError('Role USER');
    }
    await accountRepository.linkRole(account.id_account, userRole.id_role, { transaction });

    const userProfile = await userProfileRepository.createUserProfile(
      {
        id_account: account.id_account,
        name: command.name,
        lastname: command.lastname,
        gender: command.gender,
        locality: command.locality,
        birth_date: birthDate,
        subscription: 'FREE',
        tokens: 0,
      },
      { transaction }
    );

    const frequency = await frequencyService.crearMetaSemanal(
      { id_user: userProfile.id_user_profile, goal: frequencyGoal },
      { transaction }
    );

    const streak = await streakRepository.createStreak(
      {
        id_user_profile: userProfile.id_user_profile,
        value: 0,
        last_value: 0,
        max_value: 0,
        recovery_items: 0,
        id_frequency: frequency.id_frequency,
      },
      { transaction }
    );

    const updatedProfile =
      (await userProfileRepository.updateUserProfile(
        userProfile.id_user_profile,
        { id_streak: streak.id_streak },
        { transaction }
      )) || userProfile;

    return account.id_account;
  });

  const account = await accountRepository.findById(accountId, {
    includeRoles: true,
    includeUserProfile: true,
    includeAdminProfile: true,
  });

  // NUEVO: Generar y enviar email de verificación
  // Se hace después de la transacción para no bloquearla
  const profile = account.userProfile || account.adminProfile || null;
  if (profile) {
    try {
      await generateAndSendVerificationEmail({
        accountId: account.id_account,
        email: account.email,
        name: profile.name || 'Usuario',
      });
      console.log(`[Auth] Token de verificación generado para: ${account.email}`);
    } catch (error) {
      // No romper el registro si falla el envío del email
      // El usuario podrá solicitar reenvío más tarde
      console.error(`[Auth] Error generando token de verificación:`, error.message);
    }
  }

  const token = generateAccessToken(account, account.roles || [], profile);
  const refreshToken = await generateRefreshToken(account.id_account, context);

  return {
    token,
    refreshToken,
    account,
    profile,
  };
};

const login = async (...args) => {
  let input;
  let context;

  if (args.length >= 2 && typeof args[0] === 'string' && typeof args[1] === 'string') {
    input = { email: args[0], password: args[1] };
    context = args[2] || {};
  } else {
    input = args[0] || {};
    context = args[1] || {};
  }

  const command = ensureLoginCommand(input);

  // Normalizar email (lowercase, trim) para búsqueda consistente
  // No validamos DNS en login porque la cuenta ya existe
  const normalizedEmail = command.email.trim().toLowerCase();

  const account = await accountRepository.findByEmail(normalizedEmail, {
    includeRoles: true,
    includeUserProfile: true,
    includeAdminProfile: true,
  });

  if (!account || !account.password_hash) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  const passwordOk = await bcrypt.compare(command.password, account.password_hash);
  if (!passwordOk) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  // CRÍTICO: Verificar que el email esté confirmado antes de permitir login
  // NOTA 1: Usuarios de Google OAuth tienen email_verified=true automáticamente
  // NOTA 2: Solo aplicar verificación a rol USER, no ADMIN
  // NOTA 3: Período de gracia de 7 días desde registro
  const isUser = account.roles?.some((role) => role.role_name === 'USER');
  const graceDeadline = account.email_verification_deadline;
  const graceActive = graceDeadline && new Date() < new Date(graceDeadline);
  const mustVerifyEmail = account.auth_provider === 'local' && isUser && !graceActive;

  if (!account.email_verified && mustVerifyEmail) {
    throw new UnauthorizedError(
      'Tu período de gracia ha expirado. Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada o solicita un nuevo enlace de verificación.'
    );
  }

  await accountRepository.updateLastLogin(account.id_account, new Date());

  const profile = account.userProfile || account.adminProfile || null;
  const token = generateAccessToken(account, account.roles || [], profile);

  const refreshToken = await generateRefreshToken(account.id_account, context);

  return {
    token,
    refreshToken,
    account,
    profile,
  };
};

const googleLogin = async (input, context = {}) => {
  const command = await resolveGoogleCommand(input);

  let account =
    (await accountRepository.findByGoogleId(command.googleId, {
      includeRoles: true,
      includeUserProfile: true,
      includeAdminProfile: true,
    })) || null;

  if (!account) {
    account = await accountRepository.findByEmail(command.email, {
      includeRoles: true,
      includeUserProfile: true,
      includeAdminProfile: true,
    });

    if (account) {
      await accountRepository.updateAccount(
        account.id_account,
        {
          google_id: command.googleId,
          auth_provider: 'google',
          email_verified: true,
        },
        {}
      );

      account = await accountRepository.findById(account.id_account, {
        includeRoles: true,
        includeUserProfile: true,
        includeAdminProfile: true,
      });
    } else {
      const accountId = await runWithRetryableTransaction(async (transaction) => {
        const newAccount = await accountRepository.createAccount(
          {
            email: command.email,
            google_id: command.googleId,
            auth_provider: 'google',
            email_verified: true,
            is_active: true,
            password_hash: null,
          },
          { transaction }
        );

        const userRole = await accountRepository.findRoleByName('USER', { transaction });
        if (!userRole) {
          throw new NotFoundError('Role USER');
        }
        await accountRepository.linkRole(newAccount.id_account, userRole.id_role, {
          transaction,
        });

        const userProfile = await userProfileRepository.createUserProfile(
          {
            id_account: newAccount.id_account,
            name: command.name,
            lastname: command.name,
            gender: 'O',
            locality: null,
            birth_date: null,
            subscription: 'FREE',
            tokens: 0,
            profile_picture_url: command.picture || null,
          },
          { transaction }
        );

        const frequency = await frequencyService.crearMetaSemanal(
          { id_user: userProfile.id_user_profile, goal: 3 },
          { transaction }
        );

        const streak = await streakRepository.createStreak(
          {
            id_user_profile: userProfile.id_user_profile,
            value: 0,
            last_value: 0,
            max_value: 0,
            recovery_items: 0,
            id_frequency: frequency.id_frequency,
          },
          { transaction }
        );

        await userProfileRepository.updateUserProfile(
          userProfile.id_user_profile,
          { id_streak: streak.id_streak },
          { transaction }
        );

         return newAccount.id_account;
      });

      account = await accountRepository.findById(accountId, {
        includeRoles: true,
        includeUserProfile: true,
        includeAdminProfile: true,
      });
    }
  }

  if (!account) {
    throw new UnauthorizedError('No se pudo crear o vincular la cuenta de Google');
  }

  const profile = account.userProfile || account.adminProfile || null;
  const token = generateAccessToken(account, account.roles || [], profile);

  const refreshToken = await generateRefreshToken(account.id_account, context);

  return {
    token,
    refreshToken,
    account,
    profile,
  };
};

const refreshAccessToken = async (input) => {
  const command = ensureRefreshTokenCommand(input);

  let decoded;
  try {
    decoded = jwt.verify(command.refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new UnauthorizedError('Refresh token inválido o expirado');
  }

  const storedToken = await refreshTokenRepository.findActiveByToken(command.refreshToken);
  if (!storedToken) {
    throw new UnauthorizedError('Refresh token no encontrado o revocado');
  }

  if (storedToken.expires_at && new Date() > new Date(storedToken.expires_at)) {
    throw new UnauthorizedError('Refresh token expirado');
  }

  const account = await accountRepository.findById(decoded.id_account, {
    includeRoles: true,
    includeUserProfile: true,
    includeAdminProfile: true,
  });
  if (!account) {
    throw new NotFoundError('Cuenta');
  }

  // CRÍTICO: Verificar email_verified para cuentas locales con rol USER
  // Período de gracia de 7 días desde registro
  const isUser = account.roles?.some((role) => role.role_name === 'USER');
  const graceDeadline = account.email_verification_deadline;
  const graceActive = graceDeadline && new Date() < new Date(graceDeadline);
  const mustVerifyEmail = account.auth_provider === 'local' && isUser && !graceActive;

  if (!account.email_verified && mustVerifyEmail) {
    throw new UnauthorizedError(
      'Tu período de gracia ha expirado. Debes verificar tu email antes de continuar. Revisa tu bandeja de entrada o solicita un nuevo enlace de verificación.'
    );
  }

  await refreshTokenRepository.revokeByToken(command.refreshToken);

  const profile = account.userProfile || account.adminProfile || null;
  const newAccessToken = generateAccessToken(account, account.roles || [], profile);

  // Generar nuevo refresh token para mantener la sesión activa
  const newRefreshToken = await generateRefreshToken(account.id_account, {
    source: 'token_refresh',
    previous_token: command.refreshToken.substring(0, 20),
  });

  return {
    token: newAccessToken,
    refreshToken: newRefreshToken
  };
};

const logout = async (input) => {
  const command = ensureLogoutCommand(input);
  if (!command.refreshToken) return;

  await refreshTokenRepository.revokeByToken(command.refreshToken);
};

module.exports = {
  register,
  login,
  googleLogin,
  refreshAccessToken,
  logout,
  generateAccessToken,
  generateRefreshToken,
  // Email verification
  verifyEmailToken,
  resendVerificationEmail,
  // Password reset
  requestPasswordReset,
  resetPassword,
  changePassword,
};
