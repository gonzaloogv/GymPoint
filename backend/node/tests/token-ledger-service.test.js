jest.mock('../models', () => ({
  TokenLedger: {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn()
  },
  UserProfile: {
    findByPk: jest.fn()
  }
}));

jest.mock('../config/database', () => ({
  transaction: jest.fn()
}));

const tokenLedgerService = require('../services/token-ledger-service');
const { TokenLedger, UserProfile } = require('../models');
const sequelize = require('../config/database');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Token Ledger Service', () => {
  describe('registrarMovimiento', () => {
    it('debe agregar tokens correctamente', async () => {
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn()
      };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const mockUser = {
        tokens: 100,
        update: jest.fn().mockResolvedValue(true)
      };
      UserProfile.findByPk.mockResolvedValue(mockUser);

      const mockLedgerEntry = {
        id_ledger: 1,
        id_user_profile: 1,
        delta: 50,
        reason: 'TEST_GAIN',
        balance_after: 150
      };
      TokenLedger.create.mockResolvedValue(mockLedgerEntry);

      const result = await tokenLedgerService.registrarMovimiento({
        userId: 1,
        delta: 50,
        reason: 'TEST_GAIN'
      });

      expect(result.newBalance).toBe(150);
      expect(result.previousBalance).toBe(100);
      expect(mockUser.update).toHaveBeenCalledWith(
        { tokens: 150 },
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('debe restar tokens correctamente', async () => {
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn()
      };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const mockUser = {
        tokens: 100,
        update: jest.fn().mockResolvedValue(true)
      };
      UserProfile.findByPk.mockResolvedValue(mockUser);

      TokenLedger.create.mockResolvedValue({
        id_ledger: 2,
        delta: -30,
        balance_after: 70
      });

      const result = await tokenLedgerService.registrarMovimiento({
        userId: 1,
        delta: -30,
        reason: 'TEST_SPEND'
      });

      expect(result.newBalance).toBe(70);
      expect(result.previousBalance).toBe(100);
    });

    it('debe fallar si saldo quedaría negativo', async () => {
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn()
      };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const mockUser = {
        tokens: 50,
        update: jest.fn()
      };
      UserProfile.findByPk.mockResolvedValue(mockUser);

      await expect(
        tokenLedgerService.registrarMovimiento({
          userId: 1,
          delta: -100,
          reason: 'TEST_OVERSPEND'
        })
      ).rejects.toThrow('Saldo insuficiente');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockUser.update).not.toHaveBeenCalled();
    });

    it('debe fallar si usuario no existe', async () => {
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn()
      };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      UserProfile.findByPk.mockResolvedValue(null);

      await expect(
        tokenLedgerService.registrarMovimiento({
          userId: 999,
          delta: 10,
          reason: 'TEST'
        })
      ).rejects.toThrow('UserProfile 999 no encontrado');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('debe crear registro en ledger con referencias', async () => {
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn()
      };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const mockUser = {
        tokens: 100,
        update: jest.fn().mockResolvedValue(true)
      };
      UserProfile.findByPk.mockResolvedValue(mockUser);

      const mockLedgerEntry = {
        id_ledger: 3,
        delta: 10,
        ref_type: 'test_ref',
        ref_id: 123
      };
      TokenLedger.create.mockResolvedValue(mockLedgerEntry);

      await tokenLedgerService.registrarMovimiento({
        userId: 1,
        delta: 10,
        reason: 'TEST',
        refType: 'test_ref',
        refId: 123
      });

      expect(TokenLedger.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ref_type: 'test_ref',
          ref_id: 123
        }),
        expect.any(Object)
      );
    });

    it('debe usar transacción externa si se proporciona', async () => {
      const externalTransaction = {
        commit: jest.fn(),
        rollback: jest.fn()
      };

      const mockUser = {
        tokens: 100,
        update: jest.fn().mockResolvedValue(true)
      };
      UserProfile.findByPk.mockResolvedValue(mockUser);

      TokenLedger.create.mockResolvedValue({
        id_ledger: 4,
        delta: 20,
        balance_after: 120
      });

      await tokenLedgerService.registrarMovimiento({
        userId: 1,
        delta: 20,
        reason: 'TEST',
        transaction: externalTransaction
      });

      expect(externalTransaction.commit).not.toHaveBeenCalled();
      expect(sequelize.transaction).not.toHaveBeenCalled();
    });
  });

  describe('obtenerHistorial', () => {
    it('debe retornar historial ordenado por fecha', async () => {
      const mockHistory = [
        { id_ledger: 2, delta: 10, created_at: '2025-10-07' },
        { id_ledger: 1, delta: 5, created_at: '2025-10-06' }
      ];
      TokenLedger.findAll.mockResolvedValue(mockHistory);

      const result = await tokenLedgerService.obtenerHistorial(1);

      expect(TokenLedger.findAll).toHaveBeenCalledWith({
        where: { id_user_profile: 1 },
        order: [['created_at', 'DESC']],
        limit: 50,
        offset: 0
      });
      expect(result).toEqual(mockHistory);
    });

    it('debe respetar limit y offset', async () => {
      TokenLedger.findAll.mockResolvedValue([]);

      await tokenLedgerService.obtenerHistorial(1, { limit: 10, offset: 20 });

      expect(TokenLedger.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 20
        })
      );
    });
  });

  describe('obtenerBalance', () => {
    it('debe retornar el balance actual', async () => {
      UserProfile.findByPk.mockResolvedValue({ tokens: 150 });

      const balance = await tokenLedgerService.obtenerBalance(1);

      expect(balance).toBe(150);
      expect(UserProfile.findByPk).toHaveBeenCalledWith(1, {
        attributes: ['tokens']
      });
    });

    it('debe retornar 0 si usuario no existe', async () => {
      UserProfile.findByPk.mockResolvedValue(null);

      const balance = await tokenLedgerService.obtenerBalance(999);

      expect(balance).toBe(0);
    });
  });

  describe('existeMovimiento', () => {
    it('debe detectar movimientos duplicados', async () => {
      TokenLedger.findOne.mockResolvedValue({
        id_ledger: 1,
        ref_type: 'unique_type',
        ref_id: 999
      });

      const exists = await tokenLedgerService.existeMovimiento('unique_type', 999);

      expect(exists).toBe(true);
      expect(TokenLedger.findOne).toHaveBeenCalledWith({
        where: {
          ref_type: 'unique_type',
          ref_id: 999
        }
      });
    });

    it('debe retornar false si no existe', async () => {
      TokenLedger.findOne.mockResolvedValue(null);

      const exists = await tokenLedgerService.existeMovimiento('unique_type', 888);

      expect(exists).toBe(false);
    });
  });

  describe('obtenerEstadisticas', () => {
    it('debe calcular estadísticas correctamente', async () => {
      TokenLedger.findOne.mockResolvedValue({
        total_ganado: 200,
        total_gastado: 80,
        total_movimientos: 15
      });

      UserProfile.findByPk.mockResolvedValue({ tokens: 120 });

      const stats = await tokenLedgerService.obtenerEstadisticas(1);

      expect(stats).toEqual({
        balance_actual: 120,
        total_ganado: 200,
        total_gastado: 80,
        total_movimientos: 15
      });
    });

    it('debe manejar caso sin movimientos', async () => {
      TokenLedger.findOne.mockResolvedValue(null);
      UserProfile.findByPk.mockResolvedValue({ tokens: 0 });

      const stats = await tokenLedgerService.obtenerEstadisticas(1);

      expect(stats).toEqual({
        balance_actual: 0,
        total_ganado: 0,
        total_gastado: 0,
        total_movimientos: 0
      });
    });
  });
});
