jest.mock('../models/UserRoutine', () => ({ findOne: jest.fn(), create: jest.fn() }));
jest.mock('../models/Routine', () => ({ findByPk: jest.fn() }));
jest.mock('../models/Exercise', () => ({}));

const service = require('../services/user-routine-service');
const {UserRoutine} = require('../models');
const {Routine} = require('../models');

beforeEach(() => { jest.clearAllMocks(); });

describe('assignRoutineToUser', () => {
  it('throws if already active', async () => {
    UserRoutine.findOne.mockResolvedValue({});
    await expect(service.assignRoutineToUser({ id_user:1,id_routine:1,start_date:'2020-01-01' })).rejects.toThrow('El usuario ya tiene una rutina activa');
  });
});

describe('getActiveRoutine', () => {
  it('returns routine', async () => {
    const r = { id_routine:1 };
    UserRoutine.findOne.mockResolvedValue(r);
    const res = await service.getActiveRoutine(1);
    expect(res).toBe(r);
  });
});