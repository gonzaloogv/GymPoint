/**
 * Tests para gym-request-service - Command Operations
 * Cubre: createRequest, rejectRequest, deleteRequest
 */

const {
  mockGymRequest,
  mockAppEvents,
  mockEVENTS,
  mockErrors,
  gymRequestService,
} = require('./test-setup');

describe('gym-request-service commands', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRequest', () => {
    it('crea solicitud con todos los campos requeridos', async () => {
      const requestData = {
        name: 'Gym Alpha',
        city: 'Buenos Aires',
        address: 'Calle Falsa 123',
        email: 'contact@gymalpha.com',
        phone: '+541112345678',
        description: 'Gym moderno con equipamiento de última generación',
        latitude: -34.6037,
        longitude: -58.3816,
      };

      const mockCreated = {
        id_gym_request: 1,
        ...requestData,
        status: 'pending',
        toJSON: jest.fn().mockReturnValue({ id_gym_request: 1, ...requestData }),
      };

      mockGymRequest.create.mockResolvedValue(mockCreated);

      const result = await gymRequestService.createRequest(requestData);

      expect(mockGymRequest.create).toHaveBeenCalledWith({
        name: 'Gym Alpha',
        description: 'Gym moderno con equipamiento de última generación',
        city: 'Buenos Aires',
        address: 'Calle Falsa 123',
        latitude: -34.6037,
        longitude: -58.3816,
        phone: '+541112345678',
        email: 'contact@gymalpha.com',
        website: undefined,
        instagram: undefined,
        facebook: undefined,
        photos: [],
        equipment: {},
        services: [],
        rules: [],
        monthly_price: undefined,
        weekly_price: undefined,
        daily_price: undefined,
        schedule: [],
        trial_allowed: false,
        amenities: [],
        status: 'pending',
      });

      expect(result).toEqual(mockCreated);
    });

    it('emite evento GYM_REQUEST_CREATED después de crear', async () => {
      const requestData = {
        name: 'Gym Beta',
        city: 'Córdoba',
        address: 'Av. Principal 456',
        email: 'info@gymbeta.com',
      };

      const mockCreated = {
        id_gym_request: 2,
        ...requestData,
        toJSON: jest.fn().mockReturnValue({ id_gym_request: 2 }),
      };

      mockGymRequest.create.mockResolvedValue(mockCreated);

      await gymRequestService.createRequest(requestData);

      expect(mockAppEvents.emit).toHaveBeenCalledWith(mockEVENTS.GYM_REQUEST_CREATED, {
        gymRequest: { id_gym_request: 2 },
        timestamp: expect.any(Date),
      });
    });

    it('normaliza trial_allowed a false por defecto', async () => {
      const requestData = {
        name: 'Gym Gamma',
        city: 'Rosario',
        address: 'Calle 789',
        email: 'contact@gymgamma.com',
      };

      mockGymRequest.create.mockResolvedValue({ id_gym_request: 3, toJSON: jest.fn() });

      await gymRequestService.createRequest(requestData);

      const createCall = mockGymRequest.create.mock.calls[0][0];
      expect(createCall.trial_allowed).toBe(false);
    });

    it('normaliza trial_allowed=true cuando se envía "true"', async () => {
      const requestData = {
        name: 'Gym Delta',
        city: 'Mendoza',
        address: 'Av. Test 999',
        email: 'test@gymdelta.com',
        trial_allowed: 'true',
      };

      mockGymRequest.create.mockResolvedValue({ id_gym_request: 4, toJSON: jest.fn() });

      await gymRequestService.createRequest(requestData);

      const createCall = mockGymRequest.create.mock.calls[0][0];
      expect(createCall.trial_allowed).toBe(true);
    });

    it('normaliza trial_allowed=true cuando se envía "1"', async () => {
      const requestData = {
        name: 'Gym Epsilon',
        city: 'Salta',
        address: 'Calle 111',
        phone: '+541199998888',
        trial_allowed: '1',
      };

      mockGymRequest.create.mockResolvedValue({ id_gym_request: 5, toJSON: jest.fn() });

      await gymRequestService.createRequest(requestData);

      const createCall = mockGymRequest.create.mock.calls[0][0];
      expect(createCall.trial_allowed).toBe(true);
    });

    it('limita photos a máximo 1 elemento', async () => {
      const requestData = {
        name: 'Gym Zeta',
        city: 'Tucumán',
        address: 'Av. Photos 222',
        email: 'photos@gymzeta.com',
        photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
      };

      mockGymRequest.create.mockResolvedValue({ id_gym_request: 6, toJSON: jest.fn() });

      await gymRequestService.createRequest(requestData);

      const createCall = mockGymRequest.create.mock.calls[0][0];
      expect(createCall.photos).toEqual(['photo1.jpg']);
    });

    it('acepta arrays vacíos para equipment, services, rules', async () => {
      const requestData = {
        name: 'Gym Eta',
        city: 'Neuquén',
        address: 'Calle Empty 333',
        email: 'empty@gymeta.com',
        equipment: {},
        services: [],
        rules: [],
      };

      mockGymRequest.create.mockResolvedValue({ id_gym_request: 7, toJSON: jest.fn() });

      await gymRequestService.createRequest(requestData);

      const createCall = mockGymRequest.create.mock.calls[0][0];
      expect(createCall.equipment).toEqual({});
      expect(createCall.services).toEqual([]);
      expect(createCall.rules).toEqual([]);
    });

    it('lanza ValidationError si falta nombre', async () => {
      const requestData = {
        city: 'Buenos Aires',
        address: 'Calle 123',
        email: 'test@gym.com',
      };

      await expect(gymRequestService.createRequest(requestData)).rejects.toThrow(
        mockErrors.ValidationError
      );
      await expect(gymRequestService.createRequest(requestData)).rejects.toThrow(
        'Nombre, ciudad y dirección son campos obligatorios'
      );
    });

    it('lanza ValidationError si falta ciudad', async () => {
      const requestData = {
        name: 'Gym Test',
        address: 'Calle 123',
        email: 'test@gym.com',
      };

      await expect(gymRequestService.createRequest(requestData)).rejects.toThrow(
        mockErrors.ValidationError
      );
      await expect(gymRequestService.createRequest(requestData)).rejects.toThrow(
        'Nombre, ciudad y dirección son campos obligatorios'
      );
    });

    it('lanza ValidationError si falta dirección', async () => {
      const requestData = {
        name: 'Gym Test',
        city: 'Buenos Aires',
        email: 'test@gym.com',
      };

      await expect(gymRequestService.createRequest(requestData)).rejects.toThrow(
        mockErrors.ValidationError
      );
      await expect(gymRequestService.createRequest(requestData)).rejects.toThrow(
        'Nombre, ciudad y dirección son campos obligatorios'
      );
    });

    it('lanza ValidationError si falta email y phone', async () => {
      const requestData = {
        name: 'Gym Test',
        city: 'Buenos Aires',
        address: 'Calle 123',
      };

      await expect(gymRequestService.createRequest(requestData)).rejects.toThrow(
        mockErrors.ValidationError
      );
      await expect(gymRequestService.createRequest(requestData)).rejects.toThrow(
        'Debe proporcionar al menos un email o teléfono de contacto'
      );
    });

    it('acepta solo email sin phone', async () => {
      const requestData = {
        name: 'Gym Only Email',
        city: 'Buenos Aires',
        address: 'Calle 456',
        email: 'onlyemail@gym.com',
      };

      mockGymRequest.create.mockResolvedValue({ id_gym_request: 8, toJSON: jest.fn() });

      await gymRequestService.createRequest(requestData);

      expect(mockGymRequest.create).toHaveBeenCalled();
    });

    it('acepta solo phone sin email', async () => {
      const requestData = {
        name: 'Gym Only Phone',
        city: 'Buenos Aires',
        address: 'Calle 789',
        phone: '+541112345678',
      };

      mockGymRequest.create.mockResolvedValue({ id_gym_request: 9, toJSON: jest.fn() });

      await gymRequestService.createRequest(requestData);

      expect(mockGymRequest.create).toHaveBeenCalled();
    });

    it('incluye datos opcionales de redes sociales', async () => {
      const requestData = {
        name: 'Gym Social',
        city: 'Buenos Aires',
        address: 'Calle 999',
        email: 'social@gym.com',
        website: 'https://gymsocial.com',
        instagram: '@gymsocial',
        facebook: 'gymsocial',
      };

      mockGymRequest.create.mockResolvedValue({ id_gym_request: 10, toJSON: jest.fn() });

      await gymRequestService.createRequest(requestData);

      const createCall = mockGymRequest.create.mock.calls[0][0];
      expect(createCall.website).toBe('https://gymsocial.com');
      expect(createCall.instagram).toBe('@gymsocial');
      expect(createCall.facebook).toBe('gymsocial');
    });

    it('incluye precios monthly, weekly, daily', async () => {
      const requestData = {
        name: 'Gym Pricing',
        city: 'Buenos Aires',
        address: 'Calle 111',
        email: 'pricing@gym.com',
        monthly_price: 15000,
        weekly_price: 4000,
        daily_price: 800,
      };

      mockGymRequest.create.mockResolvedValue({ id_gym_request: 11, toJSON: jest.fn() });

      await gymRequestService.createRequest(requestData);

      const createCall = mockGymRequest.create.mock.calls[0][0];
      expect(createCall.monthly_price).toBe(15000);
      expect(createCall.weekly_price).toBe(4000);
      expect(createCall.daily_price).toBe(800);
    });

    it('incluye schedule y amenities', async () => {
      const requestData = {
        name: 'Gym Full',
        city: 'Buenos Aires',
        address: 'Calle 222',
        email: 'full@gym.com',
        schedule: [{ day: 'lunes', opens: '06:00', closes: '22:00', is_open: true }],
        amenities: ['WiFi', 'Ducha', 'Estacionamiento'],
      };

      mockGymRequest.create.mockResolvedValue({ id_gym_request: 12, toJSON: jest.fn() });

      await gymRequestService.createRequest(requestData);

      const createCall = mockGymRequest.create.mock.calls[0][0];
      expect(createCall.schedule).toEqual([
        { day: 'lunes', opens: '06:00', closes: '22:00', is_open: true },
      ]);
      expect(createCall.amenities).toEqual(['WiFi', 'Ducha', 'Estacionamiento']);
    });
  });

  describe('rejectRequest', () => {
    it('rechaza solicitud pendiente exitosamente', async () => {
      const mockRequest = {
        id_gym_request: 1,
        name: 'Gym Alpha',
        status: 'pending',
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ id_gym_request: 1, status: 'rejected' }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);

      const result = await gymRequestService.rejectRequest(1, 'Información incompleta', 100);

      expect(mockRequest.update).toHaveBeenCalledWith({
        status: 'rejected',
        rejection_reason: 'Información incompleta',
        processed_by: 100,
        processed_at: expect.any(Date),
      });
      expect(result).toEqual(mockRequest);
    });

    it('emite evento GYM_REQUEST_REJECTED después de rechazar', async () => {
      const mockRequest = {
        id_gym_request: 2,
        status: 'pending',
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ id_gym_request: 2 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);

      await gymRequestService.rejectRequest(2, 'Datos inválidos', 200);

      expect(mockAppEvents.emit).toHaveBeenCalledWith(mockEVENTS.GYM_REQUEST_REJECTED, {
        requestId: 2,
        gymRequest: { id_gym_request: 2 },
        reason: 'Datos inválidos',
        timestamp: expect.any(Date),
      });
    });

    it('lanza NotFoundError si solicitud no existe', async () => {
      mockGymRequest.findByPk.mockResolvedValue(null);

      await expect(
        gymRequestService.rejectRequest(999, 'No encontrado', 100)
      ).rejects.toThrow(mockErrors.NotFoundError);
      await expect(
        gymRequestService.rejectRequest(999, 'No encontrado', 100)
      ).rejects.toThrow('Solicitud no encontrada');
    });

    it('lanza ValidationError si solicitud ya fue aprobada', async () => {
      const mockRequest = {
        id_gym_request: 3,
        status: 'approved',
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);

      await expect(
        gymRequestService.rejectRequest(3, 'Ya aprobada', 100)
      ).rejects.toThrow(mockErrors.ValidationError);
      await expect(
        gymRequestService.rejectRequest(3, 'Ya aprobada', 100)
      ).rejects.toThrow('Solo se pueden rechazar solicitudes pendientes');
    });

    it('lanza ValidationError si solicitud ya fue rechazada', async () => {
      const mockRequest = {
        id_gym_request: 4,
        status: 'rejected',
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);

      await expect(
        gymRequestService.rejectRequest(4, 'Ya rechazada', 100)
      ).rejects.toThrow(mockErrors.ValidationError);
      await expect(
        gymRequestService.rejectRequest(4, 'Ya rechazada', 100)
      ).rejects.toThrow('Solo se pueden rechazar solicitudes pendientes');
    });

    it('guarda razón de rechazo correctamente', async () => {
      const mockRequest = {
        id_gym_request: 5,
        status: 'pending',
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);

      await gymRequestService.rejectRequest(5, 'Dirección incorrecta', 300);

      const updateCall = mockRequest.update.mock.calls[0][0];
      expect(updateCall.rejection_reason).toBe('Dirección incorrecta');
      expect(updateCall.processed_by).toBe(300);
    });
  });

  describe('deleteRequest', () => {
    it('elimina solicitud exitosamente', async () => {
      const mockRequest = {
        id_gym_request: 1,
        name: 'Gym Alpha',
        destroy: jest.fn().mockResolvedValue(true),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);

      await gymRequestService.deleteRequest(1);

      expect(mockRequest.destroy).toHaveBeenCalled();
    });

    it('lanza NotFoundError si solicitud no existe', async () => {
      mockGymRequest.findByPk.mockResolvedValue(null);

      await expect(gymRequestService.deleteRequest(999)).rejects.toThrow(
        mockErrors.NotFoundError
      );
      await expect(gymRequestService.deleteRequest(999)).rejects.toThrow(
        'Solicitud no encontrada'
      );
    });

    it('elimina sin importar el status', async () => {
      const mockRequest = {
        id_gym_request: 2,
        status: 'approved',
        destroy: jest.fn().mockResolvedValue(true),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);

      await gymRequestService.deleteRequest(2);

      expect(mockRequest.destroy).toHaveBeenCalled();
    });

    it('maneja IDs numéricos correctamente', async () => {
      const mockRequest = {
        id_gym_request: 42,
        destroy: jest.fn().mockResolvedValue(true),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);

      await gymRequestService.deleteRequest(42);

      expect(mockGymRequest.findByPk).toHaveBeenCalledWith(42);
      expect(mockRequest.destroy).toHaveBeenCalled();
    });
  });
});
