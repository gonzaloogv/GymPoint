const {
  adminService,
  Account,
  UserProfile,
  AdminProfile,
  Role,
  RefreshToken,
  appEvents,
  EVENTS,
} = require('./test-setup');

describe('admin-service buscarUsuarioPorEmail', () => {
  it('retorna usuario con perfil de usuario y roles', async () => {
    const mockAccount = {
      id_account: 1,
      email: 'user@example.com',
      auth_provider: 'LOCAL',
      is_active: true,
      email_verified: true,
      last_login: new Date(),
      userProfile: {
        id_user_profile: 10,
        name: 'Juan',
        lastname: 'Pérez',
        app_tier: 'FREE',
        tokens: 100,
      },
      adminProfile: null,
      roles: [{ role_name: 'USER' }],
    };

    Account.findOne.mockResolvedValue(mockAccount);

    const result = await adminService.buscarUsuarioPorEmail('user@example.com');

    expect(Account.findOne).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      include: expect.arrayContaining([
        expect.objectContaining({ model: UserProfile, as: 'userProfile' }),
        expect.objectContaining({ model: AdminProfile, as: 'adminProfile' }),
        expect.objectContaining({ model: Role, as: 'roles' }),
      ]),
    });

    expect(result).toEqual({
      id_account: 1,
      email: 'user@example.com',
      auth_provider: 'LOCAL',
      is_active: true,
      email_verified: true,
      last_login: mockAccount.last_login,
      roles: ['USER'],
      profile: {
        id: 10,
        name: 'Juan',
        lastname: 'Pérez',
        type: 'user',
        subscription: 'FREE',
        tokens: 100,
      },
    });
  });

  it('retorna admin cuando el usuario tiene rol ADMIN', async () => {
    const mockAccount = {
      id_account: 2,
      email: 'admin@example.com',
      auth_provider: 'LOCAL',
      is_active: true,
      email_verified: true,
      last_login: new Date(),
      userProfile: null,
      adminProfile: {
        id_admin_profile: 5,
        name: 'Admin',
        lastname: 'System',
        department: 'IT',
      },
      roles: [{ role_name: 'ADMIN' }],
    };

    Account.findOne.mockResolvedValue(mockAccount);

    const result = await adminService.buscarUsuarioPorEmail('admin@example.com');

    expect(result.profile.type).toBe('admin');
    expect(result.profile.department).toBe('IT');
    expect(result.profile.id).toBe(5);
  });

  it('lanza error cuando el usuario no existe', async () => {
    Account.findOne.mockResolvedValue(null);

    await expect(adminService.buscarUsuarioPorEmail('notfound@example.com')).rejects.toThrow(
      'Usuario no encontrado'
    );
  });

  it('retorna cuenta sin perfil cuando no tiene userProfile ni adminProfile', async () => {
    const mockAccount = {
      id_account: 3,
      email: 'noprofile@example.com',
      auth_provider: 'GOOGLE',
      is_active: true,
      email_verified: false,
      last_login: null,
      userProfile: null,
      adminProfile: null,
      roles: [],
    };

    Account.findOne.mockResolvedValue(mockAccount);

    const result = await adminService.buscarUsuarioPorEmail('noprofile@example.com');

    expect(result.profile).toBeNull();
  });
});

describe('admin-service desactivarCuenta', () => {
  it('desactiva una cuenta activa y revoca refresh tokens', async () => {
    const mockAccount = {
      id_account: 1,
      email: 'user@example.com',
      is_active: true,
      update: jest.fn().mockResolvedValue(true),
      userProfile: {
        id_user_profile: 10,
        id_account: 1,
      },
    };

    Account.findByPk.mockResolvedValue(mockAccount);
    UserProfile.findOne.mockResolvedValue(mockAccount.userProfile);
    RefreshToken.update.mockResolvedValue([1]);

    await adminService.desactivarCuenta(1);

    expect(Account.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    expect(mockAccount.update).toHaveBeenCalledWith({ is_active: false });
    expect(RefreshToken.update).toHaveBeenCalledWith(
      { is_revoked: true },
      { where: { id_account: 1 } }
    );

    expect(appEvents.emit).toHaveBeenCalledWith(
      EVENTS.USER_ACCOUNT_STATUS_UPDATED,
      expect.objectContaining({
        accountId: 1,
        userId: 10,
        email: 'user@example.com',
        isActive: false,
        timestamp: expect.any(String),
      })
    );
  });

  it('lanza error cuando la cuenta no existe', async () => {
    Account.findByPk.mockResolvedValue(null);

    await expect(adminService.desactivarCuenta(999)).rejects.toThrow('Cuenta no encontrada');
  });

  it('lanza error cuando la cuenta ya está desactivada', async () => {
    const mockAccount = {
      id_account: 1,
      is_active: false,
    };

    Account.findByPk.mockResolvedValue(mockAccount);

    await expect(adminService.desactivarCuenta(1)).rejects.toThrow(
      'La cuenta ya está desactivada'
    );
  });

  it('desactiva cuenta sin userProfile (admin u otra sin perfil)', async () => {
    const mockAccount = {
      id_account: 2,
      email: 'admin@example.com',
      is_active: true,
      update: jest.fn().mockResolvedValue(true),
      userProfile: null,
    };

    Account.findByPk.mockResolvedValue(mockAccount);
    UserProfile.findOne.mockResolvedValue(null);

    await adminService.desactivarCuenta(2);

    expect(mockAccount.update).toHaveBeenCalledWith({ is_active: false });
    expect(RefreshToken.update).not.toHaveBeenCalled();
    expect(appEvents.emit).toHaveBeenCalledWith(
      EVENTS.USER_ACCOUNT_STATUS_UPDATED,
      expect.objectContaining({
        accountId: 2,
        userId: null,
        email: 'admin@example.com',
        isActive: false,
      })
    );
  });

  it('maneja errores al revocar refresh tokens', async () => {
    const mockAccount = {
      id_account: 1,
      email: 'user@example.com',
      is_active: true,
      update: jest.fn().mockResolvedValue(true),
      userProfile: {
        id_user_profile: 10,
        id_account: 1,
      },
    };

    Account.findByPk.mockResolvedValue(mockAccount);
    UserProfile.findOne.mockResolvedValue(mockAccount.userProfile);
    RefreshToken.update.mockRejectedValue(new Error('Token revocation failed'));

    await expect(adminService.desactivarCuenta(1)).rejects.toThrow(
      'Token revocation failed'
    );
  });
});

describe('admin-service activarCuenta', () => {
  it('activa una cuenta inactiva y emite evento', async () => {
    const mockAccount = {
      id_account: 1,
      email: 'user@example.com',
      is_active: false,
      userProfile: {
        id_user_profile: 10,
      },
      update: jest.fn().mockResolvedValue(true),
    };

    Account.findByPk.mockResolvedValue(mockAccount);

    await adminService.activarCuenta(1);

    expect(mockAccount.update).toHaveBeenCalledWith({ is_active: true });
    expect(appEvents.emit).toHaveBeenCalledWith(
      EVENTS.USER_ACCOUNT_STATUS_UPDATED,
      expect.objectContaining({
        accountId: 1,
        userId: 10,
        isActive: true,
      })
    );
  });

  it('lanza error cuando la cuenta no existe', async () => {
    Account.findByPk.mockResolvedValue(null);

    await expect(adminService.activarCuenta(999)).rejects.toThrow('Cuenta no encontrada');
  });

  it('lanza error cuando la cuenta ya está activa', async () => {
    const mockAccount = {
      id_account: 1,
      is_active: true,
    };

    Account.findByPk.mockResolvedValue(mockAccount);

    await expect(adminService.activarCuenta(1)).rejects.toThrow('La cuenta ya está activa');
  });

  it('activa cuenta sin userProfile', async () => {
    const mockAccount = {
      id_account: 2,
      email: 'admin@example.com',
      is_active: false,
      userProfile: null,
      update: jest.fn().mockResolvedValue(true),
    };

    Account.findByPk.mockResolvedValue(mockAccount);

    await adminService.activarCuenta(2);

    expect(mockAccount.update).toHaveBeenCalledWith({ is_active: true });
    expect(appEvents.emit).toHaveBeenCalledWith(
      EVENTS.USER_ACCOUNT_STATUS_UPDATED,
      expect.objectContaining({
        accountId: 2,
        userId: null,
        isActive: true,
      })
    );
  });

  it('maneja errores al actualizar la cuenta', async () => {
    const mockAccount = {
      id_account: 1,
      email: 'user@example.com',
      is_active: false,
      userProfile: { id_user_profile: 10 },
      update: jest.fn().mockRejectedValue(new Error('Update failed')),
    };

    Account.findByPk.mockResolvedValue(mockAccount);

    await expect(adminService.activarCuenta(1)).rejects.toThrow('Update failed');
  });
});
