/**
 * Tests para gym-request-service - Approve Request (operación compleja)
 * Cubre: approveRequest (creación de gym, schedules, amenities, eventos)
 */

const {
  mockGymRequest,
  mockAmenity,
  mockGymService,
  mockGymScheduleRepository,
  mockAppEvents,
  mockEVENTS,
  mockErrors,
  gymRequestService,
} = require('./test-setup');

describe('gym-request-service approve', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log para tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe('approveRequest', () => {
    it('aprueba solicitud y crea gimnasio exitosamente', async () => {
      const mockRequest = {
        id_gym_request: 1,
        name: 'Gym Alpha',
        city: 'Buenos Aires',
        address: 'Calle Falsa 123',
        latitude: -34.6037,
        longitude: -58.3816,
        description: 'Gym moderno',
        phone: '+541112345678',
        email: 'contact@gymalpha.com',
        monthly_price: 15000,
        weekly_price: 4000,
        equipment: { mancuernas: true, barras: true },
        services: ['Personal trainer', 'Clases grupales'],
        rules: ['No usar celular en sala', 'Limpiar equipos'],
        schedule: [],
        amenities: [],
        trial_allowed: false,
        status: 'pending',
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ id_gym_request: 1 }),
      };

      const mockGym = {
        id_gym: 100,
        name: 'Gym Alpha',
        toJSON: jest.fn().mockReturnValue({ id_gym: 100 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);

      const result = await gymRequestService.approveRequest(1, 200);

      expect(mockGymService.createGym).toHaveBeenCalledWith({
        name: 'Gym Alpha',
        city: 'Buenos Aires',
        address: 'Calle Falsa 123',
        latitude: -34.6037,
        longitude: -58.3816,
        month_price: 15000,
        week_price: 4000,
        description: 'Gym moderno',
        phone: '+541112345678',
        email: 'contact@gymalpha.com',
        website: undefined,
        instagram: undefined,
        facebook: undefined,
        is_active: true,
        verified: false,
        featured: false,
        auto_checkin_enabled: false,
        trial_allowed: false,
        equipment: { mancuernas: true, barras: true },
        services: ['Personal trainer', 'Clases grupales'],
        rules: ['No usar celular en sala', 'Limpiar equipos'],
        amenities: [],
      });

      expect(result).toEqual(mockGym);
    });

    it('actualiza solicitud con status approved y metadata', async () => {
      const mockRequest = {
        id_gym_request: 2,
        name: 'Gym Beta',
        city: 'Córdoba',
        address: 'Av. Principal 456',
        latitude: -31.4201,
        longitude: -64.1888,
        status: 'pending',
        monthly_price: 12000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [],
        amenities: [],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 200,
        toJSON: jest.fn().mockReturnValue({ id_gym: 200 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);

      await gymRequestService.approveRequest(2, 300);

      expect(mockRequest.update).toHaveBeenCalledWith({
        status: 'approved',
        id_gym: 200,
        processed_by: 300,
        processed_at: expect.any(Date),
      });
    });

    it('emite evento GYM_REQUEST_APPROVED después de aprobar', async () => {
      const mockRequest = {
        id_gym_request: 3,
        name: 'Gym Gamma',
        city: 'Rosario',
        address: 'Calle 789',
        status: 'pending',
        monthly_price: 10000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [],
        amenities: [],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ id_gym_request: 3 }),
      };

      const mockGym = {
        id_gym: 300,
        toJSON: jest.fn().mockReturnValue({ id_gym: 300 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);

      await gymRequestService.approveRequest(3, 400);

      expect(mockAppEvents.emit).toHaveBeenCalledWith(mockEVENTS.GYM_REQUEST_APPROVED, {
        requestId: 3,
        gymId: 300,
        gymRequest: { id_gym_request: 3 },
        gym: { id_gym: 300 },
        timestamp: expect.any(Date),
      });
    });

    it('lanza NotFoundError si solicitud no existe', async () => {
      mockGymRequest.findByPk.mockResolvedValue(null);

      await expect(gymRequestService.approveRequest(999, 100)).rejects.toThrow(
        mockErrors.NotFoundError
      );
      await expect(gymRequestService.approveRequest(999, 100)).rejects.toThrow(
        'Solicitud no encontrada'
      );
    });

    it('lanza ValidationError si solicitud ya fue aprobada', async () => {
      const mockRequest = {
        id_gym_request: 4,
        status: 'approved',
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);

      await expect(gymRequestService.approveRequest(4, 100)).rejects.toThrow(
        mockErrors.ValidationError
      );
      await expect(gymRequestService.approveRequest(4, 100)).rejects.toThrow(
        'Solo se pueden aprobar solicitudes pendientes'
      );
    });

    it('lanza ValidationError si solicitud ya fue rechazada', async () => {
      const mockRequest = {
        id_gym_request: 5,
        status: 'rejected',
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);

      await expect(gymRequestService.approveRequest(5, 100)).rejects.toThrow(
        mockErrors.ValidationError
      );
      await expect(gymRequestService.approveRequest(5, 100)).rejects.toThrow(
        'Solo se pueden aprobar solicitudes pendientes'
      );
    });

    it('parsea JSON fields si vienen como strings', async () => {
      const mockRequest = {
        id_gym_request: 6,
        name: 'Gym Delta',
        city: 'Mendoza',
        address: 'Calle JSON 111',
        status: 'pending',
        monthly_price: 8000,
        equipment: '{"mancuernas":true}',
        services: '["Yoga","Pilates"]',
        rules: '["Regla 1","Regla 2"]',
        schedule: '[]',
        amenities: '[]',
        trial_allowed: 'false',
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 400,
        toJSON: jest.fn().mockReturnValue({ id_gym: 400 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);

      await gymRequestService.approveRequest(6, 500);

      const createCall = mockGymService.createGym.mock.calls[0][0];
      expect(createCall.equipment).toEqual({ mancuernas: true });
      expect(createCall.services).toEqual(['Yoga', 'Pilates']);
      expect(createCall.rules).toEqual(['Regla 1', 'Regla 2']);
    });

    it('normaliza trial_allowed=true cuando es string "true"', async () => {
      const mockRequest = {
        id_gym_request: 7,
        name: 'Gym Epsilon',
        city: 'Salta',
        address: 'Calle Trial 222',
        status: 'pending',
        monthly_price: 9000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [],
        amenities: [],
        trial_allowed: 'true',
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 500,
        toJSON: jest.fn().mockReturnValue({ id_gym: 500 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);

      await gymRequestService.approveRequest(7, 600);

      const createCall = mockGymService.createGym.mock.calls[0][0];
      expect(createCall.trial_allowed).toBe(true);
    });

    it('trunca address a 100 caracteres', async () => {
      const longAddress = 'A'.repeat(150);

      const mockRequest = {
        id_gym_request: 8,
        name: 'Gym Zeta',
        city: 'Tucumán',
        address: longAddress,
        status: 'pending',
        monthly_price: 7000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [],
        amenities: [],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 600,
        toJSON: jest.fn().mockReturnValue({ id_gym: 600 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);

      await gymRequestService.approveRequest(8, 700);

      const createCall = mockGymService.createGym.mock.calls[0][0];
      expect(createCall.address).toHaveLength(100);
    });

    it('trunca description a 500 caracteres', async () => {
      const longDescription = 'D'.repeat(600);

      const mockRequest = {
        id_gym_request: 9,
        name: 'Gym Eta',
        city: 'Neuquén',
        address: 'Calle 333',
        description: longDescription,
        status: 'pending',
        monthly_price: 11000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [],
        amenities: [],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 700,
        toJSON: jest.fn().mockReturnValue({ id_gym: 700 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);

      await gymRequestService.approveRequest(9, 800);

      const createCall = mockGymService.createGym.mock.calls[0][0];
      expect(createCall.description).toHaveLength(500);
    });

    it('usa "Sin descripción" si description está vacío', async () => {
      const mockRequest = {
        id_gym_request: 10,
        name: 'Gym Theta',
        city: 'La Plata',
        address: 'Calle 444',
        description: '',
        status: 'pending',
        monthly_price: 13000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [],
        amenities: [],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 800,
        toJSON: jest.fn().mockReturnValue({ id_gym: 800 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);

      await gymRequestService.approveRequest(10, 900);

      const createCall = mockGymService.createGym.mock.calls[0][0];
      expect(createCall.description).toBe('Sin descripción');
    });

    it('setea week_price si weekly_price está definido', async () => {
      const mockRequest = {
        id_gym_request: 11,
        name: 'Gym Iota',
        city: 'Mar del Plata',
        address: 'Calle 555',
        status: 'pending',
        monthly_price: 16000,
        weekly_price: 5000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [],
        amenities: [],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 900,
        toJSON: jest.fn().mockReturnValue({ id_gym: 900 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);

      await gymRequestService.approveRequest(11, 1000);

      const createCall = mockGymService.createGym.mock.calls[0][0];
      expect(createCall.week_price).toBe(5000);
    });

    it('convierte amenities de nombres a IDs numéricos', async () => {
      const mockRequest = {
        id_gym_request: 12,
        name: 'Gym Kappa',
        city: 'Santa Fe',
        address: 'Calle 666',
        status: 'pending',
        monthly_price: 14000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [],
        amenities: ['WiFi', 'Ducha', 'Estacionamiento'],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 1000,
        toJSON: jest.fn().mockReturnValue({ id_gym: 1000 }),
      };

      mockAmenity.findAll.mockResolvedValue([
        { id_amenity: 1, name: 'WiFi' },
        { id_amenity: 2, name: 'Ducha' },
        { id_amenity: 3, name: 'Estacionamiento' },
      ]);

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);

      await gymRequestService.approveRequest(12, 1100);

      const createCall = mockGymService.createGym.mock.calls[0][0];
      expect(createCall.amenities).toEqual([1, 2, 3]);
    });

    it('retorna amenities vacío si no se encuentran amenities', async () => {
      const mockRequest = {
        id_gym_request: 13,
        name: 'Gym Lambda',
        city: 'Bahía Blanca',
        address: 'Calle 777',
        status: 'pending',
        monthly_price: 12000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [],
        amenities: ['Inexistente'],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 1100,
        toJSON: jest.fn().mockReturnValue({ id_gym: 1100 }),
      };

      mockAmenity.findAll.mockResolvedValue([]);

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);

      await gymRequestService.approveRequest(13, 1200);

      const createCall = mockGymService.createGym.mock.calls[0][0];
      expect(createCall.amenities).toEqual([]);
    });

    it('acepta amenities como IDs numéricos directamente', async () => {
      const mockRequest = {
        id_gym_request: 14,
        name: 'Gym Mu',
        city: 'Corrientes',
        address: 'Calle 888',
        status: 'pending',
        monthly_price: 10000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [],
        amenities: [1, 2, 3],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 1200,
        toJSON: jest.fn().mockReturnValue({ id_gym: 1200 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);

      await gymRequestService.approveRequest(14, 1300);

      const createCall = mockGymService.createGym.mock.calls[0][0];
      expect(createCall.amenities).toEqual([1, 2, 3]);
      expect(mockAmenity.findAll).not.toHaveBeenCalled();
    });

    it('acepta amenities como strings numéricos y los convierte', async () => {
      const mockRequest = {
        id_gym_request: 15,
        name: 'Gym Nu',
        city: 'Posadas',
        address: 'Calle 999',
        status: 'pending',
        monthly_price: 9000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [],
        amenities: ['1', '2', '3'],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 1300,
        toJSON: jest.fn().mockReturnValue({ id_gym: 1300 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);

      await gymRequestService.approveRequest(15, 1400);

      const createCall = mockGymService.createGym.mock.calls[0][0];
      expect(createCall.amenities).toEqual([1, 2, 3]);
      expect(mockAmenity.findAll).not.toHaveBeenCalled();
    });

    it('filtra IDs negativos de amenities numéricos', async () => {
      const mockRequest = {
        id_gym_request: 25,
        name: 'Gym Psi',
        city: 'Jujuy',
        address: 'Calle Negative 777',
        status: 'pending',
        monthly_price: 8000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [],
        amenities: [1, -1, 0, 3, -5],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 2300,
        toJSON: jest.fn().mockReturnValue({ id_gym: 2300 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);

      await gymRequestService.approveRequest(25, 2400);

      const createCall = mockGymService.createGym.mock.calls[0][0];
      expect(createCall.amenities).toEqual([1, 3]);
      expect(mockAmenity.findAll).not.toHaveBeenCalled();
    });

    it('crea schedules regulares a partir del schedule array', async () => {
      const mockRequest = {
        id_gym_request: 16,
        name: 'Gym Xi',
        city: 'Corrientes',
        address: 'Calle 888',
        status: 'pending',
        monthly_price: 10000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [
          { day: 'lunes', opens: '06:00', closes: '22:00', is_open: true },
          { day: 'martes', opens: '06:00', closes: '22:00', is_open: true },
          { day: 'miércoles', opens: '06:00', closes: '22:00', is_open: true },
        ],
        amenities: [],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 1400,
        toJSON: jest.fn().mockReturnValue({ id_gym: 1400 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);
      mockGymScheduleRepository.createSchedule.mockResolvedValue({});

      await gymRequestService.approveRequest(16, 1500);

      expect(mockGymScheduleRepository.createSchedule).toHaveBeenCalledTimes(3);
      expect(mockGymScheduleRepository.createSchedule).toHaveBeenCalledWith({
        id_gym: 1400,
        day_of_week: 1, // lunes
        open_time: '06:00',
        close_time: '22:00',
        is_closed: false,
      });
    });

    it('mapea días en español a day_of_week correctamente', async () => {
      const mockRequest = {
        id_gym_request: 17,
        name: 'Gym Omicron',
        city: 'Posadas',
        address: 'Calle 999',
        status: 'pending',
        monthly_price: 9000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [
          { day: 'domingo', opens: '08:00', closes: '20:00', is_open: true },
          { day: 'sábado', opens: '08:00', closes: '20:00', is_open: true },
        ],
        amenities: [],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 1500,
        toJSON: jest.fn().mockReturnValue({ id_gym: 1500 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);
      mockGymScheduleRepository.createSchedule.mockResolvedValue({});

      await gymRequestService.approveRequest(17, 1600);

      expect(mockGymScheduleRepository.createSchedule).toHaveBeenCalledWith({
        id_gym: 1500,
        day_of_week: 0, // domingo
        open_time: '08:00',
        close_time: '20:00',
        is_closed: false,
      });
      expect(mockGymScheduleRepository.createSchedule).toHaveBeenCalledWith({
        id_gym: 1500,
        day_of_week: 6, // sábado
        open_time: '08:00',
        close_time: '20:00',
        is_closed: false,
      });
    });

    it('mapea días en inglés a day_of_week correctamente', async () => {
      const mockRequest = {
        id_gym_request: 18,
        name: 'Gym Pi',
        city: 'Resistencia',
        address: 'Calle 1000',
        status: 'pending',
        monthly_price: 11000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [
          { day: 'monday', opens: '07:00', closes: '21:00', is_open: true },
          { day: 'friday', opens: '07:00', closes: '21:00', is_open: true },
        ],
        amenities: [],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 1600,
        toJSON: jest.fn().mockReturnValue({ id_gym: 1600 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);
      mockGymScheduleRepository.createSchedule.mockResolvedValue({});

      await gymRequestService.approveRequest(18, 1700);

      expect(mockGymScheduleRepository.createSchedule).toHaveBeenCalledWith({
        id_gym: 1600,
        day_of_week: 1, // monday
        open_time: '07:00',
        close_time: '21:00',
        is_closed: false,
      });
      expect(mockGymScheduleRepository.createSchedule).toHaveBeenCalledWith({
        id_gym: 1600,
        day_of_week: 5, // friday
        open_time: '07:00',
        close_time: '21:00',
        is_closed: false,
      });
    });

    it('marca día como cerrado si is_open es false', async () => {
      const mockRequest = {
        id_gym_request: 19,
        name: 'Gym Rho',
        city: 'Formosa',
        address: 'Calle 1111',
        status: 'pending',
        monthly_price: 8000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [{ day: 'domingo', is_open: false }],
        amenities: [],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 1700,
        toJSON: jest.fn().mockReturnValue({ id_gym: 1700 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);
      mockGymScheduleRepository.createSchedule.mockResolvedValue({});

      await gymRequestService.approveRequest(19, 1800);

      expect(mockGymScheduleRepository.createSchedule).toHaveBeenCalledWith({
        id_gym: 1700,
        day_of_week: 0,
        open_time: '00:00',
        close_time: '00:00',
        is_closed: true,
      });
    });

    it('ignora días con nombres inválidos en schedule', async () => {
      const mockRequest = {
        id_gym_request: 20,
        name: 'Gym Sigma',
        city: 'Santiago del Estero',
        address: 'Calle 1222',
        status: 'pending',
        monthly_price: 7000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [
          { day: 'invalid_day', opens: '06:00', closes: '22:00', is_open: true },
          { day: 'lunes', opens: '06:00', closes: '22:00', is_open: true },
        ],
        amenities: [],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 1800,
        toJSON: jest.fn().mockReturnValue({ id_gym: 1800 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);
      mockGymScheduleRepository.createSchedule.mockResolvedValue({});

      await gymRequestService.approveRequest(20, 1900);

      expect(mockGymScheduleRepository.createSchedule).toHaveBeenCalledTimes(1);
    });

    it('maneja errores en createSchedule sin romper aprobación', async () => {
      const mockRequest = {
        id_gym_request: 21,
        name: 'Gym Tau',
        city: 'Catamarca',
        address: 'Calle 1333',
        status: 'pending',
        monthly_price: 6000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [{ day: 'lunes', opens: '06:00', closes: '22:00', is_open: true }],
        amenities: [],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 1900,
        toJSON: jest.fn().mockReturnValue({ id_gym: 1900 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);
      mockGymScheduleRepository.createSchedule.mockRejectedValue(new Error('DB Error'));

      const result = await gymRequestService.approveRequest(21, 2000);

      expect(result).toEqual(mockGym);
      expect(mockRequest.update).toHaveBeenCalled();
    });

    it('no crea schedules si schedule está vacío', async () => {
      const mockRequest = {
        id_gym_request: 22,
        name: 'Gym Upsilon',
        city: 'La Rioja',
        address: 'Calle 1444',
        status: 'pending',
        monthly_price: 5000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [],
        amenities: [],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 2000,
        toJSON: jest.fn().mockReturnValue({ id_gym: 2000 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);

      await gymRequestService.approveRequest(22, 2100);

      expect(mockGymScheduleRepository.createSchedule).not.toHaveBeenCalled();
    });

    it('incluye redes sociales en gymData', async () => {
      const mockRequest = {
        id_gym_request: 23,
        name: 'Gym Phi',
        city: 'San Juan',
        address: 'Calle 1555',
        status: 'pending',
        monthly_price: 14000,
        website: 'https://gymphi.com',
        instagram: '@gymphi',
        facebook: 'gymphi',
        equipment: {},
        services: [],
        rules: [],
        schedule: [],
        amenities: [],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 2100,
        toJSON: jest.fn().mockReturnValue({ id_gym: 2100 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);

      await gymRequestService.approveRequest(23, 2200);

      const createCall = mockGymService.createGym.mock.calls[0][0];
      expect(createCall.website).toBe('https://gymphi.com');
      expect(createCall.instagram).toBe('@gymphi');
      expect(createCall.facebook).toBe('gymphi');
    });

    it('setea valores por defecto para gym (is_active, verified, featured)', async () => {
      const mockRequest = {
        id_gym_request: 24,
        name: 'Gym Chi',
        city: 'San Luis',
        address: 'Calle 1666',
        status: 'pending',
        monthly_price: 10000,
        equipment: {},
        services: [],
        rules: [],
        schedule: [],
        amenities: [],
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(),
      };

      const mockGym = {
        id_gym: 2200,
        toJSON: jest.fn().mockReturnValue({ id_gym: 2200 }),
      };

      mockGymRequest.findByPk.mockResolvedValue(mockRequest);
      mockGymService.createGym.mockResolvedValue(mockGym);

      await gymRequestService.approveRequest(24, 2300);

      const createCall = mockGymService.createGym.mock.calls[0][0];
      expect(createCall.is_active).toBe(true);
      expect(createCall.verified).toBe(false);
      expect(createCall.featured).toBe(false);
      expect(createCall.auto_checkin_enabled).toBe(false);
    });
  });
});
