const {
  authService,
  accountRepository,
  refreshTokenRepository,
  emailVerificationRepository,
  jwt,
  mockTransaction,
} = require('./test-setup');

describe('auth-service refreshAccessToken', () => {
  it('genera nuevo access token y refresh token cuando el token es válido', async () => {
    const account = {
      id_account: 1,
      email: 'user@example.com',
      email_verified: true,
      roles: [{ role_name: 'USER' }],
      userProfile: { id_user_profile: 10 },
    };

    jwt.verify.mockReturnValue({ id_account: account.id_account });
    refreshTokenRepository.findActiveByToken.mockResolvedValue({
      token: 'old-refresh-token',
      expires_at: new Date(Date.now() + 86400000),
    });
    accountRepository.findById.mockResolvedValue(account);
    jwt.sign.mockImplementation((_payload, secret) =>
      secret === process.env.JWT_SECRET ? 'new-access-token' : 'new-refresh-token'
    );
    refreshTokenRepository.createRefreshToken.mockResolvedValue({});

    const result = await authService.refreshAccessToken({ refreshToken: 'old-refresh-token' });

    expect(refreshTokenRepository.revokeByToken).toHaveBeenCalledWith('old-refresh-token');
    expect(result).toEqual({
      token: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  });

  it('lanza error cuando el refresh token es inválido', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await expect(
      authService.refreshAccessToken({ refreshToken: 'invalid-token' })
    ).rejects.toThrow('Refresh token inválido o expirado');
  });

  it('lanza error cuando el refresh token no está en la base de datos', async () => {
    jwt.verify.mockReturnValue({ id_account: 1 });
    refreshTokenRepository.findActiveByToken.mockResolvedValue(null);

    await expect(
      authService.refreshAccessToken({ refreshToken: 'not-found-token' })
    ).rejects.toThrow('Refresh token no encontrado o revocado');
  });

  it('lanza error cuando el refresh token está expirado', async () => {
    jwt.verify.mockReturnValue({ id_account: 1 });
    refreshTokenRepository.findActiveByToken.mockResolvedValue({
      token: 'expired-token',
      expires_at: new Date(Date.now() - 86400000), // Ayer
    });

    await expect(
      authService.refreshAccessToken({ refreshToken: 'expired-token' })
    ).rejects.toThrow('Refresh token expirado');
  });

  it('lanza error si el email no está verificado y expiró el período de gracia', async () => {
    const account = {
      id_account: 1,
      email: 'user@example.com',
      email_verified: false,
      auth_provider: 'local',
      email_verification_deadline: new Date(Date.now() - 86400000),
      roles: [{ role_name: 'USER' }],
      userProfile: { id_user_profile: 10 },
    };

    jwt.verify.mockReturnValue({ id_account: account.id_account });
    refreshTokenRepository.findActiveByToken.mockResolvedValue({
      token: 'refresh-token',
      expires_at: new Date(Date.now() + 86400000),
    });
    accountRepository.findById.mockResolvedValue(account);

    await expect(
      authService.refreshAccessToken({ refreshToken: 'refresh-token' })
    ).rejects.toThrow('Tu período de gracia ha expirado');
  });
});

describe('auth-service logout', () => {
  it('revoca el refresh token', async () => {
    await authService.logout({ refreshToken: 'token-to-revoke' });

    expect(refreshTokenRepository.revokeByToken).toHaveBeenCalledWith('token-to-revoke');
  });

  it('no hace nada si no se proporciona refresh token', async () => {
    await authService.logout({ refreshToken: undefined });

    // Con el fix: refreshToken es null, por lo que no se llama a revokeByToken
    expect(refreshTokenRepository.revokeByToken).not.toHaveBeenCalled();
  });
});

describe('auth-service verifyEmailToken', () => {
  it('verifica el token y marca la cuenta como verificada', async () => {
    const verificationToken = {
      id_email_verification: 1,
      id_account: 10,
      token: 'valid-token',
    };

    const account = {
      id_account: 10,
      email: 'user@example.com',
      email_verified: true,
      roles: [{ role_name: 'USER' }],
      userProfile: { id_user_profile: 20 },
    };

    emailVerificationRepository.findValidToken.mockResolvedValue(verificationToken);
    accountRepository.findById.mockResolvedValue(account);

    const result = await authService.verifyEmailToken('valid-token');

    expect(emailVerificationRepository.markAsUsed).toHaveBeenCalledWith(
      'valid-token',
      { transaction: mockTransaction }
    );
    expect(accountRepository.updateAccount).toHaveBeenCalledWith(
      verificationToken.id_account,
      expect.objectContaining({
        email_verified: true,
        email_verification_deadline: null,
      }),
      { transaction: mockTransaction }
    );
    expect(result).toEqual(account);
  });

  it('lanza error si el token es inválido o expirado', async () => {
    emailVerificationRepository.findValidToken.mockResolvedValue(null);

    await expect(authService.verifyEmailToken('invalid-token')).rejects.toThrow(
      'Token de verificación inválido o expirado'
    );
  });
});

describe('auth-service resendVerificationEmail', () => {
  it('reenvía el email de verificación', async () => {
    const account = {
      id_account: 10,
      email: 'user@example.com',
      email_verified: false,
      userProfile: { id_user_profile: 20, name: 'Test' },
    };

    accountRepository.findByEmail.mockResolvedValue(account);
    emailVerificationRepository.findByAccount.mockResolvedValue([]);

    await authService.resendVerificationEmail('user@example.com');

    expect(emailVerificationRepository.revokeAllByAccount).toHaveBeenCalledWith(
      account.id_account
    );
    expect(emailVerificationRepository.createVerificationToken).toHaveBeenCalled();
  });

  it('lanza error si la cuenta no existe', async () => {
    accountRepository.findByEmail.mockResolvedValue(null);

    await expect(authService.resendVerificationEmail('notfound@example.com')).rejects.toThrow(
      'No existe una cuenta con ese email'
    );
  });

  it('lanza error si el email ya está verificado', async () => {
    const account = {
      id_account: 10,
      email: 'verified@example.com',
      email_verified: true,
    };

    accountRepository.findByEmail.mockResolvedValue(account);

    await expect(authService.resendVerificationEmail('verified@example.com')).rejects.toThrow(
      'Este email ya está verificado'
    );
  });

  it('lanza error si se intentó reenviar hace menos de 5 minutos', async () => {
    const account = {
      id_account: 10,
      email: 'user@example.com',
      email_verified: false,
      userProfile: { name: 'Test' },
    };

    const recentToken = {
      id_email_verification: 1,
      used_at: null,
      created_at: new Date(Date.now() - 60000), // Hace 1 minuto
    };

    accountRepository.findByEmail.mockResolvedValue(account);
    emailVerificationRepository.findByAccount.mockResolvedValue([recentToken]);

    await expect(authService.resendVerificationEmail('user@example.com')).rejects.toThrow(
      'Ya enviamos un email de verificación recientemente'
    );
  });
});
