jest.mock('../models', () => ({
  Account: {
    count: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn()
  },
  UserProfile: {
    count: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn()
  },
  AdminProfile: { count: jest.fn() },
  Role: {},
  AccountRole: {},
  TokenLedger: {
    findAndCountAll: jest.fn()
  }
}));

jest.mock('../models/RefreshToken', () => ({
  update: jest.fn()
}));

jest.mock('../config/database', () => ({
  query: jest.fn()
}));

const adminService = require('../services/admin-service');
const { Account, UserProfile, AdminProfile, TokenLedger } = require('../models');
const RefreshToken = require('../models/RefreshToken');
const sequelize = require('../config/database');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('admin-service', () => {
  describe('obtenerEstadisticas', () => {
    it('retorna estadísticas del sistema', async () => {
      // Mock queries
      sequelize.query
        .mockResolvedValueOnce([[{ subscription: 'FREE', count: 100 }]]) // subscription stats
        .mockResolvedValueOnce([[{ role_name: 'USER', count: 90 }]]) // role stats
        .mockResolvedValueOnce([[{ total_tokens: 5000 }]]); // tokens

      Account.count.mockResolvedValue(100);
      AdminProfile.count.mockResolvedValue(5);
      UserProfile.count.mockResolvedValue(15);

      const stats = await adminService.obtenerEstadisticas();

      expect(stats).toHaveProperty('users');
      expect(stats).toHaveProperty('admins');
      expect(stats).toHaveProperty('roles');
      expect(stats).toHaveProperty('tokens');
      expect(stats.users.total).toBe(100);
      expect(stats.admins.total).toBe(5);
      expect(stats.tokens.total_in_circulation).toBe(5000);
    });
  });

  describe('listarUsuarios', () => {
    it('lista usuarios con paginación', async () => {
      const mockUsers = [
        {
          id_user_profile: 1,
          id_account: 1,
          name: 'Juan',
          lastname: 'Pérez',
          subscription: 'FREE',
          tokens: 100,
          created_at: new Date(),
          account: {
            id_account: 1,
            email: 'juan@example.com',
            auth_provider: 'local',
            is_active: true,
            last_login: new Date()
          }
        }
      ];

      UserProfile.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockUsers
      });

      const result = await adminService.listarUsuarios({ page: 1, limit: 20 });

      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('pagination');
      expect(result.users).toHaveLength(1);
      expect(result.users[0].email).toBe('juan@example.com');
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
    });

    it('filtra por suscripción', async () => {
      UserProfile.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      });

      await adminService.listarUsuarios({ subscription: 'PREMIUM' });

      expect(UserProfile.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ subscription: 'PREMIUM' })
        })
      );
    });

    it('limita el número de resultados a 100 máximo', async () => {
      UserProfile.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      });

      await adminService.listarUsuarios({ limit: 200 });

      expect(UserProfile.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 100
        })
      );
    });
  });

  describe('buscarUsuarioPorEmail', () => {
    it('encuentra usuario por email', async () => {
      const mockAccount = {
        id_account: 1,
        email: 'test@example.com',
        auth_provider: 'local',
        is_active: true,
        email_verified: true,
        last_login: new Date(),
        userProfile: {
          id_user_profile: 1,
          name: 'Test',
          lastname: 'User',
          subscription: 'FREE',
          tokens: 50
        },
        adminProfile: null,
        roles: [{ role_name: 'USER' }]
      };

      Account.findOne.mockResolvedValue(mockAccount);

      const result = await adminService.buscarUsuarioPorEmail('test@example.com');

      expect(result.email).toBe('test@example.com');
      expect(result.profile.name).toBe('Test');
      expect(result.roles).toContain('USER');
    });

    it('lanza error si usuario no existe', async () => {
      Account.findOne.mockResolvedValue(null);

      await expect(adminService.buscarUsuarioPorEmail('noexiste@example.com'))
        .rejects.toThrow('Usuario no encontrado');
    });
  });

  describe('desactivarCuenta', () => {
    it('desactiva cuenta y revoca tokens', async () => {
      const mockAccount = {
        id_account: 1,
        is_active: true,
        update: jest.fn().mockResolvedValue(true)
      };

      const mockUserProfile = {
        id_account: 1,
        id_user_profile: 1
      };

      Account.findByPk.mockResolvedValue(mockAccount);
      UserProfile.findOne.mockResolvedValue(mockUserProfile);
      RefreshToken.update.mockResolvedValue([1]);

      await adminService.desactivarCuenta(1);

      expect(mockAccount.update).toHaveBeenCalledWith({ is_active: false });
      expect(RefreshToken.update).toHaveBeenCalledWith(
        { is_revoked: true },
        { where: { id_user: 1 } }
      );
    });

    it('lanza error si cuenta no existe', async () => {
      Account.findByPk.mockResolvedValue(null);

      await expect(adminService.desactivarCuenta(999))
        .rejects.toThrow('Cuenta no encontrada');
    });

    it('lanza error si cuenta ya está desactivada', async () => {
      Account.findByPk.mockResolvedValue({
        id_account: 1,
        is_active: false
      });

      await expect(adminService.desactivarCuenta(1))
        .rejects.toThrow('La cuenta ya está desactivada');
    });
  });

  describe('activarCuenta', () => {
    it('activa cuenta desactivada', async () => {
      const mockAccount = {
        id_account: 1,
        is_active: false,
        update: jest.fn().mockResolvedValue(true)
      };

      Account.findByPk.mockResolvedValue(mockAccount);

      await adminService.activarCuenta(1);

      expect(mockAccount.update).toHaveBeenCalledWith({ is_active: true });
    });

    it('lanza error si cuenta no existe', async () => {
      Account.findByPk.mockResolvedValue(null);

      await expect(adminService.activarCuenta(999))
        .rejects.toThrow('Cuenta no encontrada');
    });

    it('lanza error si cuenta ya está activa', async () => {
      Account.findByPk.mockResolvedValue({
        id_account: 1,
        is_active: true
      });

      await expect(adminService.activarCuenta(1))
        .rejects.toThrow('La cuenta ya está activa');
    });
  });

  describe('obtenerActividadReciente', () => {
    it('retorna usuarios nuevos y logins recientes', async () => {
      const mockNewUsers = [{
        id_user_profile: 1,
        name: 'Nuevo',
        lastname: 'Usuario',
        created_at: new Date(),
        account: { email: 'nuevo@example.com' }
      }];

      const mockLogins = [{
        email: 'user@example.com',
        last_login: new Date(),
        userProfile: { name: 'Test', lastname: 'User' },
        adminProfile: null
      }];

      UserProfile.findAll.mockResolvedValue(mockNewUsers);
      Account.findAll.mockResolvedValue(mockLogins);

      const result = await adminService.obtenerActividadReciente(7);

      expect(result).toHaveProperty('new_users');
      expect(result).toHaveProperty('recent_logins');
      expect(result.new_users).toHaveLength(1);
      expect(result.recent_logins).toHaveLength(1);
    });
  });

  describe('obtenerTransacciones', () => {
    it('retorna transacciones con paginación', async () => {
      const mockTransactions = [{
        id_ledger: 1,
        id_user_profile: 1,
        delta: 10,
        reason: 'ATTENDANCE',
        ref_type: 'assistance',
        ref_id: 1,
        balance_after: 110,
        created_at: new Date(),
        userProfile: {
          name: 'Test',
          lastname: 'User',
          account: { email: 'test@example.com' }
        }
      }];

      TokenLedger.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockTransactions
      });

      const result = await adminService.obtenerTransacciones(null, { page: 1, limit: 50 });

      expect(result).toHaveProperty('transactions');
      expect(result).toHaveProperty('pagination');
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].delta).toBe(10);
    });

    it('filtra por id_user_profile cuando se proporciona', async () => {
      TokenLedger.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      });

      await adminService.obtenerTransacciones(123);

      expect(TokenLedger.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id_user_profile: 123 }
        })
      );
    });
  });
});
