const {
  authService,
  accountRepository,
  passwordResetRepository,
  refreshTokenRepository,
  bcrypt,
  mockTransaction,
} = require('./test-setup');

describe('auth-service requestPasswordReset', () => {
  it('genera token y envía email de reset para cuenta local', async () => {
    const account = {
      id_account: 10,
      email: 'user@example.com',
      auth_provider: 'local',
      userProfile: { name: 'Test' },
    };

    accountRepository.findByEmail.mockResolvedValue(account);

    await authService.requestPasswordReset('user@example.com', { ipAddress: '127.0.0.1' });

    expect(passwordResetRepository.revokeAllByAccount).toHaveBeenCalledWith(account.id_account);
    expect(passwordResetRepository.createResetToken).toHaveBeenCalledWith(
      expect.objectContaining({
        id_account: account.id_account,
        ip_address: '127.0.0.1',
      })
    );
  });

  it('no revela si el email no existe (timing-safe)', async () => {
    accountRepository.findByEmail.mockResolvedValue(null);

    const promise = authService.requestPasswordReset('notfound@example.com');

    // Ejecutar todos los timers pendientes (el setTimeout de 100ms)
    await jest.runAllTimersAsync();

    await expect(promise).resolves.not.toThrow();

    expect(passwordResetRepository.createResetToken).not.toHaveBeenCalled();
  });

  it('ignora silenciosamente cuentas que no son locales', async () => {
    const account = {
      id_account: 10,
      email: 'google@example.com',
      auth_provider: 'google',
    };

    accountRepository.findByEmail.mockResolvedValue(account);

    await expect(authService.requestPasswordReset('google@example.com')).resolves.not.toThrow();

    expect(passwordResetRepository.createResetToken).not.toHaveBeenCalled();
  });
});

describe('auth-service resetPassword', () => {
  it('restablece la contraseña y revoca refresh tokens', async () => {
    const resetToken = {
      id_password_reset: 1,
      id_account: 10,
      token: 'valid-reset-token',
    };

    const account = {
      id_account: 10,
      email: 'user@example.com',
      userProfile: { name: 'Test' },
    };

    passwordResetRepository.findValidToken.mockResolvedValue(resetToken);
    accountRepository.findById.mockResolvedValueOnce(account).mockResolvedValueOnce(account);
    bcrypt.hash.mockResolvedValue('new-hashed-password');

    await authService.resetPassword('valid-reset-token', 'newpassword123');

    expect(accountRepository.updateAccount).toHaveBeenCalledWith(
      resetToken.id_account,
      expect.objectContaining({
        password_hash: 'new-hashed-password',
        email_verified: true,
      }),
      { transaction: mockTransaction }
    );
    expect(passwordResetRepository.markAsUsed).toHaveBeenCalledWith(
      'valid-reset-token',
      { transaction: mockTransaction }
    );
    expect(refreshTokenRepository.revokeAllByAccount).toHaveBeenCalledWith(
      resetToken.id_account,
      { transaction: mockTransaction }
    );
  });

  it('lanza error si la contraseña es muy corta', async () => {
    await expect(authService.resetPassword('token', 'short')).rejects.toThrow(
      'La contraseña debe tener al menos 6 caracteres'
    );
  });

  it('lanza error si el token es inválido o expirado', async () => {
    passwordResetRepository.findValidToken.mockResolvedValue(null);

    await expect(authService.resetPassword('invalid-token', 'newpassword')).rejects.toThrow(
      'Token de restablecimiento inválido o expirado'
    );
  });
});

describe('auth-service changePassword', () => {
  it('cambia la contraseña y revoca refresh tokens', async () => {
    const account = {
      id_account: 10,
      email: 'user@example.com',
      auth_provider: 'local',
      password_hash: 'old-hash',
      userProfile: { name: 'Test' },
    };

    accountRepository.findById.mockResolvedValue(account);
    bcrypt.compare.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    bcrypt.hash.mockResolvedValue('new-hash');

    await authService.changePassword({
      accountId: 10,
      currentPassword: 'oldpassword',
      newPassword: 'newpassword',
    });

    expect(accountRepository.updateAccount).toHaveBeenCalledWith(
      10,
      expect.objectContaining({ password_hash: 'new-hash' }),
      { transaction: mockTransaction }
    );
    expect(refreshTokenRepository.revokeAllByAccount).toHaveBeenCalledWith(
      10,
      { transaction: mockTransaction }
    );
  });

  it('lanza error si la contraseña actual es incorrecta', async () => {
    const account = {
      id_account: 10,
      auth_provider: 'local',
      password_hash: 'hash',
    };

    accountRepository.findById.mockResolvedValue(account);
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      authService.changePassword({
        accountId: 10,
        currentPassword: 'wrong',
        newPassword: 'newpassword',
      })
    ).rejects.toThrow('La contraseña actual es incorrecta');
  });

  it('lanza error si la cuenta es de Google', async () => {
    const account = {
      id_account: 10,
      auth_provider: 'google',
    };

    accountRepository.findById.mockResolvedValue(account);

    await expect(
      authService.changePassword({
        accountId: 10,
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      })
    ).rejects.toThrow('No puedes cambiar la contraseña de una cuenta vinculada con Google');
  });

  it('lanza error si la nueva contraseña es igual a la actual', async () => {
    const account = {
      id_account: 10,
      auth_provider: 'local',
      password_hash: 'hash',
    };

    accountRepository.findById.mockResolvedValue(account);
    bcrypt.compare.mockResolvedValue(true);

    await expect(
      authService.changePassword({
        accountId: 10,
        currentPassword: 'password',
        newPassword: 'password',
      })
    ).rejects.toThrow('La nueva contraseña debe ser diferente a la actual');
  });
});
