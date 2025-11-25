/**
 * Mappers para el dominio Auth
 *
 * Transforman entre DTOs (API) ↔ Commands/Queries ↔ Entidades (dominio)
 */

const {
  RegisterCommand,
  LoginCommand,
  RefreshTokenCommand,
  GoogleAuthCommand,
  LogoutCommand,
} = require('../commands/auth.commands');

const {
  GetUserProfileQuery,
  GetAccountByEmailQuery,
} = require('../queries/auth.queries');

// ============================================================================
// RequestDTO → Command/Query
// ============================================================================

function toRegisterCommand(dto) {
  return new RegisterCommand({
    email: dto.email,
    password: dto.password,
    name: dto.name,
    lastname: dto.lastname,
    gender: dto.gender || 'O',
    locality: dto.locality || null,
    birthDate: dto.birth_date ?? dto.birthDate ?? null,
    frequencyGoal: dto.frequency_goal ?? dto.frequencyGoal ?? 3,
  });
}

function toLoginCommand(dto) {
  return new LoginCommand({
    email: dto.email,
    password: dto.password,
  });
}

function toRefreshTokenCommand(dto) {
  return new RefreshTokenCommand({
    refreshToken: dto.refresh_token ?? dto.refreshToken,
  });
}

function toGoogleAuthCommand(dto, payload) {
  return new GoogleAuthCommand({
    idToken: dto.id_token,
    email: payload.email,
    name: payload.given_name || payload.name || '',
    lastname: payload.family_name || payload.name?.split(' ').slice(1).join(' ') || '',
    googleId: payload.sub,
    picture: payload.picture || null,
  });
}

function toLogoutCommand(dto, accountId) {
  return new LogoutCommand({
    refreshToken: dto.refresh_token ?? dto.refreshToken,
    accountId,
  });
}

function toGetUserProfileQuery(accountId) {
  return new GetUserProfileQuery({ accountId });
}

// ============================================================================
// Entity/POJO → ResponseDTO
// ============================================================================

function normalizeDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  try {
    return new Date(value).toISOString();
  } catch (err) {
    // mostrar error en logs
    console.error('normalizeDate error:', err);
    return null;
  }
}

function normalizeDateOnly(value) {
  const iso = normalizeDate(value);
  return iso ? iso.split('T')[0] : null;
}

function toUserProfileSummary(profile) {
  if (!profile) {
    return {
      id_user_profile: null,
      name: null,
      lastname: null,
      subscription: 'FREE',
      premium_since: null,
      tokens_balance: 0,
      tokens_lifetime: 0,
      locality: null,
      gender: null,
      birth_date: null,
    };
  }

  return {
    id_user_profile: profile.id_user_profile ?? null,
    name: profile.name ?? null,
    lastname: profile.lastname ?? null,
    subscription: profile.subscription || profile.app_tier || 'FREE',
    premium_since: normalizeDate(profile.premium_since),
    tokens_balance:
      profile.tokens_balance ?? profile.tokens ?? 0,
    tokens_lifetime: profile.tokens_lifetime ?? 0,
    locality: profile.locality || null,
    gender: profile.gender || null,
    birth_date: normalizeDateOnly(profile.birth_date),
  };
}

function toAuthUser(account, profile) {
  if (!account) {
    return {
      id_user: null,
      id_account: null,
      email: null,
      email_verified: false,
      auth_provider: 'local',
      profile_completed: false, // Default seguro
      roles: [],
      profile: toUserProfileSummary(profile),
    };
  }

  const roles = Array.isArray(account.roles)
    ? account.roles.map((role) => role.role_name || role)
    : [];

  const userProfile = profile || account.userProfile;

  return {
    id_user: userProfile?.id_user_profile || null,
    id_account: account.id_account,
    email: account.email,
    email_verified: Boolean(account.email_verified),
    auth_provider: account.auth_provider || 'local',
    profile_completed: Boolean(account.profile_completed), // Sin default peligroso
    roles,
    profile: toUserProfileSummary(userProfile),
  };
}

function toAuthSuccessResponse(result) {
  const accessToken = result.accessToken || result.token || null;
  const refreshToken = result.refreshToken ?? null;
  const account = result.account;

  // Onboarding 2 fases: TODOS requieren onboarding si profile_completed es false
  const needsOnboarding = !account?.profile_completed;

  return {
    tokens: {
      accessToken: accessToken,
      refreshToken: refreshToken
    },
    user: toAuthUser(result.account, result.profile),
    needsOnboarding,
  };
}

function toRefreshTokenResponse(result) {
  return {
    token: result.accessToken || result.token || result.access_token || null,
    refreshToken: result.refreshToken || null,
  };
}

module.exports = {
  toRegisterCommand,
  toLoginCommand,
  toRefreshTokenCommand,
  toGoogleAuthCommand,
  toLogoutCommand,
  toGetUserProfileQuery,
  toUserProfileSummary,
  toAuthUser,
  toAuthSuccessResponse,
  toRefreshTokenResponse,
};
