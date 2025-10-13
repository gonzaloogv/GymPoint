jest.mock('../models', () => ({
  UserProfile: {},
  FrequencyHistory: { create: jest.fn() }
}));
jest.mock('../models/Frequency', () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn()
}));
jest.mock('../config/database', () => ({
  transaction: jest.fn()
}));
jest.mock('../services/token-ledger-service', () => ({
  registrarMovimiento: jest.fn()
}));
jest.mock('../config/constants', () => ({
  TOKENS: { WEEKLY_BONUS: 20 },
  TOKEN_REASONS: { WEEKLY_BONUS: 'WEEKLY_BONUS' }
}));

const frequencyService = require('../services/frequency-service');
const Frequency = require('../models/Frequency');
const { FrequencyHistory } = require('../models');
const sequelize = require('../config/database');
const tokenLedgerService = require('../services/token-ledger-service');

let mockTransaction;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-01-06T09:00:00Z')); // Monday

  mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn()
  };
  sequelize.transaction.mockResolvedValue(mockTransaction);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('crearMetaSemanal', () => {
  it('creates new frequency if none exists', async () => {
    Frequency.findOne.mockResolvedValue(null);
    const created = { id_frequency: 1 };
    Frequency.create.mockResolvedValue(created);

    const result = await frequencyService.crearMetaSemanal({ id_user: 1, goal: 3 });

    const meta = frequencyService.__private.getWeekMetadata(new Date());
    expect(Frequency.create).toHaveBeenCalledWith(expect.objectContaining({
      id_user: 1,
      goal: 3,
      assist: 0,
      achieved_goal: false,
      week_start_date: meta.weekStartDate.toISOString().slice(0, 10),
      week_number: meta.weekNumber,
      year: meta.year
    }));
    expect(result).toBe(created);
  });

  it('updates existing frequency', async () => {
    const existing = {
      goal: 2,
      assist: 5,
      achieved_goal: true,
      week_start_date: null,
      save: jest.fn()
    };
    Frequency.findOne.mockResolvedValue(existing);

    const result = await frequencyService.crearMetaSemanal({ id_user: 1, goal: 5 });

    expect(existing.goal).toBe(5);
    expect(existing.assist).toBe(0);
    expect(existing.achieved_goal).toBe(false);
    expect(existing.week_start_date).toBe('2025-01-06');
    expect(existing.save).toHaveBeenCalled();
    expect(result).toBe(existing);
  });
});

describe('actualizarAsistenciaSemanal', () => {
  it('increments assist and marks goal achieved', async () => {
    const freq = {
      assist: 2,
      goal: 3,
      achieved_goal: false,
      week_start_date: '2025-01-06',
      week_number: 2,
      year: 2025,
      save: jest.fn()
    };
    Frequency.findOne.mockResolvedValue(freq);

    await frequencyService.actualizarAsistenciaSemanal(1);

    expect(freq.assist).toBe(3);
    expect(freq.achieved_goal).toBe(true);
    expect(freq.save).toHaveBeenCalled();
  });
});

describe('archivarFrecuencias', () => {
  it('archiva frecuencias y resetea contadores', async () => {
    const freq = {
      id_user: 99,
      goal: 3,
      assist: 3,
      achieved_goal: true,
      week_start_date: '2024-12-30',
      save: jest.fn()
    };
    Frequency.findAll.mockResolvedValue([freq]);
    FrequencyHistory.create.mockResolvedValue({ id_history: 10 });

    await frequencyService.archivarFrecuencias(new Date('2025-01-06T09:00:00Z'));

    expect(FrequencyHistory.create).toHaveBeenCalledWith(expect.objectContaining({
      id_user_profile: 99,
      week_start_date: '2024-12-30',
      goal: 3,
      achieved: 3,
      goal_met: true,
      tokens_earned: 20
    }), { transaction: mockTransaction });

    expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalledWith(expect.objectContaining({
      userId: 99,
      delta: 20,
      reason: 'WEEKLY_BONUS',
      refType: 'frequency_history',
      refId: 10,
      transaction: mockTransaction
    }));

    expect(freq.assist).toBe(0);
    expect(freq.achieved_goal).toBe(false);
    expect(freq.week_start_date).toBe('2025-01-06');
    expect(freq.save).toHaveBeenCalledWith({ transaction: mockTransaction });
    expect(mockTransaction.commit).toHaveBeenCalled();
  });
});

describe('reiniciarSemana', () => {
  it('reinicia frecuencias ejecutando transaccion', async () => {
    Frequency.findAll.mockResolvedValue([]);
    await frequencyService.reiniciarSemana();
    expect(sequelize.transaction).toHaveBeenCalled();
    expect(mockTransaction.commit).toHaveBeenCalled();
  });
});

describe('consultarMetaSemanal', () => {
  it('returns frequency when exists', async () => {
    const freq = { id_frequency: 1 };
    Frequency.findOne.mockResolvedValue(freq);

    const result = await frequencyService.consultarMetaSemanal(1);

    expect(Frequency.findOne).toHaveBeenCalledWith({
      where: { id_user: 1 },
      include: {
        model: expect.any(Object),
        as: 'userProfile',
        attributes: ['name', 'lastname']
      }
    });
    expect(result).toBe(freq);
  });

  it('throws when frequency not found', async () => {
    Frequency.findOne.mockResolvedValue(null);
    await expect(frequencyService.consultarMetaSemanal(2))
      .rejects.toThrow('El usuario no tiene una meta semanal asignada.');
  });
});

describe('actualizarUsuarioFrecuencia', () => {
  it('actualiza id_user cuando la frecuencia existe', async () => {
    const freq = { save: jest.fn() };
    Frequency.findByPk.mockResolvedValue(freq);

    const result = await frequencyService.actualizarUsuarioFrecuencia(1, 20);

    expect(freq.id_user).toBe(20);
    expect(freq.save).toHaveBeenCalled();
    expect(result).toBe(freq);
  });

  it('lanza error si la frecuencia no existe', async () => {
    Frequency.findByPk.mockResolvedValue(null);

    await expect(frequencyService.actualizarUsuarioFrecuencia(1, 20))
      .rejects.toThrow('Frecuencia no encontrada');
  });
});




