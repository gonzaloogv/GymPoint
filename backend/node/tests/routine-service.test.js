jest.mock('../models/UserProfile', () => ({}));
jest.mock('../models/Role', () => ({}));
jest.mock('../models', () => ({ UserProfile: {} }));
jest.mock('../config/database', () => ({ transaction: jest.fn() }));

jest.mock('../models/Routine', () => ({
  create: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn()
}));

jest.mock('../models/Exercise', () => ({}));

jest.mock('../models/RoutineExercise', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  destroy: jest.fn()
}));

jest.mock('../models/RoutineDay', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn()
}));

jest.mock('../models/WorkoutSession', () => ({
  count: jest.fn()
}));


const sequelize = require('../config/database');
sequelize.transaction = jest.fn();
const Routine = require('../models/Routine');
const RoutineExercise = require('../models/RoutineExercise');
const RoutineDay = require('../models/RoutineDay');
const WorkoutSession = require('../models/WorkoutSession');

const service = require('../services/routine-service');

beforeEach(() => {
  jest.clearAllMocks();
  sequelize.transaction.mockImplementation(async (fn) => fn({ LOCK: { UPDATE: 'UPDATE' } }));
});

  describe('getRoutineWithExercises', () => {
    it('lanza error si no encuentra la rutina', async () => {
      Routine.findByPk.mockResolvedValue(null);
      await expect(service.getRoutineWithExercises(1)).rejects.toThrow('Rutina no encontrado');
    });

    it('retorna rutina con días ordenados', async () => {
      Routine.findByPk.mockResolvedValue({
        toJSON: () => ({
          id_routine: 1,
          routine_name: 'Rutina',
          exercises: [
            { id_exercise: 2, RoutineExercise: { order: 2 } },
            { id_exercise: 1, RoutineExercise: { order: 1 } }
          ],
          days: [
            {
              day_number: 2,
              routineExercises: [{ order: 1, exercise: {} }]
            },
            {
              day_number: 1,
              routineExercises: [{ order: 2, exercise: {} }]
            }
          ]
        })
      });

      const result = await service.getRoutineWithExercises(1);
      const dayOrders = result.days.map(day => day.day_number);
      expect(dayOrders).toEqual([1, 2]);
      const exerciseOrders = result.days[0].routineExercises.map(re => re.order);
      expect(exerciseOrders.sort()).toEqual([1, 2]);
    });

  describe('createRoutineWithExercises', () => {
    it('crea rutina y ejercicios dentro de transacción', async () => {
      Routine.create.mockResolvedValue({ id_routine: 10 });
      RoutineDay.create.mockResolvedValue({ id_routine_day: 30 });
      RoutineExercise.create.mockResolvedValue({});
      const exercises = [{ id_exercise: 1, series: 3, reps: 10, order: 1 }];

      await service.createRoutineWithExercises({
        routine_name: 'Full Body',
        description: 'Desc',
        exercises,
        id_user: 5,
        days: [{ day_number: 1, title: 'Día 1' }]
      });

      expect(Routine.create).toHaveBeenCalled();
      expect(RoutineDay.create).toHaveBeenCalledWith(expect.objectContaining({ day_number: 1 }), expect.any(Object));
      expect(RoutineExercise.create).toHaveBeenCalledWith(expect.objectContaining({ id_routine: 10 }), expect.any(Object));
    });

    it('valida presencia de ejercicios', async () => {
      await expect(service.createRoutineWithExercises({ routine_name: 'A', exercises: [], id_user: 1 }))
        .rejects.toThrow('Debe incluir al menos un ejercicio en la rutina');
    });
  });

  describe('gestión de días de rutina', () => {
    it('crea día validando duplicados', async () => {
      Routine.findByPk.mockResolvedValue({ id_routine: 3 });
      RoutineDay.findOne.mockResolvedValue(null);
      RoutineDay.create.mockResolvedValue({ id_routine_day: 7 });

      const day = await service.createRoutineDay(3, { day_number: 1, title: 'Día 1' });
      expect(day).toEqual({ id_routine_day: 7 });
    });

    it('impide eliminar día con sesiones activas', async () => {
      RoutineDay.findByPk.mockResolvedValue({ id_routine_day: 8, destroy: jest.fn() });
      WorkoutSession.count.mockResolvedValue(2);

      await expect(service.eliminarRoutineDay(8)).rejects.toThrow('No se puede eliminar un día con sesiones activas');
    });
  });
});
