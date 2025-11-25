/**
 * Gym Schedule Controller Tests - Lote 4
 * Tests for refactored controller using DTOs/Mappers/Commands/Queries
 */

jest.mock('../services/gym-schedule-service');
jest.mock('../services/mappers', () => ({
  gymScheduleMappers: {
    toGetGymSchedulesQuery: jest.fn(),
    toGymSchedulesDTO: jest.fn(),
    toGetGymScheduleQuery: jest.fn(),
    toGymScheduleDTO: jest.fn(),
    toCreateGymScheduleCommand: jest.fn(),
    toUpdateGymScheduleCommand: jest.fn(),
    toDeleteGymScheduleCommand: jest.fn(),
    toGetGymSpecialSchedulesQuery: jest.fn(),
    toGymSpecialSchedulesDTO: jest.fn(),
    toGetGymSpecialScheduleQuery: jest.fn(),
    toGymSpecialScheduleDTO: jest.fn(),
    toCreateGymSpecialScheduleCommand: jest.fn(),
    toUpdateGymSpecialScheduleCommand: jest.fn(),
    toDeleteGymSpecialScheduleCommand: jest.fn(),
    toGetEffectiveGymScheduleQuery: jest.fn(),
  },
}));

const controller = require('../controllers/gym-schedule-controller');
const service = require('../services/gym-schedule-service');
const { gymScheduleMappers } = require('../services/mappers');

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================================
// REGULAR SCHEDULES
// ============================================================================

describe('listGymSchedules', () => {
  it('returns list of schedules', async () => {
    const req = { params: { gymId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const mockQuery = { gymId: 1 };
    const mockSchedules = [{ id_schedule: 1, day_of_week: 'MONDAY' }];
    const mockDTO = { schedules: mockSchedules };

    gymScheduleMappers.toGetGymSchedulesQuery.mockReturnValue(mockQuery);
    service.getGymSchedules.mockResolvedValue(mockSchedules);
    gymScheduleMappers.toGymSchedulesDTO.mockReturnValue(mockDTO);

    await controller.listGymSchedules(req, res);

    expect(gymScheduleMappers.toGetGymSchedulesQuery).toHaveBeenCalledWith(1);
    expect(service.getGymSchedules).toHaveBeenCalledWith(mockQuery);
    expect(gymScheduleMappers.toGymSchedulesDTO).toHaveBeenCalledWith(mockSchedules);
    expect(res.json).toHaveBeenCalledWith(mockDTO);
  });

  it('handles errors', async () => {
    const req = { params: { gymId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const error = new Error('Database error');
    error.statusCode = 500;

    gymScheduleMappers.toGetGymSchedulesQuery.mockReturnValue({ gymId: 1 });
    service.getGymSchedules.mockRejectedValue(error);

    await controller.listGymSchedules(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'GET_SCHEDULES_FAILED',
        message: 'Database error',
      },
    });
  });
});

describe('getGymSchedule', () => {
  it('returns schedule by id', async () => {
    const req = { params: { scheduleId: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const mockQuery = { scheduleId: 1 };
    const mockSchedule = { id_schedule: 1, day_of_week: 'MONDAY' };
    const mockDTO = mockSchedule;

    gymScheduleMappers.toGetGymScheduleQuery.mockReturnValue(mockQuery);
    service.getGymSchedule.mockResolvedValue(mockSchedule);
    gymScheduleMappers.toGymScheduleDTO.mockReturnValue(mockDTO);

    await controller.getGymSchedule(req, res);

    expect(service.getGymSchedule).toHaveBeenCalledWith(mockQuery);
    expect(res.json).toHaveBeenCalledWith(mockDTO);
  });

  it('returns 404 when schedule not found', async () => {
    const req = { params: { scheduleId: '999' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    gymScheduleMappers.toGetGymScheduleQuery.mockReturnValue({ scheduleId: 999 });
    service.getGymSchedule.mockResolvedValue(null);

    await controller.getGymSchedule(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'SCHEDULE_NOT_FOUND',
        message: 'Horario no encontrado',
      },
    });
  });
});

describe('createGymSchedule', () => {
  it('validates and creates schedule', async () => {
    const req = {
      params: { gymId: '1' },
      body: { day_of_week: 'MONDAY', open_time: '08:00', close_time: '20:00', is_closed: false },
      account: { userProfile: { id_user_profile: 10 } },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const mockCommand = { gymId: 1, day_of_week: 'MONDAY', createdBy: 10 };
    const mockSchedule = { id_schedule: 1, id_gym: 1, day_of_week: 'MONDAY' };
    const mockDTO = mockSchedule;

    gymScheduleMappers.toCreateGymScheduleCommand.mockReturnValue(mockCommand);
    service.createGymSchedule.mockResolvedValue(mockSchedule);
    gymScheduleMappers.toGymScheduleDTO.mockReturnValue(mockDTO);

    await controller.createGymSchedule(req, res);

    expect(gymScheduleMappers.toCreateGymScheduleCommand).toHaveBeenCalledWith(req.body, 1, 10);
    expect(service.createGymSchedule).toHaveBeenCalledWith(mockCommand);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockDTO);
  });

  it('handles ConflictError', async () => {
    const req = {
      params: { gymId: '1' },
      body: { day_of_week: 'MONDAY' },
      account: { userProfile: { id_user_profile: 10 } },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const error = new Error('Ya existe');
    error.statusCode = 409;
    error.code = 'CONFLICT';

    gymScheduleMappers.toCreateGymScheduleCommand.mockReturnValue({});
    service.createGymSchedule.mockRejectedValue(error);

    await controller.createGymSchedule(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'CONFLICT',
        message: 'Ya existe',
      },
    });
  });
});

describe('updateGymSchedule', () => {
  it('updates schedule', async () => {
    const req = {
      params: { scheduleId: '1' },
      body: { open_time: '09:00' },
      account: { userProfile: { id_user_profile: 10 } },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const mockCommand = { scheduleId: 1, open_time: '09:00', updatedBy: 10 };
    const mockSchedule = { id_schedule: 1, open_time: '09:00' };

    gymScheduleMappers.toUpdateGymScheduleCommand.mockReturnValue(mockCommand);
    service.updateGymSchedule.mockResolvedValue(mockSchedule);
    gymScheduleMappers.toGymScheduleDTO.mockReturnValue(mockSchedule);

    await controller.updateGymSchedule(req, res);

    expect(service.updateGymSchedule).toHaveBeenCalledWith(mockCommand);
    expect(res.json).toHaveBeenCalledWith(mockSchedule);
  });
});

describe('deleteGymSchedule', () => {
  it('deletes schedule', async () => {
    const req = {
      params: { scheduleId: '1' },
      account: { userProfile: { id_user_profile: 10 } },
    };
    const res = { send: jest.fn(), status: jest.fn().mockReturnThis() };

    const mockCommand = { scheduleId: 1, deletedBy: 10 };

    gymScheduleMappers.toDeleteGymScheduleCommand.mockReturnValue(mockCommand);
    service.deleteGymSchedule.mockResolvedValue(1);

    await controller.deleteGymSchedule(req, res);

    expect(service.deleteGymSchedule).toHaveBeenCalledWith(mockCommand);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});

// ============================================================================
// SPECIAL SCHEDULES
// ============================================================================

describe('listGymSpecialSchedules', () => {
  it('returns list of special schedules with filters', async () => {
    const req = {
      params: { gymId: '1' },
      query: { from_date: '2025-12-01', to_date: '2025-12-31', future_only: 'true' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const mockQuery = { gymId: 1, from_date: '2025-12-01', to_date: '2025-12-31', future_only: true };
    const mockSchedules = [{ id_special_schedule: 1, special_date: '2025-12-25' }];
    const mockDTO = { schedules: mockSchedules };

    gymScheduleMappers.toGetGymSpecialSchedulesQuery.mockReturnValue(mockQuery);
    service.getGymSpecialSchedules.mockResolvedValue(mockSchedules);
    gymScheduleMappers.toGymSpecialSchedulesDTO.mockReturnValue(mockDTO);

    await controller.listGymSpecialSchedules(req, res);

    expect(gymScheduleMappers.toGetGymSpecialSchedulesQuery).toHaveBeenCalledWith({
      gymId: 1,
      from_date: '2025-12-01',
      to_date: '2025-12-31',
      future_only: true,
    });
    expect(service.getGymSpecialSchedules).toHaveBeenCalledWith(mockQuery);
    expect(res.json).toHaveBeenCalledWith(mockDTO);
  });
});

describe('createGymSpecialSchedule', () => {
  it('creates special schedule', async () => {
    const req = {
      params: { gymId: '1' },
      body: { special_date: '2025-12-25', is_closed: true, motive: 'Navidad' },
      account: { userProfile: { id_user_profile: 10 } },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const mockCommand = { gymId: 1, special_date: '2025-12-25', createdBy: 10 };
    const mockSchedule = { id_special_schedule: 1, special_date: '2025-12-25' };

    gymScheduleMappers.toCreateGymSpecialScheduleCommand.mockReturnValue(mockCommand);
    service.createGymSpecialSchedule.mockResolvedValue(mockSchedule);
    gymScheduleMappers.toGymSpecialScheduleDTO.mockReturnValue(mockSchedule);

    await controller.createGymSpecialSchedule(req, res);

    expect(service.createGymSpecialSchedule).toHaveBeenCalledWith(mockCommand);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockSchedule);
  });
});

describe('getEffectiveGymSchedule', () => {
  it('returns effective schedule for date', async () => {
    const req = {
      params: { gymId: '1' },
      query: { date: '2025-12-25' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    const mockQuery = { gymId: 1, date: '2025-12-25' };
    const mockResult = {
      type: 'SPECIAL',
      schedule: { id_special_schedule: 1, is_closed: true },
    };

    gymScheduleMappers.toGetEffectiveGymScheduleQuery.mockReturnValue(mockQuery);
    service.getEffectiveGymSchedule.mockResolvedValue(mockResult);

    await controller.getEffectiveGymSchedule(req, res);

    expect(service.getEffectiveGymSchedule).toHaveBeenCalledWith(mockQuery);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('returns 400 when date is missing', async () => {
    const req = {
      params: { gymId: '1' },
      query: {},
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.getEffectiveGymSchedule(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'MISSING_DATE',
        message: 'El parámetro "date" es requerido',
      },
    });
  });

  it('returns 404 when no schedule found', async () => {
    const req = {
      params: { gymId: '1' },
      query: { date: '2025-12-25' },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    gymScheduleMappers.toGetEffectiveGymScheduleQuery.mockReturnValue({});
    service.getEffectiveGymSchedule.mockResolvedValue(null);

    await controller.getEffectiveGymSchedule(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'NO_SCHEDULE_FOUND',
        message: 'No se encontró horario para esta fecha',
      },
    });
  });
});

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

describe('legacy function names', () => {
  it('crearHorario points to createGymSchedule', () => {
    expect(controller.crearHorario).toBe(controller.createGymSchedule);
  });

  it('obtenerHorariosPorGimnasio points to listGymSchedules', () => {
    expect(controller.obtenerHorariosPorGimnasio).toBe(controller.listGymSchedules);
  });

  it('actualizarHorario points to updateGymSchedule', () => {
    expect(controller.actualizarHorario).toBe(controller.updateGymSchedule);
  });
});
