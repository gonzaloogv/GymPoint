jest.mock('../models/Routine', () => ({ create: jest.fn(), findByPk: jest.fn(), findAll: jest.fn() }));
jest.mock('../models/Exercise', () => ({}));
jest.mock('../models/RoutineExercise', () => ({ create: jest.fn(), findOne: jest.fn(), destroy: jest.fn() }));

const service = require('../services/routine-service');
const {Routine} = require('../models');
const {RoutineExercise} = require('../models');

beforeEach(() => { jest.clearAllMocks(); });

describe('getRoutineWithExercises', () => {
  it('throws when not found', async () => {
    Routine.findByPk.mockResolvedValue(null);
    await expect(service.getRoutineWithExercises(1)).rejects.toThrow('Rutina no encontrada');
  });
});

describe('createRoutineWithExercises', () => {
  it('creates routine and exercises', async () => {
    Routine.create.mockResolvedValue({ id_routine:1, toJSON:()=>({}) });
    const exercises = [{ id_exercise:1, series:1, reps:1, order:1 }];
    RoutineExercise.create.mockResolvedValue({});
    const res = await service.createRoutineWithExercises({ routine_name:'r', description:'d', exercises, id_user:1 });
    expect(Routine.create).toHaveBeenCalled();
    expect(RoutineExercise.create).toHaveBeenCalledWith(expect.objectContaining({ id_routine:1 }));
    expect(res.id_routine).toBe(1);
  });
});