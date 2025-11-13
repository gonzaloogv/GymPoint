/**
 * User Service (Refactorizado con Commands/Queries)
 *
 * Usa Commands/Queries para entrada y retorna entidades/POJOs
 * No depende de Express ni expone modelos Sequelize
 */

const { Account, AccountDeletionRequest, RefreshToken, UserBodyMetric } = require('../models');
const { NotFoundError, ConflictError, ValidationError } = require('../utils/errors');
const { TOKENS, TOKEN_REASONS, SUBSCRIPTION_TYPES, ACCOUNT_DELETION, ACCOUNT_DELETION_STATUS } = require('../config/constants');
const sequelize = require('../config/database');
const tokenLedgerService = require('./token-ledger-service');
const { appEvents, EVENTS } = require('../websocket/events/event-emitter');

// Repositories
const {
  userProfileRepository,
  accountRepository,
  userNotificationSettingRepository,
  presenceRepository,
} = require('../infra/db/repositories');

// Commands
const {
  UpdateUserProfileCommand,
  UpdateEmailCommand,
  UpdateUserTokensCommand,
  UpdateUserSubscriptionCommand,
  RequestAccountDeletionCommand,
  CancelAccountDeletionCommand,
  UpdateNotificationSettingsCommand,
  CreatePresenceCommand,
  UpdatePresenceCommand,
} = require('./commands/user.commands');

// Queries
const {
  GetUserByAccountIdQuery,
  GetUserProfileByIdQuery,
  GetAccountDeletionStatusQuery,
  GetNotificationSettingsQuery,
  GetActivePresenceQuery,
  ListUserPresencesQuery,
  ListUsersQuery,
} = require('./queries/user.queries');

// ============================================================================
// Helpers
// ============================================================================

const addDaysUtc = (date, days) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

const toDateOnly = (date) => {
  return date.toISOString().slice(0, 10);
};

const mapDeletionRequest = (requestInstance) => {
  if (!requestInstance) {
    return null;
  }

  const request = requestInstance.get ? requestInstance.get({ plain: true }) : requestInstance;

  return {
    id_request: request.id_request,
    id_account: request.id_account,
    reason: request.reason,
    status: request.status,
    scheduled_deletion_date: request.scheduled_deletion_date,
    requested_at: request.requested_at,
    cancelled_at: request.cancelled_at,
    completed_at: request.completed_at,
    metadata: request.metadata || null,
    can_cancel: request.status === ACCOUNT_DELETION_STATUS.PENDING
  };
};

// Ensure functions para Commands/Queries
const ensureUpdateUserProfileCommand = (input) =>
  input instanceof UpdateUserProfileCommand ? input : new UpdateUserProfileCommand(input);

const ensureUpdateEmailCommand = (input) =>
  input instanceof UpdateEmailCommand ? input : new UpdateEmailCommand(input);

const ensureUpdateUserTokensCommand = (input) =>
  input instanceof UpdateUserTokensCommand ? input : new UpdateUserTokensCommand(input);

const ensureUpdateUserSubscriptionCommand = (input) =>
  input instanceof UpdateUserSubscriptionCommand ? input : new UpdateUserSubscriptionCommand(input);

const ensureRequestAccountDeletionCommand = (input) =>
  input instanceof RequestAccountDeletionCommand ? input : new RequestAccountDeletionCommand(input);

const ensureCancelAccountDeletionCommand = (input) =>
  input instanceof CancelAccountDeletionCommand ? input : new CancelAccountDeletionCommand(input);

const ensureGetUserByAccountIdQuery = (input) =>
  input instanceof GetUserByAccountIdQuery ? input : new GetUserByAccountIdQuery(input);

const ensureGetUserProfileByIdQuery = (input) =>
  input instanceof GetUserProfileByIdQuery ? input : new GetUserProfileByIdQuery(input);

// ============================================================================
// User Profile Operations
// ============================================================================

/**
 * Obtener usuario completo (Account + UserProfile) por ID de cuenta
 * @param {GetUserByAccountIdQuery} query
 * @returns {Promise<Object>} Datos combinados de account y profile
 */
const getUserByAccountId = async (query) => {
  const q = ensureGetUserByAccountIdQuery(query);

  const account = await accountRepository.findById(q.accountId, {
    includeUserProfile: true,
    includeRoles: true,
  });

  if (!account || !account.userProfile) {
    throw new NotFoundError('Usuario');
  }

  // Combinar datos de account y profile
  return {
    id_account: account.id_account,
    email: account.email,
    auth_provider: account.auth_provider,
    email_verified: account.email_verified,
    last_login: account.last_login,
    roles: account.roles || [],
    // Datos del perfil
    ...account.userProfile,
  };
};

/**
 * Obtener perfil de usuario por ID de perfil
 * @param {GetUserProfileByIdQuery} query
 * @returns {Promise<Object>} Datos del perfil
 */
const getUserProfileById = async (query) => {
  const q = ensureGetUserProfileByIdQuery(query);

  const userProfile = await userProfileRepository.findById(q.userProfileId, {
    includeAccount: true,
  });

  if (!userProfile) {
    throw new NotFoundError('Perfil de usuario');
  }

  return userProfile;
};

/**
 * Actualizar perfil de usuario
 * @param {UpdateUserProfileCommand} command
 * @returns {Promise<Object>} Perfil actualizado
 */
const updateUserProfile = async (command) => {
  const cmd = ensureUpdateUserProfileCommand(command);

  const userProfile = await userProfileRepository.findById(cmd.userProfileId);

  if (!userProfile) {
    throw new NotFoundError('Perfil de usuario');
  }

  // Validación birth_date: formato y rango razonable (13-100 años)
  if (cmd.birthDate != null) {
    const bd = new Date(cmd.birthDate);
    if (Number.isNaN(bd.getTime())) {
      throw new ValidationError('birth_date inválida (use YYYY-MM-DD)');
    }
    const today = new Date();
    const ageYears = Math.floor((today - bd) / (365.25 * 24 * 3600 * 1000));
    if (ageYears < 13 || ageYears > 100) {
      throw new ValidationError('Edad fuera de rango (13-100)');
    }
  }

  // Mapear command a payload del repository
  const payload = {};
  if (cmd.name !== undefined) payload.name = cmd.name;
  if (cmd.lastname !== undefined) payload.lastname = cmd.lastname;
  if (cmd.gender !== undefined) payload.gender = cmd.gender;
  if (cmd.birthDate !== undefined) payload.birth_date = cmd.birthDate;
  if (cmd.locality !== undefined) payload.locality = cmd.locality;
  if (cmd.profilePictureUrl !== undefined) payload.profile_picture_url = cmd.profilePictureUrl;
  if (cmd.preferredLanguage !== undefined) payload.preferred_language = cmd.preferredLanguage;
  if (cmd.timezone !== undefined) payload.timezone = cmd.timezone;
  if (cmd.onboardingCompleted !== undefined) payload.onboarding_completed = cmd.onboardingCompleted;

  return userProfileRepository.updateUserProfile(cmd.userProfileId, payload, {
    includeAccount: true,
  });
};

/**
 * Actualizar email del account
 * @param {UpdateEmailCommand} command
 * @returns {Promise<Object>} Account actualizado
 */
const updateEmail = async (command) => {
  const cmd = ensureUpdateEmailCommand(command);

  const account = await accountRepository.findById(cmd.accountId);

  if (!account) {
    throw new NotFoundError('Cuenta');
  }

  // Verificar que el email no esté en uso
  const existing = await accountRepository.findByEmail(cmd.newEmail);
  if (existing && existing.id_account !== cmd.accountId) {
    throw new ConflictError('El email ya está en uso');
  }

  return accountRepository.updateAccount(cmd.accountId, {
    email: cmd.newEmail,
    email_verified: false // Requiere re-verificación
  });
};

/**
 * Actualizar tokens del usuario
 * @param {UpdateUserTokensCommand} command
 * @returns {Promise<number>} Nuevo balance de tokens
 */
const updateUserTokens = async (command) => {
  const cmd = ensureUpdateUserTokensCommand(command);

  // Obtener balance anterior
  const userProfile = await userProfileRepository.findById(cmd.userProfileId);
  const previousBalance = userProfile ? userProfile.token_balance : 0;

  const { newBalance, transaction } = await tokenLedgerService.registrarMovimiento({
    userId: cmd.userProfileId,
    delta: cmd.delta,
    reason: cmd.reason || 'MANUAL_ADJUSTMENT',
    refType: cmd.refType,
    refId: cmd.refId,
  });

  // Emitir evento para actualizaciones en tiempo real
  appEvents.emit(EVENTS.USER_TOKENS_UPDATED, {
    userId: cmd.userProfileId,
    accountId: userProfile?.id_account,
    newBalance,
    previousBalance,
    delta: cmd.delta,
    reason: cmd.reason,
    transaction,
    timestamp: new Date()
  });

  return newBalance;
};

/**
 * Actualizar suscripción del usuario
 * @param {UpdateUserSubscriptionCommand} command
 * @returns {Promise<Object>} Perfil actualizado
 */
const updateUserSubscription = async (command) => {
  const cmd = ensureUpdateUserSubscriptionCommand(command);

  const validSubscriptions = Object.values(SUBSCRIPTION_TYPES);
  if (!validSubscriptions.includes(cmd.subscription)) {
    throw new ValidationError(`Suscripción inválida. Debe ser ${validSubscriptions.join(' o ')}`);
  }

  const userProfile = await userProfileRepository.findById(cmd.userProfileId);

  if (!userProfile) {
    throw new NotFoundError('Perfil de usuario');
  }

  const previousSubscription = userProfile.subscription_tier;

  const updatedProfile = await userProfileRepository.updateSubscription(
    cmd.userProfileId,
    cmd.subscription,
    {
      premiumSince: cmd.premiumSince,
      premiumExpires: cmd.premiumExpires,
    }
  );

  // Emitir evento para actualizaciones en tiempo real
  appEvents.emit(EVENTS.USER_SUBSCRIPTION_UPDATED, {
    userId: cmd.userProfileId,
    accountId: userProfile.id_account,
    previousSubscription,
    newSubscription: cmd.subscription,
    isPremium: cmd.subscription === SUBSCRIPTION_TYPES.PREMIUM,
    premiumSince: cmd.premiumSince,
    premiumExpires: cmd.premiumExpires,
    userProfile: updatedProfile,
    timestamp: new Date()
  });

  return updatedProfile;
};

/**
 * Listar usuarios con filtros y paginación (solo admin)
 * @param {ListUsersQuery} query
 * @returns {Promise<Object>} Lista paginada de usuarios
 */
const listUsers = async (query) => {
  const filters = {
    subscription: query.subscription,
    search: query.search,
  };

  const pagination = {
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
  };

  const sort = {
    field: query.sortBy,
    direction: query.order,
  };

  const result = await userProfileRepository.findAll({
    filters,
    pagination,
    sort,
    options: { includeAccount: true },
  });

  return {
    items: result.rows,
    total: result.count,
    page: query.page,
    limit: query.limit,
  };
};

// ============================================================================
// Account Deletion Operations
// ============================================================================

/**
 * Obtener estado de la solicitud de eliminación más reciente
 * @param {GetAccountDeletionStatusQuery} query
 * @returns {Promise<object|null>}
 */
const getAccountDeletionStatus = async (query) => {
  const request = await AccountDeletionRequest.findOne({
    where: { id_account: query.accountId },
    order: [['requested_at', 'DESC']]
  });

  return mapDeletionRequest(request);
};

/**
 * Crear una nueva solicitud de eliminación de cuenta
 * @param {RequestAccountDeletionCommand} command
 * @returns {Promise<object>}
 */
const requestAccountDeletion = async (command) => {
  const cmd = ensureRequestAccountDeletionCommand(command);
  console.log('[DEBUG requestAccountDeletion] cmd:', JSON.stringify(cmd, null, 2));
  console.log('[DEBUG requestAccountDeletion] cmd.accountId:', cmd.accountId);

  const transaction = await sequelize.transaction();

  try {
    console.log('[DEBUG requestAccountDeletion] Buscando cuenta con id:', cmd.accountId);
    const account = await Account.findByPk(cmd.accountId, {
      include: {
        model: require('../models').UserProfile,
        as: 'userProfile',
        attributes: ['id_user_profile'],
        required: false
      },
      lock: transaction.LOCK.UPDATE,
      transaction
    });
    console.log('[DEBUG requestAccountDeletion] Cuenta encontrada:', account ? `Si, id_account=${account.id_account}` : 'NO');

    if (!account) {
      throw new NotFoundError('Cuenta');
    }

    const existingPending = await AccountDeletionRequest.findOne({
      where: {
        id_account: cmd.accountId,
        status: ACCOUNT_DELETION_STATUS.PENDING
      },
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (existingPending) {
      throw new ConflictError('Ya existe una solicitud de eliminación pendiente');
    }

    const scheduledDeletion = toDateOnly(
      addDaysUtc(new Date(), ACCOUNT_DELETION.GRACE_PERIOD_DAYS)
    );

    const metadata = {
      grace_period_days: ACCOUNT_DELETION.GRACE_PERIOD_DAYS,
      requested_via: 'SELF_SERVICE'
    };

    const request = await AccountDeletionRequest.create({
      id_account: cmd.accountId,
      reason: cmd.reason,
      scheduled_deletion_date: scheduledDeletion,
      status: ACCOUNT_DELETION_STATUS.PENDING,
      metadata
    }, { transaction });

    // Revocar refresh tokens
    if (account.userProfile) {
      await RefreshToken.update(
        { revoked: true },
        {
          where: { id_user: account.userProfile.id_user_profile },
          transaction
        }
      );
    }

    await transaction.commit();
    return mapDeletionRequest(request);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Cancelar una solicitud de eliminación activa
 * @param {CancelAccountDeletionCommand} command
 * @returns {Promise<object>}
 */
const cancelAccountDeletion = async (command) => {
  const cmd = ensureCancelAccountDeletionCommand(command);

  const transaction = await sequelize.transaction();

  try {
    const request = await AccountDeletionRequest.findOne({
      where: {
        id_account: cmd.accountId,
        status: ACCOUNT_DELETION_STATUS.PENDING
      },
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!request) {
      throw new NotFoundError('Solicitud de eliminación');
    }

    await request.update({
      status: ACCOUNT_DELETION_STATUS.CANCELLED,
      cancelled_at: new Date(),
      metadata: {
        ...(request.metadata || {}),
        cancelled_at: new Date().toISOString()
      }
    }, { transaction });

    await request.reload({ transaction });
    await transaction.commit();

    return mapDeletionRequest(request);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ============================================================================
// Notification Settings Operations
// ============================================================================

/**
 * Obtener configuración de notificaciones
 * @param {GetNotificationSettingsQuery} query
 * @returns {Promise<Object>}
 */
const getNotificationSettings = async (query) => {
  return userNotificationSettingRepository.findByUserProfileId(query.userProfileId);
};

/**
 * Actualizar configuración de notificaciones
 * @param {UpdateNotificationSettingsCommand} command
 * @returns {Promise<Object>}
 */
const updateNotificationSettings = async (command) => {
  const payload = {};

  if (command.remindersEnabled !== undefined) payload.reminders_enabled = command.remindersEnabled;
  if (command.achievementsEnabled !== undefined) payload.achievements_enabled = command.achievementsEnabled;
  if (command.rewardsEnabled !== undefined) payload.rewards_enabled = command.rewardsEnabled;
  if (command.gymUpdatesEnabled !== undefined) payload.gym_updates_enabled = command.gymUpdatesEnabled;
  if (command.paymentEnabled !== undefined) payload.payment_enabled = command.paymentEnabled;
  if (command.socialEnabled !== undefined) payload.social_enabled = command.socialEnabled;
  if (command.systemEnabled !== undefined) payload.system_enabled = command.systemEnabled;
  if (command.challengeEnabled !== undefined) payload.challenge_enabled = command.challengeEnabled;
  if (command.pushEnabled !== undefined) payload.push_enabled = command.pushEnabled;
  if (command.emailEnabled !== undefined) payload.email_enabled = command.emailEnabled;
  if (command.quietHoursStart !== undefined) payload.quiet_hours_start = command.quietHoursStart;
  if (command.quietHoursEnd !== undefined) payload.quiet_hours_end = command.quietHoursEnd;

  return userNotificationSettingRepository.updateSettings(command.userProfileId, payload);
};

// ============================================================================
// Presence Operations
// ============================================================================

/**
 * Crear una nueva presencia
 * @param {CreatePresenceCommand} command
 * @returns {Promise<Object>}
 */
const createPresence = async (command) => {
  return presenceRepository.createPresence({
    userProfileId: command.userProfileId,
    gymId: command.gymId,
    distanceMeters: command.distanceMeters,
    accuracyMeters: command.accuracyMeters,
  });
};

/**
 * Actualizar una presencia
 * @param {UpdatePresenceCommand} command
 * @returns {Promise<Object>}
 */
const updatePresence = async (command) => {
  const payload = {};

  if (command.status !== undefined) payload.status = command.status;
  if (command.lastSeenAt !== undefined) payload.last_seen_at = command.lastSeenAt;
  if (command.exitedAt !== undefined) payload.exited_at = command.exitedAt;
  if (command.distanceMeters !== undefined) payload.distance_meters = command.distanceMeters;
  if (command.accuracyMeters !== undefined) payload.accuracy_meters = command.accuracyMeters;
  if (command.convertedToAssistance !== undefined) payload.converted_to_assistance = command.convertedToAssistance;
  if (command.assistanceId !== undefined) payload.id_assistance = command.assistanceId;

  return presenceRepository.updatePresence(command.presenceId, payload);
};

/**
 * Obtener presencia activa de un usuario en un gym
 * @param {GetActivePresenceQuery} query
 * @returns {Promise<Object|null>}
 */
const getActivePresence = async (query) => {
  return presenceRepository.findActivePresence(query.userProfileId, query.gymId);
};

/**
 * Listar presencias de un usuario
 * @param {ListUserPresencesQuery} query
 * @returns {Promise<Object>}
 */
const listUserPresences = async (query) => {
  const filters = {
    userProfileId: query.userProfileId,
    gymId: query.gymId,
    status: query.status,
    startDate: query.startDate,
    endDate: query.endDate,
  };

  const pagination = {
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
  };

  const result = await presenceRepository.findAll({
    filters,
    pagination,
    options: { includeRelations: true },
  });

  return {
    items: result.rows,
    total: result.count,
    page: query.page,
    limit: query.limit,
  };
};

// ============================================================================
// Body Metrics Operations (Legacy - mantener para compatibilidad)
// ============================================================================

const normalizarNumero = (valor) => {
  if (valor === undefined || valor === null || valor === '') return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
};

const validarRango = (valor, minimo, maximo, campo) => {
  if (valor === null || valor === undefined) return;
  if (!Number.isFinite(valor) || valor < minimo || valor > maximo) {
    throw new ValidationError(`${campo} debe estar entre ${minimo} y ${maximo}`);
  }
};

const BODY_METRICS_SOURCES = new Set(['MANUAL', 'SMART_SCALE', 'TRAINER']);
const BODY_METRICS_TOKENS = Number.isFinite(TOKENS.BODY_METRICS) ? TOKENS.BODY_METRICS : 0;

const registrarMetricasCorporales = async (id_user_profile, payload = {}) => {
  const profile = await userProfileRepository.findById(id_user_profile);
  if (!profile) throw new NotFoundError('Perfil de usuario');

  const isPremium = profile.subscription === SUBSCRIPTION_TYPES.PREMIUM;
  const today = new Date().toISOString().split('T')[0];

  // Validar límite de creación según suscripción
  const recentMetrics = await UserBodyMetric.findAll({
    where: { id_user_profile },
    order: [['date', 'DESC']],
    limit: 1
  });

  if (recentMetrics.length > 0) {
    // Normalizar lastMetricDate a formato YYYY-MM-DD string
    const lastMetric = recentMetrics[0];
    const lastMetricDate = typeof lastMetric.date === 'string'
      ? lastMetric.date
      : lastMetric.date.toISOString().split('T')[0];

    const lastMetricDateObj = new Date(lastMetricDate);
    const todayDateObj = new Date(today);

    if (isPremium) {
      // Premium: máximo 1 por semana (7 días)
      const daysSinceLastMetric = Math.floor((todayDateObj - lastMetricDateObj) / (1000 * 60 * 60 * 24));
      //cambiar de 0 a 7
      if (daysSinceLastMetric < 7) {
        const daysRemaining = 7 - daysSinceLastMetric;
        throw new ConflictError(`Ya registraste tus métricas esta semana. Los usuarios Premium pueden registrar 1 métrica por semana. Podrás registrar nuevamente en ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''}.`);
      }
    } else {
      // Free: máximo 1 por mes
      const lastMetricMonth = lastMetricDateObj.getMonth();
      const lastMetricYear = lastMetricDateObj.getFullYear();
      const currentMonth = todayDateObj.getMonth();
      const currentYear = todayDateObj.getFullYear();

      if (lastMetricYear === currentYear && lastMetricMonth === currentMonth) {
        throw new ConflictError('Ya registraste tus métricas este mes. Los usuarios Free pueden registrar 1 métrica por mes. Actualiza a Premium para registrar semanalmente.');
      }
    }
  }

  const weight = normalizarNumero(payload.weight_kg);
  const height = normalizarNumero(payload.height_cm);
  const bodyFat = normalizarNumero(payload.body_fat_percentage);
  const muscleMass = normalizarNumero(payload.muscle_mass_kg);
  const waist = normalizarNumero(payload.waist_cm);
  const chest = normalizarNumero(payload.chest_cm);
  const arms = normalizarNumero(payload.arms_cm);

  validarRango(weight, 20, 300, 'Peso (kg)');
  validarRango(height, 50, 250, 'Altura (cm)');
  validarRango(bodyFat, 1, 60, 'Porcentaje de grasa corporal');
  validarRango(muscleMass, 10, 200, 'Masa muscular');
  validarRango(waist, 30, 250, 'Cintura (cm)');
  validarRango(chest, 30, 200, 'Pecho (cm)');
  validarRango(arms, 15, 100, 'Brazos (cm)');

  let bmi = null;
  if (weight && height) {
    const heightMeters = height / 100;
    if (heightMeters > 0) {
      bmi = Number((weight / (heightMeters ** 2)).toFixed(2));
      validarRango(bmi, 10, 80, 'IMC');
    }
  }

  const date = payload.date || today;

  return sequelize.transaction(async (transaction) => {
    const metric = await UserBodyMetric.create({
      id_user_profile,
      date,
      weight_kg: weight,
      height_cm: height,
      bmi,
      body_fat_percentage: bodyFat,
      muscle_mass_kg: muscleMass,
      waist_cm: waist,
      chest_cm: chest,
      arms_cm: arms,
      notes: payload.notes || null,
    }, { transaction });

    // Otorgar tokens solo 1 vez por mes
    if (BODY_METRICS_TOKENS > 0) {
      // Verificar si ya recibió tokens este mes
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const tokensThisMonth = await tokenLedgerService.contarMovimientosPorReason(
        id_user_profile,
        TOKEN_REASONS.BODY_METRICS_ENTRY,
        firstDayOfMonth
      );

      if (tokensThisMonth === 0) {
        await tokenLedgerService.registrarMovimiento({
          userId: id_user_profile,
          delta: BODY_METRICS_TOKENS,
          reason: TOKEN_REASONS.BODY_METRICS_ENTRY,
          refType: 'user_body_metric',
          refId: metric.id_metric,
          transaction
        });
      }
    }

    return metric;
  });
};

const listarMetricasCorporales = async (id_user_profile, { limit = 30, offset = 0 } = {}) => {
  const profile = await userProfileRepository.findById(id_user_profile);
  if (!profile) throw new NotFoundError('Perfil de usuario');

  const { count, rows } = await UserBodyMetric.findAndCountAll({
    where: { id_user_profile },
    order: [['date', 'DESC'], ['created_at', 'DESC']],
    limit,
    offset
  });

  return { data: rows, total: count, limit, offset };
};

const obtenerUltimaMetricaCorporal = async (id_user_profile) => {
  const profile = await userProfileRepository.findById(id_user_profile);
  if (!profile) throw new NotFoundError('Perfil de usuario');

  return UserBodyMetric.findOne({
    where: { id_user_profile },
    order: [['date', 'DESC'], ['created_at', 'DESC']]
  });
};

const actualizarMetricaCorporal = async (id_user_profile, id_metric, payload = {}) => {
  const profile = await userProfileRepository.findById(id_user_profile);
  if (!profile) throw new NotFoundError('Perfil de usuario');

  // Buscar la métrica existente y verificar que pertenezca al usuario
  const metric = await UserBodyMetric.findOne({
    where: {
      id_metric,
      id_user_profile
    }
  });

  if (!metric) {
    throw new NotFoundError('Métrica corporal no encontrada o no pertenece a este usuario');
  }

  // Validar y normalizar datos
  const weight = normalizarNumero(payload.weight_kg);
  const height = normalizarNumero(payload.height_cm);
  const bodyFat = normalizarNumero(payload.body_fat_percentage);
  const muscleMass = normalizarNumero(payload.muscle_mass_kg);
  const waist = normalizarNumero(payload.waist_cm);
  const chest = normalizarNumero(payload.chest_cm);
  const arms = normalizarNumero(payload.arms_cm);

  validarRango(weight, 20, 300, 'Peso (kg)');
  validarRango(height, 50, 250, 'Altura (cm)');
  validarRango(bodyFat, 1, 60, 'Porcentaje de grasa corporal');
  validarRango(muscleMass, 10, 200, 'Masa muscular');
  validarRango(waist, 30, 250, 'Cintura (cm)');
  validarRango(chest, 30, 200, 'Pecho (cm)');
  validarRango(arms, 15, 100, 'Brazos (cm)');

  // Recalcular BMI si hay peso y altura
  let bmi = metric.bmi;
  const newWeight = weight !== null ? weight : metric.weight_kg;
  const newHeight = height !== null ? height : metric.height_cm;

  if (newWeight && newHeight) {
    const heightMeters = newHeight / 100;
    if (heightMeters > 0) {
      bmi = Number((newWeight / (heightMeters ** 2)).toFixed(2));
      validarRango(bmi, 10, 80, 'IMC');
    }
  }

  // Actualizar solo los campos proporcionados
  const updateData = {
    bmi
  };

  if (weight !== null) updateData.weight_kg = weight;
  if (height !== null) updateData.height_cm = height;
  if (bodyFat !== null) updateData.body_fat_percentage = bodyFat;
  if (muscleMass !== null) updateData.muscle_mass_kg = muscleMass;
  if (waist !== null) updateData.waist_cm = waist;
  if (chest !== null) updateData.chest_cm = chest;
  if (arms !== null) updateData.arms_cm = arms;
  if (payload.notes !== undefined) updateData.notes = payload.notes;

  await metric.update(updateData);

  return metric;
};

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // User Profile Operations
  getUserByAccountId,
  getUserProfileById,
  updateUserProfile,
  updateEmail,
  updateUserTokens,
  updateUserSubscription,
  listUsers,

  // Account Deletion Operations
  getAccountDeletionStatus,
  requestAccountDeletion,
  cancelAccountDeletion,

  // Notification Settings Operations
  getNotificationSettings,
  updateNotificationSettings,

  // Presence Operations
  createPresence,
  updatePresence,
  getActivePresence,
  listUserPresences,

  // Body Metrics Operations (Legacy)
  registrarMetricasCorporales,
  listarMetricasCorporales,
  obtenerUltimaMetricaCorporal,
  actualizarMetricaCorporal,

  // Legacy aliases (mantener para compatibilidad con código existente)
  obtenerUsuario: getUserByAccountId,
  obtenerPerfilPorId: getUserProfileById,
  actualizarPerfil: updateUserProfile,
  actualizarEmail: updateEmail,
  actualizarTokens: updateUserTokens,
  actualizarSuscripcion: updateUserSubscription,
  obtenerEstadoEliminacionCuenta: getAccountDeletionStatus,
  solicitarEliminacionCuenta: requestAccountDeletion,
  cancelarSolicitudEliminacionCuenta: cancelAccountDeletion,
};
