const {
  authService,
  accountRepository,
  userProfileRepository,
  refreshTokenRepository,
  streakRepository,
  frequencyService,
  bcrypt,
  jwt,
  mockTransaction,
} = require('./test-setup');

describe('auth-service register', () => {
  it('crea una cuenta local y retorna tokens + usuario', async () => {
    const account = { id_account: 1, email: 'test@example.com' };
    const profile = {
      id_user_profile: 10,
      name: 'Test',
      lastname: 'User',
      subscription: 'FREE',
    };
    const accountWithRelations = {
      ...account,
      email_verified: false,
      roles: [{ role_name: 'USER' }],
      userProfile: profile,
    };

    accountRepository.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed');
    accountRepository.createAccount.mockResolvedValue(account);
    accountRepository.findRoleByName.mockResolvedValue({ id_role: 2 });
    userProfileRepository.createUserProfile.mockResolvedValue(profile);
    frequencyService.crearMetaSemanal.mockResolvedValue({ id_frequency: 3 });
    streakRepository.createStreak.mockResolvedValue({ id_streak: 4 });
    userProfileRepository.updateUserProfile.mockResolvedValue(profile);
    accountRepository.findById.mockResolvedValue(accountWithRelations);
    jwt.sign.mockImplementation((_payload, secret) =>
      secret === process.env.JWT_SECRET ? 'access-token' : 'refresh-token'
    );
    refreshTokenRepository.createRefreshToken.mockResolvedValue({});

    const data = {
      email: 'test@example.com',
      password: 'secret',
      name: 'Test',
      lastname: 'User',
      frequency_goal: 3,
    };

    const result = await authService.register(data, { headers: {}, ip: '127.0.0.1' });

    expect(accountRepository.createAccount).toHaveBeenCalledWith(
      expect.objectContaining({ email: data.email, password_hash: 'hashed' }),
      { transaction: mockTransaction }
    );
    expect(userProfileRepository.createUserProfile).toHaveBeenCalledWith(
      expect.objectContaining({ id_account: account.id_account }),
      { transaction: mockTransaction }
    );
    expect(refreshTokenRepository.createRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({ id_account: account.id_account })
    );
    expect(result).toEqual({
      token: 'access-token',
      refreshToken: 'refresh-token',
      account: accountWithRelations,
      profile,
    });
  });

  it('lanza error si el email ya existe', async () => {
    accountRepository.findByEmail.mockResolvedValue({ id_account: 99 });

    await expect(authService.register({ email: 'exists@example.com' })).rejects.toThrow(
      'El email ya esta registrado'
    );
    expect(accountRepository.createAccount).not.toHaveBeenCalled();
  });
});

describe('auth-service login', () => {
  const context = { headers: {}, ip: '127.0.0.1' };

  it('retorna tokens y usuario para credenciales válidas', async () => {
    const account = {
      id_account: 2,
      email: 'user@example.com',
      password_hash: 'hashed',
      email_verified: true,
      roles: [{ role_name: 'USER' }],
      userProfile: { id_user_profile: 5, subscription: 'FREE' },
    };

    accountRepository.findByEmail.mockResolvedValue(account);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockImplementation((_payload, secret) =>
      secret === process.env.JWT_SECRET ? 'access-token' : 'refresh-token'
    );
    refreshTokenRepository.createRefreshToken.mockResolvedValue({});

    const result = await authService.login({ email: account.email, password: 'secret' }, context);

    expect(accountRepository.updateLastLogin).toHaveBeenCalled();
    expect(refreshTokenRepository.createRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({ id_account: account.id_account })
    );
    expect(result).toEqual({
      token: 'access-token',
      refreshToken: 'refresh-token',
      account,
      profile: account.userProfile,
    });
  });

  it('lanza error si la contraseña es inválida', async () => {
    const account = {
      id_account: 2,
      email: 'user@example.com',
      password_hash: 'hashed',
      roles: [],
      userProfile: null,
    };
    accountRepository.findByEmail.mockResolvedValue(account);
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      authService.login({ email: account.email, password: 'wrong' }, context)
    ).rejects.toThrow('Credenciales inválidas');
  });

  it('lanza error si la cuenta no existe', async () => {
    accountRepository.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({ email: 'notfound@example.com', password: 'secret' }, context)
    ).rejects.toThrow('Credenciales inválidas');
  });

  it('lanza error si el email no está verificado y el período de gracia expiró', async () => {
    const expiredDeadline = new Date(Date.now() - 86400000); // Ayer
    const account = {
      id_account: 3,
      email: 'user@example.com',
      password_hash: 'hashed',
      email_verified: false,
      auth_provider: 'local',
      email_verification_deadline: expiredDeadline,
      roles: [{ role_name: 'USER' }],
      userProfile: { id_user_profile: 5 },
    };

    accountRepository.findByEmail.mockResolvedValue(account);
    bcrypt.compare.mockResolvedValue(true);

    await expect(
      authService.login({ email: account.email, password: 'secret' }, context)
    ).rejects.toThrow('Tu período de gracia ha expirado');
  });

  it('permite login si el período de gracia está activo aunque el email no esté verificado', async () => {
    const activeDeadline = new Date(Date.now() + 86400000); // Mañana
    const account = {
      id_account: 4,
      email: 'user@example.com',
      password_hash: 'hashed',
      email_verified: false,
      auth_provider: 'local',
      email_verification_deadline: activeDeadline,
      roles: [{ role_name: 'USER' }],
      userProfile: { id_user_profile: 5, subscription: 'FREE' },
    };

    accountRepository.findByEmail.mockResolvedValue(account);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockImplementation((_payload, secret) =>
      secret === process.env.JWT_SECRET ? 'access-token' : 'refresh-token'
    );
    refreshTokenRepository.createRefreshToken.mockResolvedValue({});

    const result = await authService.login({ email: account.email, password: 'secret' }, context);

    expect(result.token).toBe('access-token');
  });

  it('normaliza el email a lowercase antes de buscar', async () => {
    const account = {
      id_account: 5,
      email: 'user@example.com',
      password_hash: 'hashed',
      email_verified: true,
      roles: [{ role_name: 'USER' }],
      userProfile: { id_user_profile: 5, subscription: 'FREE' },
    };

    accountRepository.findByEmail.mockResolvedValue(account);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockImplementation((_payload, secret) =>
      secret === process.env.JWT_SECRET ? 'access-token' : 'refresh-token'
    );
    refreshTokenRepository.createRefreshToken.mockResolvedValue({});

    await authService.login({ email: 'USER@EXAMPLE.COM', password: 'secret' }, context);

    expect(accountRepository.findByEmail).toHaveBeenCalledWith(
      'user@example.com',
      expect.any(Object)
    );
  });
});

describe('auth-service googleLogin', () => {
  it('crea nueva cuenta cuando el usuario no existe', async () => {
    const googleUser = {
      email: 'newuser@gmail.com',
      name: 'New User',
      googleId: 'google-123',
      picture: 'https://example.com/pic.jpg',
    };

    const newAccount = { id_account: 10, email: googleUser.email };
    const profile = {
      id_user_profile: 20,
      name: 'New',
      lastname: 'User',
      subscription: 'FREE',
    };

    // Mock directo del módulo auth-service para acceder a googleProvider
    const GoogleAuthProvider = require('../../../../utils/auth-providers/google-provider');
    const mockGoogleProvider = new GoogleAuthProvider();
    mockGoogleProvider.verifyToken.mockResolvedValue(googleUser);

    accountRepository.findByGoogleId.mockResolvedValue(null);
    accountRepository.findByEmail.mockResolvedValue(null);
    accountRepository.createAccount.mockResolvedValue(newAccount);
    accountRepository.findRoleByName.mockResolvedValue({ id_role: 2 });
    userProfileRepository.createUserProfile.mockResolvedValue(profile);
    accountRepository.findById.mockResolvedValue({
      ...newAccount,
      roles: [{ role_name: 'USER' }],
      userProfile: profile,
    });
    jwt.sign.mockImplementation((_payload, secret) =>
      secret === process.env.JWT_SECRET ? 'access-token' : 'refresh-token'
    );
    refreshTokenRepository.createRefreshToken.mockResolvedValue({});

    const result = await authService.googleLogin({ idToken: 'google-token' });

    expect(accountRepository.createAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        email: googleUser.email,
        google_id: googleUser.googleId,
        auth_provider: 'google',
        email_verified: true,
      }),
      { transaction: mockTransaction }
    );
    expect(result.token).toBe('access-token');
  });

  it('vincula cuenta existente con google_id cuando existe por email', async () => {
    const googleUser = {
      email: 'existing@gmail.com',
      name: 'Existing User',
      googleId: 'google-456',
    };

    const existingAccount = {
      id_account: 15,
      email: googleUser.email,
      roles: [{ role_name: 'USER' }],
      userProfile: { id_user_profile: 25 },
    };

    const GoogleAuthProvider = require('../../../../utils/auth-providers/google-provider');
    const mockGoogleProvider = new GoogleAuthProvider();
    mockGoogleProvider.verifyToken.mockResolvedValue(googleUser);

    accountRepository.findByGoogleId.mockResolvedValue(null);
    accountRepository.findByEmail.mockResolvedValue(existingAccount);
    accountRepository.findById.mockResolvedValue(existingAccount);
    jwt.sign.mockImplementation((_payload, secret) =>
      secret === process.env.JWT_SECRET ? 'access-token' : 'refresh-token'
    );
    refreshTokenRepository.createRefreshToken.mockResolvedValue({});

    await authService.googleLogin({ idToken: 'google-token' });

    expect(accountRepository.updateAccount).toHaveBeenCalledWith(
      existingAccount.id_account,
      expect.objectContaining({
        google_id: googleUser.googleId,
        auth_provider: 'google',
        email_verified: true,
      }),
      {}
    );
  });

  it('retorna cuenta existente cuando ya tiene google_id', async () => {
    const googleUser = {
      email: 'google@gmail.com',
      name: 'Google User',
      googleId: 'google-789',
    };

    const existingAccount = {
      id_account: 20,
      email: googleUser.email,
      google_id: googleUser.googleId,
      roles: [{ role_name: 'USER' }],
      userProfile: { id_user_profile: 30 },
    };

    const GoogleAuthProvider = require('../../../../utils/auth-providers/google-provider');
    const mockGoogleProvider = new GoogleAuthProvider();
    mockGoogleProvider.verifyToken.mockResolvedValue(googleUser);

    accountRepository.findByGoogleId.mockResolvedValue(existingAccount);
    jwt.sign.mockImplementation((_payload, secret) =>
      secret === process.env.JWT_SECRET ? 'access-token' : 'refresh-token'
    );
    refreshTokenRepository.createRefreshToken.mockResolvedValue({});

    const result = await authService.googleLogin({ idToken: 'google-token' });

    expect(accountRepository.createAccount).not.toHaveBeenCalled();
    expect(result.token).toBe('access-token');
  });
});
