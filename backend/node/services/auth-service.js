const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const frequencyService = require('./frequency-service');
const GoogleAuthProvider = require('../utils/auth-providers/google-provider');
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

  const ticket = await googleProvider.verifyIdToken(idToken);
  const payload = ticket.getPayload();

  return new GoogleAuthCommand({
    idToken,
    email: payload.email,
    name: payload.name || payload.given_name || payload.family_name || '',
    googleId: payload.sub,
    picture: payload.picture || null,
  });
};

// ---------------------------------------------------------------------------
// Use cases
// ---------------------------------------------------------------------------

const register = async (input, context = {}) => {
  const command = ensureRegisterCommand(input);
  const birthDate = normalizeBirthDate(command.birthDate);
  const frequencyGoal = Number(command.frequencyGoal ?? 3) || 3;

  const accountId = await runWithRetryableTransaction(async (transaction) => {
    const existing = await accountRepository.findByEmail(command.email, { transaction });
    if (existing) {
      throw new ConflictError('El email ya esta registrado');
    }

    const passwordHash = await bcrypt.hash(command.password, 12);
    const account = await accountRepository.createAccount(
      {
        email: command.email,
        password_hash: passwordHash,
        auth_provider: 'local',
        email_verified: false,
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

  const account = await accountRepository.findByEmail(command.email, {
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
};
