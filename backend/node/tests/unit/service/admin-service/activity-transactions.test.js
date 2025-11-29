const {
  adminService,
  Account,
  UserProfile,
  TokenLedger,
} = require('./test-setup');

describe('admin-service obtenerActividadReciente', () => {
  it('retorna actividad reciente de los últimos 7 días por defecto', async () => {
    const mockNewUsers = [
      {
        id_user_profile: 1,
        name: 'Juan',
        lastname: 'Pérez',
        created_at: new Date('2024-01-10'),
        account: { email: 'juan@example.com' },
      },
    ];

    const mockRecentLogins = [
      {
        email: 'user@example.com',
        last_login: new Date('2024-01-15'),
        userProfile: { name: 'Maria', lastname: 'González' },
        adminProfile: null,
      },
    ];

    UserProfile.findAll.mockResolvedValue(mockNewUsers);
    Account.findAll.mockResolvedValue(mockRecentLogins);

    const result = await adminService.obtenerActividadReciente();

    expect(UserProfile.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          created_at: expect.any(Object),
        }),
        limit: 50,
      })
    );

    expect(Account.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          last_login: expect.any(Object),
        }),
        limit: 50,
      })
    );

    expect(result.new_users).toHaveLength(1);
    expect(result.recent_logins).toHaveLength(1);
  });

  it('acepta parámetro de días personalizado', async () => {
    UserProfile.findAll.mockResolvedValue([]);
    Account.findAll.mockResolvedValue([]);

    await adminService.obtenerActividadReciente(30);

    expect(UserProfile.findAll).toHaveBeenCalled();
    expect(Account.findAll).toHaveBeenCalled();
  });

  it('formatea correctamente admin logins', async () => {
    const mockRecentLogins = [
      {
        email: 'admin@example.com',
        last_login: new Date('2024-01-15'),
        userProfile: null,
        adminProfile: { name: 'Admin', lastname: 'User' },
      },
    ];

    UserProfile.findAll.mockResolvedValue([]);
    Account.findAll.mockResolvedValue(mockRecentLogins);

    const result = await adminService.obtenerActividadReciente();

    expect(result.recent_logins[0].name).toBe('Admin User (Admin)');
  });

  it('maneja cuentas sin userProfile ni adminProfile', async () => {
    const mockRecentLogins = [
      {
        email: 'orphan@example.com',
        last_login: new Date('2024-01-15'),
        userProfile: null,
        adminProfile: null,
      },
    ];

    UserProfile.findAll.mockResolvedValue([]);
    Account.findAll.mockResolvedValue(mockRecentLogins);

    const result = await adminService.obtenerActividadReciente();

    expect(result.recent_logins[0].name).toBe('Unknown');
  });

  it('retorna arrays vacíos cuando no hay actividad reciente', async () => {
    UserProfile.findAll.mockResolvedValue([]);
    Account.findAll.mockResolvedValue([]);

    const result = await adminService.obtenerActividadReciente();

    expect(result.new_users).toEqual([]);
    expect(result.recent_logins).toEqual([]);
  });

  it('maneja errores en consultas de actividad', async () => {
    UserProfile.findAll.mockRejectedValue(new Error('Database error'));

    await expect(adminService.obtenerActividadReciente()).rejects.toThrow('Database error');
  });
});

describe('admin-service obtenerTransacciones', () => {
  it('retorna transacciones paginadas de todos los usuarios', async () => {
    const mockRows = [
      {
        id_ledger: 1,
        id_user_profile: 10,
        delta: 100,
        reason: 'ACHIEVEMENT',
        ref_type: 'achievement',
        ref_id: 5,
        balance_after: 100,
        created_at: new Date(),
        userProfile: {
          name: 'Juan',
          lastname: 'Pérez',
          account: { email: 'juan@example.com' },
        },
      },
    ];

    TokenLedger.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: mockRows,
    });

    const result = await adminService.obtenerTransacciones();

    expect(TokenLedger.findAndCountAll).toHaveBeenCalledWith({
      where: {},
      include: expect.any(Object),
      order: [['created_at', 'DESC']],
      limit: 50,
      offset: 0,
    });

    expect(result.transactions).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  it('filtra por idUserProfile cuando se especifica', async () => {
    TokenLedger.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await adminService.obtenerTransacciones(10);

    expect(TokenLedger.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_user_profile: 10 },
      })
    );
  });

  it('aplica paginación correctamente', async () => {
    TokenLedger.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await adminService.obtenerTransacciones(null, { page: 2, limit: 25 });

    expect(TokenLedger.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 25,
        offset: 25,
      })
    );
  });

  it('maneja userProfile null en transacciones', async () => {
    const mockRows = [
      {
        id_ledger: 1,
        id_user_profile: 10,
        delta: 100,
        reason: 'ACHIEVEMENT',
        ref_type: 'achievement',
        ref_id: 5,
        balance_after: 100,
        created_at: new Date(),
        userProfile: null,
      },
    ];

    TokenLedger.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: mockRows,
    });

    const result = await adminService.obtenerTransacciones();

    expect(result.transactions[0].user).toBeNull();
  });

  it('maneja account null dentro de userProfile', async () => {
    const mockRows = [
      {
        id_ledger: 2,
        id_user_profile: 20,
        delta: 50,
        reason: 'REWARD',
        ref_type: 'reward',
        ref_id: 10,
        balance_after: 150,
        created_at: new Date(),
        userProfile: {
          name: 'Juan',
          lastname: 'Pérez',
          account: null,
        },
      },
    ];

    TokenLedger.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: mockRows,
    });

    const result = await adminService.obtenerTransacciones();

    expect(result.transactions[0].user).toEqual({
      name: 'Juan Pérez',
      email: undefined,
    });
  });

  it('retorna transacciones vacías cuando no hay registros', async () => {
    TokenLedger.findAndCountAll.mockResolvedValue({
      count: 0,
      rows: [],
    });

    const result = await adminService.obtenerTransacciones();

    expect(result.transactions).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.total_pages).toBe(0);
  });

  it('calcula correctamente total_pages con paginación', async () => {
    TokenLedger.findAndCountAll.mockResolvedValue({
      count: 127,
      rows: [],
    });

    const result = await adminService.obtenerTransacciones(null, { limit: 25, page: 1 });

    expect(result.pagination.total_pages).toBe(6);
  });

  it('maneja errores en consultas de transacciones', async () => {
    TokenLedger.findAndCountAll.mockRejectedValue(new Error('Query timeout'));

    await expect(adminService.obtenerTransacciones()).rejects.toThrow('Query timeout');
  });
});
