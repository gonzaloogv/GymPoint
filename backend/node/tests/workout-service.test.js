jest.mock('../config/database', () => ({ transaction: jest.fn() }));

jest.mock('../models/WorkoutSession', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
  count: jest.fn()
}));

jest.mock('../models/WorkoutSet', () => ({
  findAll: jest.fn(),
  create: jest.fn()
}));

jest.mock('../models/Routine', () => ({
  findByPk: jest.fn()
}));

jest.mock('../models/RoutineDay', () => ({
  findByPk: jest.fn()
}));

jest.mock('../models/Exercise', () => ({
  findByPk: jest.fn()
}));

jest.mock('../services/token-ledger-service', () => ({
  registrarMovimiento: jest.fn()
}));

const sequelize = require('../config/database');
sequelize.fn = jest.fn(() => 'fn');
sequelize.col = jest.fn(() => 'col');
sequelize.literal = jest.fn(() => 'literal');
const WorkoutSession = require('../models/WorkoutSession');
const WorkoutSet = require('../models/WorkoutSet');
const Routine = require('../models/Routine');
const RoutineDay = require('../models/RoutineDay');
const Exercise = require('../models/Exercise');
const tokenLedgerService = require('../services/token-ledger-service');

const service = require('../services/workout-service');

beforeEach(() => {
  jest.clearAllMocks();
  sequelize.transaction.mockImplementation(async (fn) => fn({ LOCK: { UPDATE: 'UPDATE' } }));
});

describe('iniciarSesion', () => {
  it('lanza error si ya existe sesión activa', async () => {
    WorkoutSession.findOne.mockResolvedValue({ id_workout_session: 1 });

    await expect(service.iniciarSesion({ id_user_profile: 1 }))
      .rejects.toThrow('Ya tienes una sesión en progreso');
  });

  it('crea sesión en progreso', async () => {
    WorkoutSession.findOne.mockResolvedValue(null);
    Routine.findByPk.mockResolvedValue({ id_routine: 2 });
    RoutineDay.findByPk.mockResolvedValue({ id_routine: 2, id_routine_day: 3 });
    WorkoutSession.create.mockResolvedValue({ id_workout_session: 5 });

    const session = await service.iniciarSesion({
      id_user_profile: 1,
      id_routine: 2,
      id_routine_day: 3
    });

    expect(session).toEqual({ id_workout_session: 5 });
  });
});

describe('registrarSet', () => {
  it('agrega set y actualiza totales', async () => {
    WorkoutSession.findByPk.mockResolvedValue({
      id_workout_session: 7,
      status: 'IN_PROGRESS',
      total_sets: 0,
      total_reps: 0,
      total_weight: 0,
      save: jest.fn()
    });
    WorkoutSet.findAll.mockResolvedValue([{ set_number: 1 }]);
    Exercise.findByPk.mockResolvedValue({ id_exercise: 4 });
    WorkoutSet.create.mockResolvedValue({ id_workout_set: 10 });

    const set = await service.registrarSet(7, { id_exercise: 4, reps: 10, weight: 20 });

    expect(set).toEqual({ id_workout_set: 10 });
    expect(WorkoutSession.findByPk).toHaveBeenCalled();
  });
});

describe('completarSesion', () => {
  it('marca sesión como completada y otorga tokens', async () => {
    WorkoutSession.findByPk.mockResolvedValue({
      id_workout_session: 9,
      id_user_profile: 3,
      status: 'IN_PROGRESS',
      started_at: new Date(Date.now() - 60000),
      total_sets: 0,
      total_reps: 0,
      total_weight: 0,
      save: jest.fn()
    });
    WorkoutSet.findAll.mockResolvedValue([{ total_sets: 1, total_reps: 10, total_weight: 200 }]);
    tokenLedgerService.registrarMovimiento.mockResolvedValue({});

    const result = await service.completarSesion(9, {});
    expect(result.status).toBe('COMPLETED');
    expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalled();
  });
});


