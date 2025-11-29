const {
  Op,
  adminService,
  sequelize,
  Account,
  UserProfile,
  AdminProfile,
} = require('./test-setup');

describe('admin-service obtenerEstadisticas', () => {
  it('retorna estadísticas completas del sistema', async () => {
    const mockSubscriptionStats = [
      { subscription: 'FREE', count: 100 },
      { subscription: 'PREMIUM', count: 50 },
    ];

    const mockRoleStats = [
      { role_name: 'USER', count: 140 },
      { role_name: 'ADMIN', count: 10 },
    ];

    const mockTokensResult = [{ total_tokens: 50000 }];

    sequelize.query
      .mockResolvedValueOnce([mockSubscriptionStats])
      .mockResolvedValueOnce([mockRoleStats])
      .mockResolvedValueOnce([mockTokensResult]);

    Account.count.mockResolvedValue(145);
    AdminProfile.count.mockResolvedValue(10);
    UserProfile.count.mockResolvedValue(25);

    const result = await adminService.obtenerEstadisticas();

    expect(sequelize.query).toHaveBeenCalledTimes(3);
    expect(Account.count).toHaveBeenCalled();
    expect(AdminProfile.count).toHaveBeenCalled();
    expect(UserProfile.count).toHaveBeenCalled();

    expect(result).toEqual({
      users: {
        total: 145,
        by_subscription: mockSubscriptionStats,
        recent_registrations: 25,
      },
      admins: {
        total: 10,
      },
      roles: mockRoleStats,
      tokens: {
        total_in_circulation: 50000,
      },
      timestamp: expect.any(Date),
    });
  });

  it('maneja tokens en null retornando 0', async () => {
    sequelize.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ total_tokens: null }]]);

    Account.count.mockResolvedValue(0);
    AdminProfile.count.mockResolvedValue(0);
    UserProfile.count.mockResolvedValue(0);

    const result = await adminService.obtenerEstadisticas();

    expect(result.tokens.total_in_circulation).toBe(0);
  });

  it('cuenta correctamente usuarios activos con UserProfile incluido', async () => {
    sequelize.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ total_tokens: 0 }]]);

    Account.count.mockResolvedValue(50);
    AdminProfile.count.mockResolvedValue(5);
    UserProfile.count.mockResolvedValue(10);

    const result = await adminService.obtenerEstadisticas();

    expect(Account.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { is_active: true },
        include: expect.objectContaining({
          model: UserProfile,
          as: 'userProfile',
          required: true,
        }),
      })
    );
    expect(result.users.total).toBe(50);
  });

  it('maneja errores en queries de estadísticas', async () => {
    sequelize.query.mockRejectedValue(new Error('Database error'));

    await expect(adminService.obtenerEstadisticas()).rejects.toThrow('Database error');
  });
});

describe('admin-service listarUsuarios', () => {
  it('retorna usuarios paginados con valores por defecto', async () => {
    const mockRows = [
      {
        id_user_profile: 1,
        id_account: 1,
        name: 'Juan',
        lastname: 'Pérez',
        app_tier: 'FREE',
        tokens: 100,
        created_at: new Date('2024-01-01'),
        account: {
          email: 'juan@example.com',
          auth_provider: 'LOCAL',
          is_active: true,
          last_login: new Date('2024-01-15'),
        },
      },
    ];

    UserProfile.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: mockRows,
    });

    const result = await adminService.listarUsuarios();

    expect(UserProfile.findAndCountAll).toHaveBeenCalledWith({
      where: {},
      include: expect.objectContaining({
        model: Account,
        as: 'account',
        required: true,
      }),
      order: [['created_at', 'DESC']],
      limit: 20,
      offset: 0,
    });

    expect(result).toEqual({
      users: [
        {
          id_user_profile: 1,
          id_account: 1,
          email: 'juan@example.com',
          name: 'Juan',
          lastname: 'Pérez',
          subscription: 'FREE',
          tokens: 100,
          is_active: true,
          auth_provider: 'LOCAL',
          last_login: mockRows[0].account.last_login,
          created_at: mockRows[0].created_at,
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 20,
        total_pages: 1,
      },
    });
  });

  it('filtra por suscripción cuando se especifica', async () => {
    UserProfile.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await adminService.listarUsuarios({ subscription: 'PREMIUM' });

    expect(UserProfile.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { app_tier: 'PREMIUM' },
      })
    );
  });

  it('filtra por búsqueda de texto en nombre, apellido y email', async () => {
    UserProfile.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await adminService.listarUsuarios({ search: 'Juan' });

    expect(UserProfile.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          [Op.or]: expect.arrayContaining([
            { name: expect.any(Object) },
            { lastname: expect.any(Object) },
            { '$account.email$': expect.any(Object) },
          ]),
        }),
      })
    );
  });

  it('filtra por ID numérico cuando la búsqueda es un número', async () => {
    UserProfile.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await adminService.listarUsuarios({ search: '123' });

    expect(UserProfile.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          [Op.or]: expect.arrayContaining([
            { id_user_profile: 123 },
            { '$account.id_account$': 123 },
          ]),
        }),
      })
    );
  });

  it('filtra por estado de cuenta activo', async () => {
    UserProfile.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await adminService.listarUsuarios({ status: 'active' });

    expect(UserProfile.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          where: { is_active: true },
        }),
      })
    );
  });

  it('filtra por estado de cuenta inactivo', async () => {
    UserProfile.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await adminService.listarUsuarios({ status: 'inactive' });

    expect(UserProfile.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          where: { is_active: false },
        }),
      })
    );
  });

  it('respeta el límite máximo de 100 registros', async () => {
    UserProfile.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await adminService.listarUsuarios({ limit: 500 });

    expect(UserProfile.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 100,
      })
    );
  });

  it('calcula correctamente el offset para paginación', async () => {
    UserProfile.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await adminService.listarUsuarios({ page: 3, limit: 10 });

    expect(UserProfile.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 10,
        offset: 20,
      })
    );
  });

  it('ordena por campo personalizado', async () => {
    UserProfile.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await adminService.listarUsuarios({ sortBy: 'tokens', order: 'ASC' });

    expect(UserProfile.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        order: [['tokens', 'ASC']],
      })
    );
  });

  it('filtra por estado revoked (alias de inactive)', async () => {
    UserProfile.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await adminService.listarUsuarios({ status: 'revoked' });

    expect(UserProfile.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          where: { is_active: false },
        }),
      })
    );
  });

  it('maneja límites menores a 1 usando 1 como mínimo', async () => {
    UserProfile.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await adminService.listarUsuarios({ limit: -5 });

    expect(UserProfile.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 1,
      })
    );
  });

  it('no aplica filtro de accountWhere cuando status es inválido', async () => {
    UserProfile.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await adminService.listarUsuarios({ status: 'invalid_status' });

    expect(UserProfile.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          where: undefined,
        }),
      })
    );
  });

  it('maneja errores en findAndCountAll', async () => {
    UserProfile.findAndCountAll.mockRejectedValue(new Error('Database connection error'));

    await expect(adminService.listarUsuarios()).rejects.toThrow('Database connection error');
  });
});
