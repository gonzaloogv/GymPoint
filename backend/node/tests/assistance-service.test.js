jest.mock('../models', () => ({ UserProfile: { findByPk: jest.fn() } }));
jest.mock('../models/Assistance', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn()
}));
jest.mock('../models/Streak', () => ({ findByPk: jest.fn() }));
jest.mock('../models/Transaction', () => ({ create: jest.fn() }));
jest.mock('../models/Gym', () => ({ findByPk: jest.fn() }));
jest.mock('../services/frequency-service', () => ({ actualizarAsistenciaSemanal: jest.fn() }));

const assistanceService = require('../services/assistance-service');
const Assistance = require('../models/Assistance');
const Streak = require('../models/Streak');
const Gym = require('../models/Gym');
const Transaction = require('../models/Transaction');
const frequencyService = require('../services/frequency-service');
const { UserProfile } = require('../models');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('registrarAsistencia', () => {
  it('throws if assistance already exists today', async () => {
    Assistance.findOne.mockResolvedValue({});
    await expect(assistanceService.registrarAsistencia({ id_user:1,id_gym:1,latitude:0,longitude:0 })).rejects.toThrow('Ya registraste asistencia hoy.');
  });

  it('creates assistance when valid', async () => {
    Assistance.findOne
      .mockResolvedValueOnce(null) // today
      .mockResolvedValueOnce(null); // yesterday
    Gym.findByPk.mockResolvedValue({ latitude:0, longitude:0 });
    const userProfile = { id_streak: 2, tokens:0, save: jest.fn() };
    UserProfile.findByPk.mockResolvedValue(userProfile);
    const streak = { value:1, recovery_items:0, save: jest.fn() };
    Streak.findByPk.mockResolvedValue(streak);
    Assistance.create.mockResolvedValue({});
    Transaction.create.mockResolvedValue({});

    const result = await assistanceService.registrarAsistencia({ id_user:1,id_gym:1,latitude:0,longitude:0 });

    expect(Assistance.create).toHaveBeenCalled();
    expect(result).toHaveProperty('asistencia');
    expect(result).toHaveProperty('tokens_actuales', 10);
    expect(frequencyService.actualizarAsistenciaSemanal).toHaveBeenCalledWith(1);
  });
});
