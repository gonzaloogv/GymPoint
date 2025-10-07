const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');
const { Account, Role, AccountRole, UserProfile, AdminProfile } = require('../models');
const Streak = require('../models/Streak');
const RefreshToken = require('../models/RefreshToken');
const frequencyService = require('../services/frequency-service');
const GoogleAuthProvider = require('../utils/auth-providers/google-provider');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../utils/errors');
const { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL_DAYS } = require('../config/constants');

const ACCESS_EXPIRATION = ACCESS_TOKEN_TTL;
const REFRESH_EXPIRATION_DAYS = REFRESH_TOKEN_TTL_DAYS;

const googleProvider = new GoogleAuthProvider();

/**
 * Registro de nuevo usuario (local)
 * Crea: Account + UserProfile + Frequency + Streak
 */
const register = async (data) => {
  const { email, password, frequency_goal = 3, name, lastname, gender = 'O', locality = '', age = 0 } = data;

  const transaction = await sequelize.transaction();

  try {
    // 1. Verificar email
    const existing = await Account.findOne({ where: { email }, transaction });
    if (existing) {
      throw new ConflictError('El email ya está registrado');
    }

    // 2. Crear Account
    const passwordHash = await bcrypt.hash(password, 12);
    const account = await Account.create({
      email,
      password_hash: passwordHash,
      auth_provider: 'local',
      email_verified: false
    }, { transaction });

    // 3. Asignar rol USER
    const userRole = await Role.findOne({ where: { role_name: 'USER' }, transaction });
    await AccountRole.create({
      id_account: account.id_account,
      id_role: userRole.id_role
    }, { transaction });

    // 4. Crear UserProfile
    const userProfile = await UserProfile.create({
      id_account: account.id_account,
      name,
      lastname,
      gender,
      locality,
      age,
      subscription: 'FREE',
      tokens: 0
    }, { transaction });

    // 5. Crear Frequency
    const frequency = await frequencyService.crearMetaSemanal({
      id_user: userProfile.id_user_profile,
      goal: frequency_goal
    });

    // 6. Crear Streak
    const streak = await Streak.create({
      id_user: userProfile.id_user_profile,
      value: 0,
      last_value: null,
      recovery_items: 0,
      achieved_goal: false,
      id_frequency: frequency.id_frequency
    }, { transaction });

    // 7. Actualizar UserProfile con streak
    userProfile.id_streak = streak.id_streak;
    await userProfile.save({ transaction });

    await transaction.commit();

    // Retornar con formato compatible
    return {
      account,
      userProfile,
      id_user: userProfile.id_user_profile,
      email: account.email,
      name: userProfile.name,
      lastname: userProfile.lastname,
      subscription: userProfile.subscription
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Generar Access Token (JWT)
 * Incluye: id, roles, email, subscription (si es USER)
 */
const generateAccessToken = (account, roles, profile) => {
  const payload = {
    id: account.id_account,
    email: account.email,
    roles: roles.map(r => r.role_name)
  };

  // Si es USER, agregar subscription y id_user_profile
  if (profile && profile instanceof UserProfile) {
    payload.subscription = profile.subscription;
    payload.id_user_profile = profile.id_user_profile;
  }

  // Si es ADMIN, agregar id_admin_profile
  if (profile && profile instanceof AdminProfile) {
    payload.id_admin_profile = profile.id_admin_profile;
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRATION });
};

/**
 * Generar Refresh Token
 * Solo para usuarios (no admins)
 */
const generateRefreshToken = async (userProfileId, req) => {
  const refreshToken = jwt.sign(
    { id_user_profile: userProfileId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: `${REFRESH_EXPIRATION_DAYS}d` }
  );

  await RefreshToken.create({
    id_user: userProfileId,
    token: refreshToken,
    user_agent: req.headers['user-agent'] || '',
    ip_address:
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection?.remoteAddress ||
      req.ip ||
      '',
    expires_at: new Date(Date.now() + REFRESH_EXPIRATION_DAYS * 86400000)
  });

  return refreshToken;
};

/**
 * Login local (email + password)
 */
const login = async (email, password, req) => {
  // 1. Buscar account
  const account = await Account.findOne({
    where: { email },
    include: [
      {
        model: Role,
        as: 'roles',
        through: { attributes: [] }
      },
      {
        model: UserProfile,
        as: 'userProfile',
        required: false
      },
      {
        model: AdminProfile,
        as: 'adminProfile',
        required: false
      }
    ]
  });

  if (!account) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  // 2. Verificar que no sea cuenta de Google
  if (account.auth_provider === 'google') {
    throw new UnauthorizedError('Esta cuenta fue creada con Google. Por favor, inicia sesión con Google.');
  }

  // 3. Verificar password
  if (!account.password_hash || !(await bcrypt.compare(password, account.password_hash))) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  // 4. Actualizar last_login
  account.last_login = new Date();
  await account.save();

  // 5. Generar tokens
  const profile = account.userProfile || account.adminProfile;
  const token = generateAccessToken(account, account.roles, profile);
  
  // Solo generar refresh token para usuarios (no admins)
  let refreshToken = null;
  if (account.userProfile) {
    refreshToken = await generateRefreshToken(account.userProfile.id_user_profile, req);
  }

  return {
    token,
    refreshToken,
    account,
    profile
  };
};

/**
 * Login con Google OAuth2
 */
const googleLogin = async (idToken, req) => {
  // 1. Verificar token de Google
  const googleUser = await googleProvider.verifyToken(idToken);
  googleProvider.validateGoogleUser(googleUser);

  const transaction = await sequelize.transaction();

  try {
    // 2. Buscar account por email
    let account = await Account.findOne({
      where: { email: googleUser.email },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        },
        {
          model: UserProfile,
          as: 'userProfile'
        }
      ],
      transaction
    });

    if (account) {
      // Account existe - vincular con Google si es necesario
      if (account.auth_provider === 'local') {
        account.auth_provider = 'google';
        account.google_id = googleUser.googleId;
        account.email_verified = true;
        await account.save({ transaction });
      } else if (account.google_id !== googleUser.googleId) {
        account.google_id = googleUser.googleId;
        await account.save({ transaction });
      }

      // Actualizar last_login
      account.last_login = new Date();
      await account.save({ transaction });

    } else {
      // Crear nuevo account + user profile
      account = await Account.create({
        email: googleUser.email,
        password_hash: null,
        auth_provider: 'google',
        google_id: googleUser.googleId,
        email_verified: true
      }, { transaction });

      // Asignar rol USER
      const userRole = await Role.findOne({ where: { role_name: 'USER' }, transaction });
      await AccountRole.create({
        id_account: account.id_account,
        id_role: userRole.id_role
      }, { transaction });

      // Crear UserProfile
      const userProfile = await UserProfile.create({
        id_account: account.id_account,
        name: googleUser.name || 'Usuario',
        lastname: googleUser.lastName || '',
        gender: 'O',
        locality: '',
        age: 0,
        subscription: 'FREE',
        tokens: 0
      }, { transaction });

      // Crear Frequency (meta por defecto: 3 días)
      const frequency = await frequencyService.crearMetaSemanal({
        id_user: userProfile.id_user_profile,
        goal: 3
      });

      // Crear Streak
      const streak = await Streak.create({
        id_user: userProfile.id_user_profile,
        value: 0,
        last_value: null,
        recovery_items: 0,
        achieved_goal: false,
        id_frequency: frequency.id_frequency
      }, { transaction });

      // Actualizar UserProfile con streak
      userProfile.id_streak = streak.id_streak;
      await userProfile.save({ transaction });

      // Recargar account con relaciones
      await account.reload({
        include: [
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] }
          },
          {
            model: UserProfile,
            as: 'userProfile'
          }
        ],
        transaction
      });
    }

    await transaction.commit();

    // 3. Generar tokens
    const token = generateAccessToken(account, account.roles, account.userProfile);
    const refreshToken = await generateRefreshToken(account.userProfile.id_user_profile, req);

    return {
      token,
      refreshToken,
      account,
      profile: account.userProfile
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Refresh token rotation
 */
const refreshAccessToken = async (oldRefreshToken) => {
  // Verificar refresh token
  let decoded;
  try {
    decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new UnauthorizedError('Refresh token inválido o expirado');
  }

  // Buscar refresh token en BD
  const storedToken = await RefreshToken.findOne({
    where: { token: oldRefreshToken, revoked: false }
  });

  if (!storedToken) {
    throw new UnauthorizedError('Refresh token no encontrado o revocado');
  }

  // Verificar que no haya expirado
  if (new Date() > storedToken.expires_at) {
    throw new UnauthorizedError('Refresh token expirado');
  }

  // Buscar UserProfile + Account
  const userProfile = await UserProfile.findByPk(decoded.id_user_profile, {
    include: {
      model: Account,
      as: 'account',
      include: {
        model: Role,
        as: 'roles',
        through: { attributes: [] }
      }
    }
  });

  if (!userProfile) {
    throw new NotFoundError('Usuario');
  }

  // Revocar token antiguo
  storedToken.revoked = true;
  await storedToken.save();

  // Generar nuevo access token
  const newAccessToken = generateAccessToken(
    userProfile.account,
    userProfile.account.roles,
    userProfile
  );

  return { token: newAccessToken };
};

/**
 * Logout - revocar refresh token
 */
const logout = async (refreshToken) => {
  if (!refreshToken) return;

  const storedToken = await RefreshToken.findOne({ where: { token: refreshToken } });
  if (storedToken) {
    storedToken.revoked = true;
    await storedToken.save();
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  logout
};

