jest.mock('../models/Frequency', () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
}));

const frequencyService = require('../services/frequency-service');
const Frequency = require('../models/Frequency');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('crearMetaSemanal', () => {
  it('creates new frequency if none exists', async () => {
    Frequency.findOne.mockResolvedValue(null);
    const created = { id_frequency: 1 };
    Frequency.create.mockResolvedValue(created);

    const result = await frequencyService.crearMetaSemanal({ id_user: 1, goal: 3 });

    expect(Frequency.create).toHaveBeenCalledWith({ id_user: 1, goal: 3, assist: 0, achieved_goal: false });
    expect(result).toBe(created);
  });

  it('updates existing frequency', async () => {
    const existing = { save: jest.fn() };
    Frequency.findOne.mockResolvedValue(existing);

    const result = await frequencyService.crearMetaSemanal({ id_user: 1, goal: 5 });

    expect(existing.goal).toBe(5);
    expect(existing.assist).toBe(0);
    expect(existing.achieved_goal).toBe(false);
    expect(existing.save).toHaveBeenCalled();
    expect(result).toBe(existing);
  });
});

describe('actualizarAsistenciaSemanal', () => {
  it('increments assist and marks goal achieved', async () => {
    const freq = { assist: 2, goal: 3, achieved_goal: false, save: jest.fn() };
    Frequency.findOne.mockResolvedValue(freq);

    await frequencyService.actualizarAsistenciaSemanal(1);

    expect(freq.assist).toBe(3);
    expect(freq.achieved_goal).toBe(true);
    expect(freq.save).toHaveBeenCalled();
  });
});
describe('reiniciarSemana', () => {
  it('resets all frequencies', async () => {
    await frequencyService.reiniciarSemana();
    expect(Frequency.update).toHaveBeenCalledWith(
      { assist: 0, achieved_goal: false },
      { where: {} }
    );
  });
});

describe('consultarMetaSemanal', () => {
  it('returns frequency when exists', async () => {
    const freq = { id_frequency: 1 };
    Frequency.findOne.mockResolvedValue(freq);

    const result = await frequencyService.consultarMetaSemanal(1);

    expect(Frequency.findOne).toHaveBeenCalledWith({ where: { id_user: 1 } });
    expect(result).toBe(freq);
  });

  it('throws when frequency not found', async () => {
    Frequency.findOne.mockResolvedValue(null);
    await expect(frequencyService.consultarMetaSemanal(2))
      .rejects.toThrow('El usuario no tiene una meta semanal asignada.');
  });
});
