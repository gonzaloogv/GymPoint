/**
 * Gym Payment Service Tests - Lote 4
 * Tests for refactored service using Commands/Queries/Repositories
 */

jest.mock('../infra/db/repositories', () => ({
  gymPaymentRepository: {
    findPaymentById: jest.fn(),
    createPayment: jest.fn(),
    updatePayment: jest.fn(),
    deletePayment: jest.fn(),
    findPaymentsByUserId: jest.fn(),
    findPaymentsByGymId: jest.fn(),
    getGymTotalRevenue: jest.fn(),
    countPendingPaymentsByUserAndGym: jest.fn(),
  },
  gymRepository: {
    findGymById: jest.fn(),
  },
  userProfileRepository: {
    findProfileById: jest.fn(),
  },
}));

jest.mock('../config/database', () => ({
  transaction: jest.fn(),
}));

const service = require('../services/gym-payment-service');
const {
  gymPaymentRepository,
  gymRepository,
  userProfileRepository,
} = require('../infra/db/repositories');
const sequelize = require('../config/database');

const createTransactionMock = () => ({
  commit: jest.fn(),
  rollback: jest.fn(),
});

let transactions;

beforeEach(() => {
  jest.clearAllMocks();
  transactions = [];
  sequelize.transaction.mockImplementation(async (arg) => {
    const tx = createTransactionMock();
    transactions.push(tx);
    if (typeof arg === 'function') {
      return arg(tx);
    }
    return tx;
  });
});

describe('createGymPayment', () => {
  it('creates payment when valid', async () => {
    gymRepository.findGymById.mockResolvedValue({ id_gym: 1 });
    userProfileRepository.findProfileById.mockResolvedValue({ id_user_profile: 2 });

    const createdPayment = {
      id_payment: 1,
      id_user_profile: 2,
      id_gym: 1,
      amount: 100,
      payment_method: 'CASH',
      status: 'COMPLETED',
    };
    gymPaymentRepository.createPayment.mockResolvedValue(createdPayment);

    const command = {
      userId: 2,
      gymId: 1,
      amount: 100,
      payment_method: 'CASH',
      payment_date: '2025-12-01',
      status: 'COMPLETED',
    };

    const result = await service.createGymPayment(command);

    expect(gymPaymentRepository.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        id_user_profile: 2,
        id_gym: 1,
        amount: 100,
        payment_method: 'CASH',
      }),
      { transaction: expect.any(Object) }
    );
    expect(result).toEqual(createdPayment);
    expect(transactions[0].commit).toHaveBeenCalled();
  });

  it('throws ValidationError when amount <= 0', async () => {
    gymRepository.findGymById.mockResolvedValue({ id_gym: 1 });
    userProfileRepository.findProfileById.mockResolvedValue({ id_user_profile: 2 });

    const command = {
      userId: 2,
      gymId: 1,
      amount: -10,
      payment_method: 'CASH',
      payment_date: '2025-12-01',
    };

    await expect(service.createGymPayment(command)).rejects.toThrow('El monto debe ser mayor a 0');
    expect(transactions[0].rollback).toHaveBeenCalled();
  });

  it('throws NotFoundError when gym not found', async () => {
    gymRepository.findGymById.mockResolvedValue(null);

    const command = {
      userId: 2,
      gymId: 999,
      amount: 100,
      payment_method: 'CASH',
    };

    await expect(service.createGymPayment(command)).rejects.toThrow('Gimnasio no encontrado');
  });
});

describe('getUserPayments', () => {
  it('returns paginated payments for user', async () => {
    const mockResult = {
      items: [
        { id_payment: 1, amount: 100, status: 'COMPLETED' },
        { id_payment: 2, amount: 50, status: 'PENDING' },
      ],
      total: 2,
      page: 1,
      limit: 20,
    };
    gymPaymentRepository.findPaymentsByUserId.mockResolvedValue(mockResult);

    const query = {
      userId: 2,
      page: 1,
      limit: 20,
    };

    const result = await service.getUserPayments(query);

    expect(gymPaymentRepository.findPaymentsByUserId).toHaveBeenCalledWith({
      userId: 2,
      filters: {},
      pagination: { page: 1, limit: 20 },
      sort: { sortBy: 'payment_date', order: 'DESC' },
    });
    expect(result).toEqual(mockResult);
  });
});

describe('updateGymPayment', () => {
  it('updates payment', async () => {
    const existingPayment = { id_payment: 1, amount: 100, status: 'PENDING' };
    const updatedPayment = { ...existingPayment, status: 'COMPLETED' };

    gymPaymentRepository.findPaymentById.mockResolvedValue(existingPayment);
    gymPaymentRepository.updatePayment.mockResolvedValue(updatedPayment);

    const command = {
      paymentId: 1,
      status: 'COMPLETED',
      updatedBy: 10,
    };

    const result = await service.updateGymPayment(command);

    expect(gymPaymentRepository.updatePayment).toHaveBeenCalledWith(
      1,
      { status: 'COMPLETED' },
      { transaction: expect.any(Object) }
    );
    expect(result).toEqual(updatedPayment);
    expect(transactions[0].commit).toHaveBeenCalled();
  });
});

describe('getGymTotalRevenue', () => {
  it('returns revenue stats', async () => {
    gymRepository.findGymById.mockResolvedValue({ id_gym: 1 });

    const revenueStats = {
      total_revenue: 5000,
      total_payments: 50,
    };
    gymPaymentRepository.getGymTotalRevenue.mockResolvedValue(revenueStats);

    const query = {
      gymId: 1,
      status: 'COMPLETED',
    };

    const result = await service.getGymTotalRevenue(query);

    expect(gymPaymentRepository.getGymTotalRevenue).toHaveBeenCalledWith(1, {
      status: 'COMPLETED',
    });
    expect(result).toEqual(revenueStats);
  });
});

describe('countPendingPayments', () => {
  it('returns count of pending payments', async () => {
    gymPaymentRepository.countPendingPaymentsByUserAndGym.mockResolvedValue(3);

    const query = {
      userId: 2,
      gymId: 1,
    };

    const result = await service.countPendingPayments(query);

    expect(gymPaymentRepository.countPendingPaymentsByUserAndGym).toHaveBeenCalledWith(2, 1);
    expect(result).toBe(3);
  });
});
