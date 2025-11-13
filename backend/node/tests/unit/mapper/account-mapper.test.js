const { toAccount } = require('../../../infra/db/mappers/account.mapper');

describe('account-mapper toAccount', () => {
  it('transforma una instancia completa de Account con roles y userProfile', () => {
    const accountInstance = {
      get: () => ({
        id_account: 1,
        email: 'test@example.com',
        password_hash: 'hashed_password_123',
        auth_provider: 'local',
        google_id: null,
        email_verified: true,
        is_active: true,
        last_login: '2024-01-15T10:30:00.000Z',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-15T10:30:00.000Z',
        roles: [
          { get: () => ({ id_role: 1, role_name: 'USER' }) },
          { get: () => ({ id_role: 2, role_name: 'PREMIUM' }) },
        ],
        userProfile: {
          get: () => ({
            id_user_profile: 10,
            id_account: 1,
            name: 'John',
            lastname: 'Doe',
            subscription: 'PREMIUM',
          }),
        },
      }),
    };

    const result = toAccount(accountInstance);

    expect(result.id_account).toBe(1);
    expect(result.email).toBe('test@example.com');
    expect(result.password_hash).toBe('hashed_password_123');
    expect(result.auth_provider).toBe('local');
    expect(result.google_id).toBeNull();
    expect(result.email_verified).toBe(true);
    expect(result.is_active).toBe(true);
    expect(result.last_login).toBe('2024-01-15T10:30:00.000Z');
    expect(result.created_at).toBe('2024-01-01T00:00:00.000Z');
    expect(result.updated_at).toBe('2024-01-15T10:30:00.000Z');
    expect(result.roles).toEqual([
      expect.objectContaining({ id_role: 1, role_name: 'USER' }),
      expect.objectContaining({ id_role: 2, role_name: 'PREMIUM' }),
    ]);
    expect(result.userProfile).toEqual(
      expect.objectContaining({
        id_user_profile: 10,
        id_account: 1,
        name: 'John',
        lastname: 'Doe',
        subscription: 'PREMIUM',
      })
    );
  });

  it('transforma una cuenta con autenticación de Google', () => {
    const accountInstance = {
      get: () => ({
        id_account: 2,
        email: 'google@example.com',
        password_hash: null,
        auth_provider: 'google',
        google_id: 'google_id_12345',
        email_verified: true,
        is_active: true,
        last_login: null,
        created_at: '2024-02-01T00:00:00.000Z',
        updated_at: '2024-02-01T00:00:00.000Z',
      }),
    };

    const result = toAccount(accountInstance);

    expect(result.id_account).toBe(2);
    expect(result.email).toBe('google@example.com');
    expect(result.password_hash).toBeNull();
    expect(result.auth_provider).toBe('google');
    expect(result.google_id).toBe('google_id_12345');
    expect(result.email_verified).toBe(true);
    expect(result.last_login).toBeNull();
  });

  it('transforma una cuenta con adminProfile', () => {
    const accountInstance = {
      get: () => ({
        id_account: 3,
        email: 'admin@example.com',
        password_hash: 'hashed_admin_password',
        auth_provider: 'local',
        google_id: null,
        email_verified: true,
        is_active: true,
        last_login: '2024-01-20T08:00:00.000Z',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-20T08:00:00.000Z',
        roles: [{ get: () => ({ id_role: 3, role_name: 'ADMIN' }) }],
        adminProfile: {
          get: () => ({
            id_admin_profile: 5,
            id_account: 3,
            department: 'Operations',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          }),
        },
      }),
    };

    const result = toAccount(accountInstance);

    expect(result.id_account).toBe(3);
    expect(result.email).toBe('admin@example.com');
    expect(result.roles).toEqual([
      expect.objectContaining({ id_role: 3, role_name: 'ADMIN' }),
    ]);
    expect(result.adminProfile).toEqual({
      id_admin_profile: 5,
      id_account: 3,
      department: 'Operations',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    });
  });

  it('convierte email_verified e is_active a booleanos', () => {
    const accountInstance = {
      get: () => ({
        id_account: 4,
        email: 'test@example.com',
        auth_provider: 'local',
        email_verified: 1,
        is_active: 0,
      }),
    };

    const result = toAccount(accountInstance);

    expect(result.email_verified).toBe(true);
    expect(result.is_active).toBe(false);
  });

  it('maneja email_verified e is_active como false cuando son 0', () => {
    const accountInstance = {
      get: () => ({
        id_account: 5,
        email: 'test@example.com',
        auth_provider: 'local',
        email_verified: 0,
        is_active: 0,
      }),
    };

    const result = toAccount(accountInstance);

    expect(result.email_verified).toBe(false);
    expect(result.is_active).toBe(false);
  });

  it('retorna null cuando la instancia es null', () => {
    const result = toAccount(null);

    expect(result).toBeNull();
  });

  it('retorna null cuando la instancia es undefined', () => {
    const result = toAccount(undefined);

    expect(result).toBeNull();
  });

  it('maneja campos opcionales como null', () => {
    const accountInstance = {
      get: () => ({
        id_account: 6,
        email: 'minimal@example.com',
        auth_provider: 'local',
        email_verified: false,
        is_active: true,
      }),
    };

    const result = toAccount(accountInstance);

    expect(result.password_hash).toBeNull();
    expect(result.google_id).toBeNull();
    expect(result.last_login).toBeNull();
    expect(result.created_at).toBeNull();
    expect(result.updated_at).toBeNull();
  });

  it('no incluye roles si no están presentes', () => {
    const accountInstance = {
      get: () => ({
        id_account: 7,
        email: 'noroles@example.com',
        auth_provider: 'local',
        email_verified: false,
        is_active: true,
      }),
    };

    const result = toAccount(accountInstance);

    expect(result.roles).toBeUndefined();
  });

  it('no incluye userProfile si no está presente', () => {
    const accountInstance = {
      get: () => ({
        id_account: 8,
        email: 'noprofile@example.com',
        auth_provider: 'local',
        email_verified: false,
        is_active: true,
      }),
    };

    const result = toAccount(accountInstance);

    expect(result.userProfile).toBeUndefined();
  });

  it('no incluye adminProfile si no está presente', () => {
    const accountInstance = {
      get: () => ({
        id_account: 9,
        email: 'noadmin@example.com',
        auth_provider: 'local',
        email_verified: false,
        is_active: true,
      }),
    };

    const result = toAccount(accountInstance);

    expect(result.adminProfile).toBeUndefined();
  });

  it('transforma una cuenta con todos los perfiles (user y admin)', () => {
    const accountInstance = {
      get: () => ({
        id_account: 10,
        email: 'both@example.com',
        password_hash: 'hashed',
        auth_provider: 'local',
        google_id: null,
        email_verified: true,
        is_active: true,
        last_login: '2024-01-15T10:00:00.000Z',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
        roles: [
          { get: () => ({ id_role: 1, role_name: 'USER' }) },
          { get: () => ({ id_role: 3, role_name: 'ADMIN' }) },
        ],
        userProfile: {
          get: () => ({
            id_user_profile: 20,
            id_account: 10,
            name: 'Jane',
            lastname: 'Admin',
            subscription: 'FREE',
          }),
        },
        adminProfile: {
          get: () => ({
            id_admin_profile: 15,
            id_account: 10,
            department: 'IT',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          }),
        },
      }),
    };

    const result = toAccount(accountInstance);

    expect(result.id_account).toBe(10);
    expect(result.roles).toHaveLength(2);
    expect(result.userProfile).toBeDefined();
    expect(result.userProfile.id_user_profile).toBe(20);
    expect(result.adminProfile).toBeDefined();
    expect(result.adminProfile.id_admin_profile).toBe(15);
  });
});
