/**
 * Gym Schedule Service Tests - Lote 4
 * Tests for refactored service using Commands/Queries/Repositories
 */

jest.mock('../infra/db/repositories', () => ({
  gymScheduleRepository: {
    findScheduleByGymAndDay: jest.fn(),
    createSchedule: jest.fn(),
    findSchedulesByGymId: jest.fn(),
    findScheduleById: jest.fn(),
    updateSchedule: jest.fn(),
    deleteSchedule: jest.fn(),
    findSpecialScheduleByGymAndDate: jest.fn(),
    createSpecialSchedule: jest.fn(),
    findSpecialSchedulesByGymId: jest.fn(),
    findSpecialScheduleById: jest.fn(),
    updateSpecialSchedule: jest.fn(),
    deleteSpecialSchedule: jest.fn(),
  },
}));

jest.mock('../config/database', () => ({
  transaction: jest.fn(),
}));

const service = require('../services/gym-schedule-service');
const { gymScheduleRepository } = require('../infra/db/repositories');
const sequelize = require('../config/database');
const {
  CreateGymScheduleCommand,
  UpdateGymScheduleCommand,
  DeleteGymScheduleCommand,
  CreateGymSpecialScheduleCommand,
} = require('../services/commands/gym-schedule.commands');
const {
  GetGymSchedulesQuery,
  GetGymScheduleQuery,
  GetEffectiveGymScheduleQuery,
} = require('../services/queries/gym-schedule.queries');

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

// ============================================================================
// REGULAR SCHEDULES
// ============================================================================

describe('createGymSchedule', () => {
  it('throws ConflictError if schedule exists for the day', async () => {
    gymScheduleRepository.findScheduleByGymAndDay.mockResolvedValue({
      id_schedule: 1,
      id_gym: 1,
      day_of_week: 'MONDAY',
    });

    const command = new CreateGymScheduleCommand({
      gymId: 1,
      day_of_week: 'MONDAY',
      open_time: '08:00',
      close_time: '20:00',
      is_closed: false,
      createdBy: 10,
    });

    await expect(service.createGymSchedule(command)).rejects.toThrow(
      'El gimnasio ya tiene un horario registrado para "MONDAY"'
    );
    expect(transactions[0].rollback).toHaveBeenCalled();
  });

  it('creates schedule when none exists', async () => {
    gymScheduleRepository.findScheduleByGymAndDay.mockResolvedValue(null);
    const createdSchedule = {
      id_schedule: 1,
      id_gym: 1,
      day_of_week: 'MONDAY',
      open_time: '08:00',
      close_time: '20:00',
      is_closed: false,
    };
    gymScheduleRepository.createSchedule.mockResolvedValue(createdSchedule);

    const command = new CreateGymScheduleCommand({
      gymId: 1,
      day_of_week: 'MONDAY',
      open_time: '08:00',
      close_time: '20:00',
      is_closed: false,
      createdBy: 10,
    });

    const result = await service.createGymSchedule(command);

    expect(gymScheduleRepository.createSchedule).toHaveBeenCalledWith(
      {
        id_gym: 1,
        day_of_week: 'MONDAY',
        open_time: '08:00',
        close_time: '20:00',
        is_closed: false,
      },
      { transaction: expect.any(Object) }
    );
    expect(result).toEqual(createdSchedule);
    expect(transactions[0].commit).toHaveBeenCalled();
  });

  it('throws ValidationError if not closed but missing times', async () => {
    gymScheduleRepository.findScheduleByGymAndDay.mockResolvedValue(null);

    const command = new CreateGymScheduleCommand({
      gymId: 1,
      day_of_week: 'MONDAY',
      open_time: null,
      close_time: null,
      is_closed: false,
      createdBy: 10,
    });

    await expect(service.createGymSchedule(command)).rejects.toThrow(
      'Se requieren open_time y close_time cuando el gimnasio no está cerrado'
    );
  });
});

describe('getGymSchedules', () => {
  it('returns list of schedules for a gym', async () => {
    const schedules = [
      { id_schedule: 1, id_gym: 2, day_of_week: 'MONDAY', open_time: '08:00', close_time: '20:00' },
      { id_schedule: 2, id_gym: 2, day_of_week: 'TUESDAY', open_time: '08:00', close_time: '20:00' },
    ];
    gymScheduleRepository.findSchedulesByGymId.mockResolvedValue(schedules);

    const query = { gymId: 2 };
    const result = await service.getGymSchedules(query);

    expect(gymScheduleRepository.findSchedulesByGymId).toHaveBeenCalledWith(query.gymId);
    expect(result).toEqual(schedules);
  });
});

describe('getGymSchedule', () => {
  it('returns specific schedule by id', async () => {
    const schedule = { id_schedule: 1, id_gym: 1, day_of_week: 'MONDAY' };
    gymScheduleRepository.findScheduleById.mockResolvedValue(schedule);

    const query = { scheduleId: 1 };
    const result = await service.getGymSchedule(query);

    expect(gymScheduleRepository.findScheduleById).toHaveBeenCalledWith(query.scheduleId);
    expect(result).toEqual(schedule);
  });
});

describe('updateGymSchedule', () => {
  it('throws NotFoundError if schedule not found', async () => {
    gymScheduleRepository.findScheduleById.mockResolvedValue(null);

    const command = new UpdateGymScheduleCommand({
      scheduleId: 999,
      open_time: '09:00',
      updatedBy: 10,
    });

    await expect(service.updateGymSchedule(command)).rejects.toThrow('Horario no encontrado');
    expect(transactions[0].rollback).toHaveBeenCalled();
  });

  it('updates existing schedule', async () => {
    const existingSchedule = {
      id_schedule: 1,
      id_gym: 1,
      day_of_week: 'MONDAY',
      open_time: '08:00',
      close_time: '20:00',
      is_closed: false,
    };
    const updatedSchedule = { ...existingSchedule, open_time: '09:00' };

    gymScheduleRepository.findScheduleById.mockResolvedValue(existingSchedule);
    gymScheduleRepository.updateSchedule.mockResolvedValue(updatedSchedule);

    const command = new UpdateGymScheduleCommand({
      scheduleId: 1,
      open_time: '09:00',
      updatedBy: 10,
    });

    const result = await service.updateGymSchedule(command);

    expect(gymScheduleRepository.updateSchedule).toHaveBeenCalledWith(
      1,
      { open_time: '09:00' },
      { transaction: expect.any(Object) }
    );
    expect(result).toEqual(updatedSchedule);
    expect(transactions[0].commit).toHaveBeenCalled();
  });
});

describe('deleteGymSchedule', () => {
  it('deletes schedule', async () => {
    gymScheduleRepository.findScheduleById.mockResolvedValue({ id_schedule: 1 });
    gymScheduleRepository.deleteSchedule.mockResolvedValue(1);

    const command = { scheduleId: 1, deletedBy: 10 };
    const result = await service.deleteGymSchedule(command);

    expect(gymScheduleRepository.deleteSchedule).toHaveBeenCalledWith(command.scheduleId, {
      transaction: expect.any(Object),
    });
    expect(result).toBe(1);
    expect(transactions[0].commit).toHaveBeenCalled();
  });
});

// ============================================================================
// SPECIAL SCHEDULES
// ============================================================================

describe('createGymSpecialSchedule', () => {
  it('throws ConflictError if special schedule exists for date', async () => {
    gymScheduleRepository.findSpecialScheduleByGymAndDate.mockResolvedValue({
      id_special_schedule: 1,
      id_gym: 1,
      special_date: '2025-12-25',
    });

    const command = new CreateGymSpecialScheduleCommand({
      gymId: 1,
      special_date: '2025-12-25',
      open_time: null,
      close_time: null,
      is_closed: true,
      motive: 'Navidad',
      createdBy: 10,
    });

    await expect(service.createGymSpecialSchedule(command)).rejects.toThrow(
      'Ya existe un horario especial registrado para esa fecha'
    );
  });

  it('creates special schedule', async () => {
    gymScheduleRepository.findSpecialScheduleByGymAndDate.mockResolvedValue(null);
    const created = {
      id_special_schedule: 1,
      id_gym: 1,
      special_date: '2025-12-25',
      is_closed: true,
      motive: 'Navidad',
    };
    gymScheduleRepository.createSpecialSchedule.mockResolvedValue(created);

    const command = new CreateGymSpecialScheduleCommand({
      gymId: 1,
      special_date: '2025-12-25',
      open_time: null,
      close_time: null,
      is_closed: true,
      motive: 'Navidad',
      createdBy: 10,
    });

    const result = await service.createGymSpecialSchedule(command);

    expect(result).toEqual(created);
    expect(transactions[0].commit).toHaveBeenCalled();
  });
});

describe('getEffectiveGymSchedule', () => {
  it('returns special schedule if exists', async () => {
    const specialSchedule = {
      id_special_schedule: 1,
      id_gym: 1,
      special_date: '2025-12-25',
      is_closed: true,
    };
    gymScheduleRepository.findSpecialScheduleByGymAndDate.mockResolvedValue(specialSchedule);

    const query = new GetEffectiveGymScheduleQuery(1, '2025-12-25');
    const result = await service.getEffectiveGymSchedule(query);

    expect(result).toEqual({
      type: 'SPECIAL',
      schedule: specialSchedule,
    });
  });

  it('returns regular schedule if no special schedule', async () => {
    gymScheduleRepository.findSpecialScheduleByGymAndDate.mockResolvedValue(null);
    const regularSchedule = {
      id_schedule: 1,
      id_gym: 1,
      day_of_week: 'SUNDAY',
      open_time: '08:00',
      close_time: '20:00',
    };
    gymScheduleRepository.findScheduleByGymAndDay.mockResolvedValue(regularSchedule);

    // 2025-12-21 is Sunday
    const query = { gymId: 1, date: '2025-12-21' };
    const result = await service.getEffectiveGymSchedule(query);

    expect(result).toEqual({
      type: 'REGULAR',
      schedule: regularSchedule,
    });
    expect(gymScheduleRepository.findScheduleByGymAndDay).toHaveBeenCalledWith(query.gymId, 'SUNDAY');
  });

  it('returns null if no schedule found', async () => {
    gymScheduleRepository.findSpecialScheduleByGymAndDate.mockResolvedValue(null);
    gymScheduleRepository.findScheduleByGymAndDay.mockResolvedValue(null);

    const query = { gymId: 1, date: '2025-12-22' };
    const result = await service.getEffectiveGymSchedule(query);

    expect(result).toBeNull();
  });
});
