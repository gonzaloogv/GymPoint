/**
 * Tests para gym-request-service - Query Operations
 * Cubre: getAllRequests, getRequestById
 */

const { mockGymRequest, gymRequestService } = require('./test-setup');

describe('gym-request-service queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRequests', () => {
    it('obtiene todas las solicitudes sin filtro de estado', async () => {
      const mockRequests = [
        {
          id_gym_request: 1,
          name: 'Gym Alpha',
          status: 'pending',
          created_at: new Date('2025-01-20'),
        },
        {
          id_gym_request: 2,
          name: 'Gym Beta',
          status: 'approved',
          created_at: new Date('2025-01-21'),
        },
      ];

      mockGymRequest.findAll.mockResolvedValue(mockRequests);

      const result = await gymRequestService.getAllRequests();

      expect(mockGymRequest.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['created_at', 'DESC']],
      });
      expect(result).toEqual(mockRequests);
    });

    it('filtra solicitudes por status=pending', async () => {
      const mockRequests = [
        {
          id_gym_request: 1,
          name: 'Gym Alpha',
          status: 'pending',
        },
      ];

      mockGymRequest.findAll.mockResolvedValue(mockRequests);

      const result = await gymRequestService.getAllRequests('pending');

      expect(mockGymRequest.findAll).toHaveBeenCalledWith({
        where: { status: 'pending' },
        order: [['created_at', 'DESC']],
      });
      expect(result).toEqual(mockRequests);
    });

    it('filtra solicitudes por status=approved', async () => {
      const mockRequests = [
        {
          id_gym_request: 2,
          name: 'Gym Beta',
          status: 'approved',
        },
      ];

      mockGymRequest.findAll.mockResolvedValue(mockRequests);

      const result = await gymRequestService.getAllRequests('approved');

      expect(mockGymRequest.findAll).toHaveBeenCalledWith({
        where: { status: 'approved' },
        order: [['created_at', 'DESC']],
      });
      expect(result).toEqual(mockRequests);
    });

    it('filtra solicitudes por status=rejected', async () => {
      mockGymRequest.findAll.mockResolvedValue([]);

      await gymRequestService.getAllRequests('rejected');

      expect(mockGymRequest.findAll).toHaveBeenCalledWith({
        where: { status: 'rejected' },
        order: [['created_at', 'DESC']],
      });
    });

    it('ignora status inválido y retorna todas las solicitudes', async () => {
      const mockRequests = [{ id_gym_request: 1 }, { id_gym_request: 2 }];

      mockGymRequest.findAll.mockResolvedValue(mockRequests);

      const result = await gymRequestService.getAllRequests('invalid_status');

      expect(mockGymRequest.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['created_at', 'DESC']],
      });
      expect(result).toEqual(mockRequests);
    });

    it('retorna lista vacía si no hay solicitudes', async () => {
      mockGymRequest.findAll.mockResolvedValue([]);

      const result = await gymRequestService.getAllRequests();

      expect(result).toEqual([]);
    });

    it('ordena por created_at descendente', async () => {
      mockGymRequest.findAll.mockResolvedValue([]);

      await gymRequestService.getAllRequests();

      const callArgs = mockGymRequest.findAll.mock.calls[0][0];
      expect(callArgs.order).toEqual([['created_at', 'DESC']]);
    });
  });

  describe('getRequestById', () => {
    it('obtiene solicitud por ID exitosamente', async () => {
      const mockRequest = {
        id_gym_request: 1,
        name: 'Gym Alpha',
        city: 'Buenos Aires',
        status: 'pending',
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);

      const result = await gymRequestService.getRequestById(1);

      expect(mockGymRequest.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockRequest);
    });

    it('retorna null si solicitud no existe', async () => {
      mockGymRequest.findByPk.mockResolvedValue(null);

      const result = await gymRequestService.getRequestById(999);

      expect(mockGymRequest.findByPk).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    it('maneja IDs numéricos correctamente', async () => {
      const mockRequest = { id_gym_request: 42 };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);

      await gymRequestService.getRequestById(42);

      expect(mockGymRequest.findByPk).toHaveBeenCalledWith(42);
    });
  });
});
