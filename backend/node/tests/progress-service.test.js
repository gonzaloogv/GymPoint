jest.mock('../models/Progress', () => ({ create: jest.fn(), findAll: jest.fn() }));
jest.mock('../models/ProgressExercise', () => ({ create: jest.fn(), findAll: jest.fn() }));

const service = require('../services/progress-service');
const Progress = require('../models/Progress');
const ProgressExercise = require('../models/ProgressExercise');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('registrarProgreso', () => {
  it('creates progress and exercises', async () => {
    Progress.create.mockResolvedValue({ id_progress: 1 });
    const ex = [{ id_exercise: 1, used_weight: 10, reps: 5 }];
    ProgressExercise.create.mockResolvedValue({});
    const res = await service.registrarProgreso({
      id_user: 1,
      date: '2020-01-01',
      body_weight: 1,
      body_fat: 1,
      ejercicios: ex,
    });
    expect(Progress.create).toHaveBeenCalled();
    expect(ProgressExercise.create).toHaveBeenCalled();
    expect(res.id_progress).toBe(1);
  });
});

describe('obtenerMejorLevantamiento', () => {
  it('returns null if no data', async () => {
    Progress.findAll.mockResolvedValue([]);
    const res = await service.obtenerMejorLevantamiento(1, 1);
    expect(res).toBeNull();
  });
});
