jest.mock('../models/GymSchedule', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn()
}));

const service = require('../services/gym-schedule-service');
const GymSchedule = require('../models/GymSchedule');

beforeEach(() => { jest.clearAllMocks(); });

describe('crearHorario', () => {
  it('throws if schedule exists for the day', async () => {
    GymSchedule.findOne.mockResolvedValue({});
    await expect(service.crearHorario({ id_gym: 1, day_of_week: 'Lunes' }))
      .rejects.toThrow('El gimnasio ya tiene registrado un horario para "Lunes".');
  });

  it('creates schedule when none exists', async () => {
    GymSchedule.findOne.mockResolvedValue(null);
    GymSchedule.create.mockResolvedValue('horario');
    const data = { id_gym: 1, day_of_week: 'Lunes', opening_time: '08:00', closing_time: '10:00', closed: false };
    const res = await service.crearHorario(data);
    expect(GymSchedule.create).toHaveBeenCalledWith(data);
    expect(res).toBe('horario');
  });
});

describe('obtenerHorariosPorGimnasio', () => {
  it('returns list of schedules', async () => {
    const horarios = ['h'];
    GymSchedule.findAll.mockResolvedValue(horarios);
    const res = await service.obtenerHorariosPorGimnasio(2);
    expect(GymSchedule.findAll).toHaveBeenCalledWith({ where: { id_gym: 2 }, order: [['id_schedule', 'ASC']] });
    expect(res).toBe(horarios);
    });
});

describe('actualizarHorario', () => {
  it('throws if schedule not found', async () => {
    GymSchedule.findByPk.mockResolvedValue(null);
    await expect(service.actualizarHorario(1, {})).rejects.toThrow('Horario no encontrado.');
  });

  it('updates existing schedule', async () => {
    const instance = { update: jest.fn().mockResolvedValue('updated') };
    GymSchedule.findByPk.mockResolvedValue(instance);
    const res = await service.actualizarHorario(1, { closed: true });
    expect(instance.update).toHaveBeenCalledWith({ closed: true });
    expect(res).toBe('updated');
  });
});