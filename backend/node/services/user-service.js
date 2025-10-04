const { Account, UserProfile } = require('../models');

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
    throw new Error('Usuario no encontrado');
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
    throw new Error('Perfil de usuario no encontrado');
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
    profile_picture_url: userProfile.profile_picture_url
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
    throw new Error('Perfil de usuario no encontrado');
  }

  // Solo permitir actualizar campos específicos
  const camposPermitidos = ['name', 'lastname', 'gender', 'age', 'locality', 'profile_picture_url'];
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
    throw new Error('Cuenta no encontrada');
  }

  // Verificar que el email no esté en uso
  const existing = await Account.findOne({ where: { email: newEmail } });
  if (existing && existing.id_account !== idAccount) {
    throw new Error('El email ya está en uso');
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
    throw new Error('Cuenta no encontrada');
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
const actualizarTokens = async (idUserProfile, delta, reason = 'manual') => {
  const userProfile = await UserProfile.findByPk(idUserProfile);
  
  if (!userProfile) {
    throw new Error('Perfil de usuario no encontrado');
  }

  const newBalance = userProfile.tokens + delta;
  
  if (newBalance < 0) {
    throw new Error('Saldo de tokens insuficiente');
  }

  await userProfile.update({ tokens: newBalance });

  // Registrar en transaction ledger (si existe)
  try {
    const Transaction = require('../models/Transaction');
    await Transaction.create({
      id_user: idUserProfile,
      amount: delta,
      description: reason,
      transaction_type: delta > 0 ? 'CREDIT' : 'DEBIT',
      balance_after: newBalance
    });
  } catch (error) {
    console.warn('No se pudo registrar transacción:', error.message);
  }

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
  if (!['FREE', 'PREMIUM'].includes(newSubscription)) {
    throw new Error('Suscripción inválida');
  }

  const userProfile = await UserProfile.findByPk(idUserProfile);
  
  if (!userProfile) {
    throw new Error('Perfil de usuario no encontrado');
  }

  await userProfile.update({ subscription: newSubscription });

  return {
    id_user_profile: userProfile.id_user_profile,
    subscription: userProfile.subscription
  };
};

module.exports = {
  obtenerUsuario,
  obtenerPerfilPorId,
  actualizarPerfil,
  actualizarEmail,
  eliminarCuenta,
  actualizarTokens,
  actualizarSuscripcion
};

