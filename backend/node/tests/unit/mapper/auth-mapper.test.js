const {
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
} = require('../../../services/mappers/auth.mappers');

describe('auth-mapper toRegisterCommand', () => {
  it('transforma DTO completo a RegisterCommand', () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'John',
      lastname: 'Doe',
      gender: 'M',
      locality: 'Buenos Aires',
      birth_date: '1990-01-15',
      frequency_goal: 5,
    };

    const command = toRegisterCommand(dto);

    expect(command.email).toBe('test@example.com');
    expect(command.password).toBe('password123');
    expect(command.name).toBe('John');
    expect(command.lastname).toBe('Doe');
    expect(command.gender).toBe('M');
    expect(command.locality).toBe('Buenos Aires');
    expect(command.birthDate).toBe('1990-01-15');
    expect(command.frequencyGoal).toBe(5);
  });

  it('usa valores por defecto cuando faltan campos opcionales', () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'John',
      lastname: 'Doe',
    };

    const command = toRegisterCommand(dto);

    expect(command.gender).toBe('O');
    expect(command.locality).toBeNull();
    expect(command.birthDate).toBeNull();
    expect(command.frequencyGoal).toBe(3);
  });

  it('maneja nombres alternativos (camelCase)', () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'John',
      lastname: 'Doe',
      birthDate: '1990-01-15',
      frequencyGoal: 4,
    };

    const command = toRegisterCommand(dto);

    expect(command.birthDate).toBe('1990-01-15');
    expect(command.frequencyGoal).toBe(4);
  });
});

describe('auth-mapper toLoginCommand', () => {
  it('transforma DTO a LoginCommand', () => {
    const dto = {
      email: 'user@example.com',
      password: 'secret123',
    };

    const command = toLoginCommand(dto);

    expect(command.email).toBe('user@example.com');
    expect(command.password).toBe('secret123');
  });
});

describe('auth-mapper toRefreshTokenCommand', () => {
  it('transforma DTO con refresh_token (snake_case)', () => {
    const dto = { refresh_token: 'token123' };

    const command = toRefreshTokenCommand(dto);

    expect(command.refreshToken).toBe('token123');
  });

  it('transforma DTO con refreshToken (camelCase)', () => {
    const dto = { refreshToken: 'token456' };

    const command = toRefreshTokenCommand(dto);

    expect(command.refreshToken).toBe('token456');
  });
});

describe('auth-mapper toGoogleAuthCommand', () => {
  it('transforma DTO y payload de Google a GoogleAuthCommand', () => {
    const dto = { id_token: 'google-id-token-123' };
    const payload = {
      email: 'google@example.com',
      name: 'Google User',
      sub: 'google-user-id',
      picture: 'https://example.com/photo.jpg',
    };

    const command = toGoogleAuthCommand(dto, payload);

    expect(command.idToken).toBe('google-id-token-123');
    expect(command.email).toBe('google@example.com');
    expect(command.name).toBe('Google User');
    expect(command.googleId).toBe('google-user-id');
    expect(command.picture).toBe('https://example.com/photo.jpg');
  });

  it('maneja picture null cuando no existe', () => {
    const dto = { id_token: 'google-id-token-123' };
    const payload = {
      email: 'google@example.com',
      name: 'Google User',
      sub: 'google-user-id',
    };

    const command = toGoogleAuthCommand(dto, payload);

    expect(command.picture).toBeNull();
  });
});

describe('auth-mapper toLogoutCommand', () => {
  it('transforma DTO y accountId a LogoutCommand', () => {
    const dto = { refresh_token: 'token123' };
    const accountId = 42;

    const command = toLogoutCommand(dto, accountId);

    expect(command.refreshToken).toBe('token123');
    expect(command.accountId).toBe(42);
  });

  it('maneja refreshToken en camelCase', () => {
    const dto = { refreshToken: 'token456' };
    const accountId = 99;

    const command = toLogoutCommand(dto, accountId);

    expect(command.refreshToken).toBe('token456');
    expect(command.accountId).toBe(99);
  });
});

describe('auth-mapper toGetUserProfileQuery', () => {
  it('transforma accountId a GetUserProfileQuery', () => {
    const query = toGetUserProfileQuery(123);

    expect(query.accountId).toBe(123);
  });
});

describe('auth-mapper toUserProfileSummary', () => {
  it('transforma perfil completo a DTO', () => {
    const profile = {
      id_user_profile: 10,
      name: 'John',
      lastname: 'Doe',
      subscription: 'PREMIUM',
      premium_since: new Date('2024-01-01T00:00:00.000Z'),
      tokens_balance: 100,
      tokens_lifetime: 500,
      locality: 'Buenos Aires',
      gender: 'M',
      birth_date: '1990-05-15',
    };

    const result = toUserProfileSummary(profile);

    expect(result.id_user_profile).toBe(10);
    expect(result.name).toBe('John');
    expect(result.lastname).toBe('Doe');
    expect(result.subscription).toBe('PREMIUM');
    expect(result.premium_since).toBe('2024-01-01T00:00:00.000Z');
    expect(result.tokens_balance).toBe(100);
    expect(result.tokens_lifetime).toBe(500);
    expect(result.locality).toBe('Buenos Aires');
    expect(result.gender).toBe('M');
    expect(result.birth_date).toBe('1990-05-15');
  });

  it('retorna valores por defecto cuando profile es null', () => {
    const result = toUserProfileSummary(null);

    expect(result.id_user_profile).toBeNull();
    expect(result.name).toBeNull();
    expect(result.lastname).toBeNull();
    expect(result.subscription).toBe('FREE');
    expect(result.premium_since).toBeNull();
    expect(result.tokens_balance).toBe(0);
    expect(result.tokens_lifetime).toBe(0);
    expect(result.locality).toBeNull();
    expect(result.gender).toBeNull();
    expect(result.birth_date).toBeNull();
  });

  it('usa app_tier si subscription no existe', () => {
    const profile = {
      id_user_profile: 10,
      app_tier: 'PREMIUM',
    };

    const result = toUserProfileSummary(profile);

    expect(result.subscription).toBe('PREMIUM');
  });

  it('usa tokens si tokens_balance no existe', () => {
    const profile = {
      id_user_profile: 10,
      tokens: 75,
    };

    const result = toUserProfileSummary(profile);

    expect(result.tokens_balance).toBe(75);
  });

  it('normaliza birth_date a formato YYYY-MM-DD', () => {
    const profile = {
      id_user_profile: 10,
      birth_date: '2000-12-25T10:30:00.000Z',
    };

    const result = toUserProfileSummary(profile);

    expect(result.birth_date).toBe('2000-12-25');
  });
});

describe('auth-mapper toAuthUser', () => {
  it('transforma account y profile completos', () => {
    const account = {
      id_account: 5,
      email: 'test@example.com',
      email_verified: true,
      roles: [{ role_name: 'USER' }, { role_name: 'ADMIN' }],
    };
    const profile = {
      id_user_profile: 10,
      name: 'John',
      lastname: 'Doe',
      subscription: 'FREE',
    };

    const result = toAuthUser(account, profile);

    expect(result.id_user).toBe(10);
    expect(result.id_account).toBe(5);
    expect(result.email).toBe('test@example.com');
    expect(result.email_verified).toBe(true);
    expect(result.roles).toEqual(['USER', 'ADMIN']);
    expect(result.profile.id_user_profile).toBe(10);
    expect(result.profile.name).toBe('John');
  });

  it('retorna valores por defecto cuando account es null', () => {
    const result = toAuthUser(null, null);

    expect(result.id_user).toBeNull();
    expect(result.id_account).toBeNull();
    expect(result.email).toBeNull();
    expect(result.email_verified).toBe(false);
    expect(result.roles).toEqual([]);
    expect(result.profile.subscription).toBe('FREE');
  });

  it('usa account.userProfile si profile no se proporciona', () => {
    const account = {
      id_account: 5,
      email: 'test@example.com',
      email_verified: false,
      roles: [],
      userProfile: {
        id_user_profile: 20,
        name: 'Jane',
        subscription: 'PREMIUM',
      },
    };

    const result = toAuthUser(account, null);

    expect(result.id_user).toBe(20);
    expect(result.profile.name).toBe('Jane');
    expect(result.profile.subscription).toBe('PREMIUM');
  });

  it('convierte email_verified a booleano', () => {
    const account = {
      id_account: 5,
      email: 'test@example.com',
      email_verified: 0,
      roles: [],
    };

    const result = toAuthUser(account, null);

    expect(result.email_verified).toBe(false);
  });

  it('maneja roles como array de strings', () => {
    const account = {
      id_account: 5,
      email: 'test@example.com',
      roles: ['USER', 'PREMIUM'],
    };

    const result = toAuthUser(account, null);

    expect(result.roles).toEqual(['USER', 'PREMIUM']);
  });
});

describe('auth-mapper toAuthSuccessResponse', () => {
  it('transforma resultado con token y refreshToken', () => {
    const authResult = {
      token: 'access-token-123',
      refreshToken: 'refresh-token-456',
      account: {
        id_account: 1,
        email: 'user@example.com',
        email_verified: true,
        roles: [{ role_name: 'USER' }],
      },
      profile: {
        id_user_profile: 10,
        name: 'John',
        subscription: 'FREE',
      },
    };

    const result = toAuthSuccessResponse(authResult);

    expect(result.tokens.accessToken).toBe('access-token-123');
    expect(result.tokens.refreshToken).toBe('refresh-token-456');
    expect(result.user.id_account).toBe(1);
    expect(result.user.email).toBe('user@example.com');
    expect(result.user.profile.id_user_profile).toBe(10);
  });

  it('maneja accessToken como alternativa a token', () => {
    const authResult = {
      accessToken: 'access-token-789',
      refreshToken: 'refresh-token-abc',
      account: { id_account: 1, email: 'user@example.com', roles: [] },
      profile: { id_user_profile: 10 },
    };

    const result = toAuthSuccessResponse(authResult);

    expect(result.tokens.accessToken).toBe('access-token-789');
  });

  it('maneja refreshToken null', () => {
    const authResult = {
      token: 'access-token-123',
      account: { id_account: 1, email: 'user@example.com', roles: [] },
      profile: { id_user_profile: 10 },
    };

    const result = toAuthSuccessResponse(authResult);

    expect(result.tokens.refreshToken).toBeNull();
  });
});

describe('auth-mapper toRefreshTokenResponse', () => {
  it('transforma resultado con accessToken', () => {
    const result = toRefreshTokenResponse({ accessToken: 'new-access-token' });

    expect(result.token).toBe('new-access-token');
  });

  it('maneja token como alternativa a accessToken', () => {
    const result = toRefreshTokenResponse({ token: 'new-token' });

    expect(result.token).toBe('new-token');
  });

  it('maneja access_token (snake_case)', () => {
    const result = toRefreshTokenResponse({ access_token: 'snake-case-token' });

    expect(result.token).toBe('snake-case-token');
  });

  it('retorna null cuando no hay token', () => {
    const result = toRefreshTokenResponse({});

    expect(result.token).toBeNull();
  });
});
