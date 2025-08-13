jest.mock('../models/GymSpecialSchedule', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
}));

const specialService = require('../services/gym-special-schedule-service');
const GymSpecialSchedule = require('../models/GymSpecialSchedule');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('crearHorarioEspecial', () => {
  it('throws if special schedule exists', async () => {
    GymSpecialSchedule.findOne.mockResolvedValue(true);
    await expect(
      specialService.crearHorarioEspecial({ id_gym: 1, date: '2020-01-01' })
    ).rejects.toThrow();
  });
});

describe('obtenerHorariosEspecialesPorGimnasio', () => {
  it('returns list', async () => {
    const list = [1];
    GymSpecialSchedule.findAll.mockResolvedValue(list);
    const result = await specialService.obtenerHorariosEspecialesPorGimnasio(2);
    expect(result).toBe(list);
  });
});
