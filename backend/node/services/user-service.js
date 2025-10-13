const { Account, UserProfile, UserBodyMetric } = require('../models');
const { NotFoundError, ConflictError, ValidationError } = require('../utils/errors');
const { TOKENS, TOKEN_REASONS, SUBSCRIPTION_TYPES } = require('../config/constants');
const sequelize = require('../config/database');
const tokenLedgerService = require('./token-ledger-service');

/**
 * Obtener usuario completo (Account + UserProfile)
 * @param {number} idAccount - ID del account
 * @returns {Promise<Object>} Datos combinados de account y profile
 */
const obtenerUsuario = async (idAccount) => {
  const account = await Account.findByPk(idAccount, {
    include: [
      {
        model: UserProfile,
        as: 'userProfile',
        required: true
      }
    ]
  });

  if (!account || !account.userProfile) {
    throw new NotFoundError('Usuario');
  }

  // Retornar datos combinados
  return {
    id: account.id_account,
    email: account.email,
    auth_provider: account.auth_provider,
    email_verified: account.email_verified,
    last_login: account.last_login,
    // Datos del perfil
    id_user_profile: account.userProfile.id_user_profile,
    name: account.userProfile.name,
    lastname: account.userProfile.lastname,
    gender: account.userProfile.gender,
    age: account.userProfile.age,
    locality: account.userProfile.locality,
    subscription: account.userProfile.subscription,
    tokens: account.userProfile.tokens,
    id_streak: account.userProfile.id_streak,
    profile_picture_url: account.userProfile.profile_picture_url,
    premium_since: account.userProfile.premium_since,
    premium_expires: account.userProfile.premium_expires,
    onboarding_completed: account.userProfile.onboarding_completed,
    preferred_language: account.userProfile.preferred_language,
    timezone: account.userProfile.timezone,
    created_at: account.userProfile.created_at,
    updated_at: account.userProfile.updated_at
  };
};

/**
 * Obtener perfil de usuario por ID de perfil
 * Útil para búsquedas desde tablas de dominio
 * @param {number} idUserProfile - ID del user_profile
 * @returns {Promise<Object>} Datos del perfil
 */
const obtenerPerfilPorId = async (idUserProfile) => {
  const userProfile = await UserProfile.findByPk(idUserProfile, {
    include: {
      model: Account,
      as: 'account',
      attributes: ['id_account', 'email', 'auth_provider']
    }
  });

  if (!userProfile) {
    throw new NotFoundError('Perfil de usuario');
  }

  return {
    id_user_profile: userProfile.id_user_profile,
    id_account: userProfile.id_account,
    email: userProfile.account.email,
    name: userProfile.name,
    lastname: userProfile.lastname,
    gender: userProfile.gender,
    age: userProfile.age,
    locality: userProfile.locality,
    subscription: userProfile.subscription,
    tokens: userProfile.tokens,
    id_streak: userProfile.id_streak,
    profile_picture_url: userProfile.profile_picture_url,
    preferred_language: userProfile.preferred_language,
    timezone: userProfile.timezone,
    onboarding_completed: userProfile.onboarding_completed
  };
};

/**
 * Actualizar perfil de usuario
 * @param {number} idUserProfile - ID del user_profile
 * @param {Object} datos - Datos a actualizar (name, lastname, gender, age, locality)
 * @returns {Promise<Object>} Perfil actualizado
 */
const actualizarPerfil = async (idUserProfile, datos) => {
  const userProfile = await UserProfile.findByPk(idUserProfile);
  
  if (!userProfile) {
    throw new NotFoundError('Perfil de usuario');
  }

  // Solo permitir actualizar campos específicos
  const camposPermitidos = ['name', 'lastname', 'gender', 'age', 'locality', 'profile_picture_url', 'preferred_language', 'timezone', 'onboarding_completed'];
  const datosLimpios = {};
  
  camposPermitidos.forEach(campo => {
    if (datos[campo] !== undefined) {
      datosLimpios[campo] = datos[campo];
    }
  });

  await userProfile.update(datosLimpios);
  
  // Recargar con account
  await userProfile.reload({
    include: {
      model: Account,
      as: 'account',
      attributes: ['email']
    }
  });

  return {
    id_user_profile: userProfile.id_user_profile,
    name: userProfile.name,
    lastname: userProfile.lastname,
    gender: userProfile.gender,
    age: userProfile.age,
    locality: userProfile.locality,
    subscription: userProfile.subscription,
    tokens: userProfile.tokens,
    profile_picture_url: userProfile.profile_picture_url,
    preferred_language: userProfile.preferred_language,
    timezone: userProfile.timezone,
    onboarding_completed: userProfile.onboarding_completed,
    email: userProfile.account.email
  };
};

/**
 * Actualizar email del account
 * @param {number} idAccount - ID del account
 * @param {string} newEmail - Nuevo email
 * @returns {Promise<Object>} Account actualizado
 */
const actualizarEmail = async (idAccount, newEmail) => {
  const account = await Account.findByPk(idAccount);
  
  if (!account) {
    throw new NotFoundError('Cuenta');
  }

  // Verificar que el email no esté en uso
  const existing = await Account.findOne({ where: { email: newEmail } });
  if (existing && existing.id_account !== idAccount) {
    throw new ConflictError('El email ya está en uso');
  }

  await account.update({ 
    email: newEmail,
    email_verified: false // Requiere re-verificación
  });

  return {
    id_account: account.id_account,
    email: account.email,
    email_verified: account.email_verified
  };
};

/**
 * Eliminar cuenta de usuario (soft delete)
 * Marca la cuenta como inactiva y revoca refresh tokens
 * @param {number} idAccount - ID del account
 * @returns {Promise<void>}
 */
const eliminarCuenta = async (idAccount) => {
  const RefreshToken = require('../models/RefreshToken');
  
  const account = await Account.findByPk(idAccount, {
    include: {
      model: UserProfile,
      as: 'userProfile'
    }
  });
  
  if (!account) {
    throw new NotFoundError('Cuenta');
  }

  // Revocar todos los refresh tokens
  await RefreshToken.update(
    { revoked: true },
    { 
      where: { 
        id_user: account.userProfile.id_user_profile 
      } 
    }
  );

  // Soft delete: marcar como inactiva
  await account.update({ is_active: false });

  // Nota: No eliminamos físicamente para mantener integridad referencial
  // y permitir auditoría. Las FKs con CASCADE eliminarán relaciones si se hace hard delete.
};

/**
 * Actualizar tokens del usuario
 * @param {number} idUserProfile - ID del user_profile
 * @param {number} delta - Cantidad de tokens a sumar/restar
 * @param {string} reason - Razón del cambio
 * @returns {Promise<number>} Nuevo balance de tokens
 */
const BODY_METRICS_TOKENS = Number.isFinite(TOKENS.BODY_METRICS) ? TOKENS.BODY_METRICS : 0;

const actualizarTokens = async (idUserProfile, delta, reason = 'manual') => {
  const { newBalance } = await tokenLedgerService.registrarMovimiento({
    userId: idUserProfile,
    delta,
    reason: reason || 'MANUAL_ADJUSTMENT',
    refType: null,
    refId: null
  });

  return newBalance;
};

/**
 * Actualizar suscripción del usuario
 * Solo accesible por admins
 * @param {number} idUserProfile - ID del user_profile
 * @param {string} newSubscription - Nueva suscripción (FREE, PREMIUM)
 * @returns {Promise<Object>} Perfil actualizado
 */
const actualizarSuscripcion = async (idUserProfile, newSubscription) => {
  const validSubscriptions = Object.values(SUBSCRIPTION_TYPES);
  if (!validSubscriptions.includes(newSubscription)) {
    throw new ValidationError(`Suscripción inválida. Debe ser ${validSubscriptions.join(' o ')}`);
  }

  const userProfile = await UserProfile.findByPk(idUserProfile);
  
  if (!userProfile) {
    throw new NotFoundError('Perfil de usuario');
  }

  await userProfile.update({ subscription: newSubscription });

  return {
    id_user_profile: userProfile.id_user_profile,
    subscription: userProfile.subscription
  };
};

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

const registrarMetricasCorporales = async (id_user_profile, payload = {}) => {
  const profile = await UserProfile.findByPk(id_user_profile, { attributes: ['id_user_profile'] });
  if (!profile) throw new NotFoundError('Perfil de usuario');

  const weight = normalizarNumero(payload.weight_kg);
  const height = normalizarNumero(payload.height_cm);
  const bodyFat = normalizarNumero(payload.body_fat_percent);
  const muscleMass = normalizarNumero(payload.muscle_mass_kg);
  const waist = normalizarNumero(payload.waist_cm);
  const hip = normalizarNumero(payload.hip_cm);

  validarRango(weight, 20, 400, 'Peso (kg)');
  validarRango(height, 100, 250, 'Altura (cm)');
  validarRango(bodyFat, 0, 75, 'Porcentaje de grasa corporal');
  validarRango(muscleMass, 0, 200, 'Masa muscular');
  validarRango(waist, 30, 250, 'Cintura (cm)');
  validarRango(hip, 30, 250, 'Cadera (cm)');

  let bmi = null;
  if (weight && height) {
    const heightMeters = height / 100;
    if (heightMeters > 0) {
      bmi = Number((weight / (heightMeters ** 2)).toFixed(2));
      validarRango(bmi, 10, 80, 'IMC');
    }
  }

  const source = (payload.source || 'MANUAL').toUpperCase();
  if (!BODY_METRICS_SOURCES.has(source)) {
    throw new ValidationError(`Fuente inv�lida. Debe ser ${Array.from(BODY_METRICS_SOURCES).join(', ')}`);
  }

  const measured_at = payload.measured_at ? new Date(payload.measured_at) : new Date();

  return sequelize.transaction(async (transaction) => {
    const metric = await UserBodyMetric.create({
      id_user_profile,
      measured_at,
      weight_kg: weight,
      height_cm: height,
      bmi,
      body_fat_percent: bodyFat,
      muscle_mass_kg: muscleMass,
      waist_cm: waist,
      hip_cm: hip,
      notes: payload.notes || null,
      source
    }, { transaction });

    if (BODY_METRICS_TOKENS > 0) {
      await tokenLedgerService.registrarMovimiento({
        userId: id_user_profile,
        delta: BODY_METRICS_TOKENS,
        reason: TOKEN_REASONS.BODY_METRICS_ENTRY,
        refType: 'user_body_metric',
        refId: metric.id_body_metric,
        transaction
      });
    }

    return metric;
  });
};

const listarMetricasCorporales = async (id_user_profile, { limit = 30, offset = 0 } = {}) => {
  const profile = await UserProfile.findByPk(id_user_profile, { attributes: ['id_user_profile'] });
  if (!profile) throw new NotFoundError('Perfil de usuario');

  return UserBodyMetric.findAll({
    where: { id_user_profile },
    order: [['measured_at', 'DESC']],
    limit,
    offset
  });
};

const obtenerUltimaMetricaCorporal = async (id_user_profile) => {
  const profile = await UserProfile.findByPk(id_user_profile, { attributes: ['id_user_profile'] });
  if (!profile) throw new NotFoundError('Perfil de usuario');

  return UserBodyMetric.findOne({
    where: { id_user_profile },
    order: [['measured_at', 'DESC']]
  });
};

module.exports = {
  obtenerUsuario,
  obtenerPerfilPorId,
  actualizarPerfil,
  actualizarEmail,
  eliminarCuenta,
  actualizarTokens,
  actualizarSuscripcion,
  registrarMetricasCorporales,
  listarMetricasCorporales,
  obtenerUltimaMetricaCorporal
};




