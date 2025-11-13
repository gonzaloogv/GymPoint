/**
 * Gym Payment Controller Tests - Lote 4
 * Tests for refactored controller using DTOs/Mappers/Commands/Queries
 */

jest.mock('../services/gym-payment-service');
jest.mock('../services/mappers', () => ({
  gymPaymentMappers: {
    toGetUserPaymentsQuery: jest.fn(),
    toGetGymPaymentsQuery: jest.fn(),
    toGetGymPaymentQuery: jest.fn(),
    toGymPaymentDTO: jest.fn(),
    toPaginatedGymPaymentsDTO: jest.fn(),
    toCreateGymPaymentCommand: jest.fn(),
    toUpdateGymPaymentCommand: jest.fn(),
    toDeleteGymPaymentCommand: jest.fn(),
    toGetGymTotalRevenueQuery: jest.fn(),
    toGymRevenueDTO: jest.fn(),
    toCountPendingPaymentsQuery: jest.fn(),
  },
}));

const controller = require('../controllers/gym-payment-controller');
const service = require('../services/gym-payment-service');
const { gymPaymentMappers } = require('../services/mappers');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getUserPayments', () => {
  it('returns paginated payments', async () => {
    const req = {
      params: { userId: '2' },
      query: { page: '1', limit: '20' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const mockQuery = { userId: 2, page: 1, limit: 20 };
    const mockResult = { items: [], total: 0, page: 1, limit: 20 };
    const mockDTO = mockResult;

    gymPaymentMappers.toGetUserPaymentsQuery.mockReturnValue(mockQuery);
    service.getUserPayments.mockResolvedValue(mockResult);
    gymPaymentMappers.toPaginatedGymPaymentsDTO.mockReturnValue(mockDTO);

    await controller.getUserPayments(req, res);

    expect(service.getUserPayments).toHaveBeenCalledWith(mockQuery);
    expect(res.json).toHaveBeenCalledWith(mockDTO);
  });
});

describe('createGymPayment', () => {
  it('creates payment', async () => {
    const req = {
      params: { gymId: '1' },
      body: { amount: 100, payment_method: 'CASH' },
      account: { userProfile: { id_user_profile: 2 } },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const mockCommand = { gymId: 1, userId: 2, amount: 100 };
    const mockPayment = { id_payment: 1, amount: 100 };

    gymPaymentMappers.toCreateGymPaymentCommand.mockReturnValue(mockCommand);
    service.createGymPayment.mockResolvedValue(mockPayment);
    gymPaymentMappers.toGymPaymentDTO.mockReturnValue(mockPayment);

    await controller.createGymPayment(req, res);

    expect(service.createGymPayment).toHaveBeenCalledWith(mockCommand);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockPayment);
  });

  it('returns 403 when no user authenticated', async () => {
    const req = {
      params: { gymId: '1' },
      body: {},
      account: null,
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.createGymPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('getGymTotalRevenue', () => {
  it('returns revenue stats', async () => {
    const req = {
      params: { gymId: '1' },
      query: { status: 'COMPLETED' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const mockQuery = { gymId: 1, status: 'COMPLETED' };
    const mockRevenue = { total_revenue: 5000 };

    gymPaymentMappers.toGetGymTotalRevenueQuery.mockReturnValue(mockQuery);
    service.getGymTotalRevenue.mockResolvedValue(mockRevenue);
    gymPaymentMappers.toGymRevenueDTO.mockReturnValue(mockRevenue);

    await controller.getGymTotalRevenue(req, res);

    expect(service.getGymTotalRevenue).toHaveBeenCalledWith(mockQuery);
    expect(res.json).toHaveBeenCalledWith(mockRevenue);
  });
});

// Legacy compatibility tests
describe('legacy function names', () => {
  it('registrarPago points to createGymPayment', () => {
    expect(controller.registrarPago).toBe(controller.createGymPayment);
  });

  it('obtenerPagosPorUsuario points to getUserPayments', () => {
    expect(controller.obtenerPagosPorUsuario).toBe(controller.getUserPayments);
  });

  it('obtenerPagosPorGimnasio points to getGymPayments', () => {
    expect(controller.obtenerPagosPorGimnasio).toBe(controller.getGymPayments);
  });

  it('actualizarEstadoPago points to updateGymPayment', () => {
    expect(controller.actualizarEstadoPago).toBe(controller.updateGymPayment);
  });
});
