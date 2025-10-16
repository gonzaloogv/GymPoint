const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Routine = require('../models/Routine');
const Exercise = require('../models/Exercise');
const RoutineExercise = require('../models/RoutineExercise');
const RoutineDay = require('../models/RoutineDay');
const WorkoutSession = require('../models/WorkoutSession');
// const { UserProfile } = require('../models'); // already imported above
const { NotFoundError, ValidationError, BusinessError } = require('../utils/errors');
const { SUBSCRIPTION_TYPES } = require('../config/constants');
const UserImportedRoutine = require('../models/UserImportedRoutine');
const { UserProfile } = require('../models');

const getUserRoutineCounts = async (idUserProfile) => {
  const totalOwned = await Routine.count({ where: { created_by: idUserProfile, is_template: false } });
  const importedCount = await UserImportedRoutine.count({ where: { id_user_profile: idUserProfile } });
  const createdCount = Math.max(0, totalOwned - importedCount);
  return { totalOwned, importedCount, createdCount };
};

/**
 * Obtener una rutina con días y ejercicios
 */
const getRoutineWithExercises = async (id_routine) => {
  const rutina = await Routine.findByPk(id_routine, {
    attributes: ['id_routine', 'routine_name', 'description', 'created_by'],
    include: [
      {
        model: UserProfile,
        as: 'creator',
        attributes: ['name', 'lastname'],
        required: false
      },
      {
        model: RoutineDay,
        as: 'days',
        include: [
          {
            model: RoutineExercise,
            as: 'routineExercises',
            include: [
              {
                model: Exercise,
                as: 'exercise',
                attributes: ['id_exercise', 'exercise_name', 'category']
              }
            ]
          }
        ],
        order: [['day_number', 'ASC']]
      },
      {
        model: Exercise,
        as: 'exercises',
        through: {
          attributes: ['series', 'reps', 'order', 'id_routine_day']
        }
      }
    ]
  });

  if (!rutina) {
    throw new NotFoundError('Rutina');
  }

  const json = rutina.toJSON();

  if (json.exercises) {
    json.exercises.sort((a, b) => a.RoutineExercise.order - b.RoutineExercise.order);
  }

  if (json.days) {
    json.days = json.days
      .sort((a, b) => a.day_number - b.day_number)
      .map((day) => ({
        ...day,
        routineExercises: (day.routineExercises || [])
          .sort((a, b) => a.order - b.order)
          .map((re) => ({
            id_routine: re.id_routine,
            id_exercise: re.id_exercise,
            id_routine_day: re.id_routine_day,
            series: re.series,
            reps: re.reps,
            order: re.order,
            exercise: re.exercise
          }))
      }));
  }

  return json;
};

/**
 * Crear rutina con ejercicios y días opcionales
 */
const createRoutineWithExercises = async ({
  routine_name,
  description,
  exercises,
  id_user,
  days = []
}) => {
  if (!Array.isArray(exercises) || exercises.length === 0) {
    throw new ValidationError('Debe incluir al menos un ejercicio en la rutina');
  }

  // Limites por suscripción
  const profile = await UserProfile.findByPk(id_user, { attributes: ['subscription'] });
  const subscription = profile?.subscription || SUBSCRIPTION_TYPES.FREE;
  const { totalOwned } = await getUserRoutineCounts(id_user);
  
  if (subscription === SUBSCRIPTION_TYPES.FREE) {
    if (totalOwned >= 5) {
      throw new BusinessError(
        'Límite total de rutinas para usuario FREE (máx 5 entre creadas e importadas)',
        'LIMIT_EXCEEDED'
      );
    }
  } else if (subscription === SUBSCRIPTION_TYPES.PREMIUM) {
    if (totalOwned >= 20) {
      throw new BusinessError('Límite total de rutinas para usuario PREMIUM (máx 20)', 'LIMIT_EXCEEDED');
    }
  }

  return sequelize.transaction(async (transaction) => {
    const rutina = await Routine.create({
      routine_name,
      description,
      created_by: id_user
    }, { transaction });

    const dayMap = new Map();

    if (Array.isArray(days)) {
      for (const day of days) {
        if (typeof day.day_number !== 'number') {
          throw new ValidationError('Cada día debe especificar day_number');
        }

        const routineDay = await RoutineDay.create({
          id_routine: rutina.id_routine,
          day_number: day.day_number,
          title: day.title || null,
          description: day.description || null
        }, { transaction });

        dayMap.set(day.day_number, routineDay.id_routine_day);
      }
    }

    for (const ex of exercises) {
      await RoutineExercise.create({
        id_routine: rutina.id_routine,
        id_exercise: ex.id_exercise,
        series: ex.series,
        reps: ex.reps,
        order: ex.order,
        id_routine_day: typeof ex.day_number === 'number'
          ? (dayMap.get(ex.day_number) || null)
          : null
      }, { transaction });
    }

    return rutina;
  });
};

const updateRoutine = async (id, data) => {
  const rutina = await Routine.findByPk(id);
  if (!rutina) throw new NotFoundError('Rutina');
  return rutina.update(data);
};

const updateRoutineExercise = async (id_routine, id_exercise, data) => {
  const entry = await RoutineExercise.findOne({
    where: { id_routine, id_exercise }
  });

  if (!entry) throw new NotFoundError('Ejercicio en la rutina');

  return entry.update(data);
};

const deleteRoutine = async (id) => {
  const rutina = await Routine.findByPk(id);
  if (!rutina) throw new NotFoundError('Rutina');
  return rutina.destroy();
};

const deleteRoutineExercise = async (id_routine, id_exercise) => {
  const deleted = await RoutineExercise.destroy({
    where: { id_routine, id_exercise }
  });

  if (!deleted) {
    throw new NotFoundError('Ejercicio en la rutina');
  }

  return deleted;
};

const getRoutinesByUser = async (id_user) => {
  return Routine.findAll({
    where: { created_by: id_user }
  });
};

const createRoutineDay = async (id_routine, { day_number, title, description }) => {
  const routine = await Routine.findByPk(id_routine);
  if (!routine) throw new NotFoundError('Rutina');

  if (typeof day_number !== 'number') {
    throw new ValidationError('day_number es requerido');
  }

  const existing = await RoutineDay.findOne({
    where: { id_routine, day_number }
  });
  if (existing) {
    throw new ValidationError('Ese número de día ya existe en la rutina');
  }

  return RoutineDay.create({
    id_routine,
    day_number,
    title: title || null,
    description: description || null
  });
};

const listarRoutineDays = async (id_routine) => {
  const routine = await Routine.findByPk(id_routine, { attributes: ['id_routine'] });
  if (!routine) throw new NotFoundError('Rutina');

  return RoutineDay.findAll({
    where: { id_routine },
    order: [['day_number', 'ASC']]
  });
};

const actualizarRoutineDay = async (id_routine_day, data) => {
  const day = await RoutineDay.findByPk(id_routine_day);
  if (!day) throw new NotFoundError('Día de rutina');

  if (data.day_number && data.day_number !== day.day_number) {
    const existing = await RoutineDay.findOne({
      where: {
        id_routine: day.id_routine,
        day_number: data.day_number,
        id_routine_day: { [Op.ne]: id_routine_day }
      }
    });
    if (existing) {
      throw new ValidationError('Ese número de día ya existe');
    }
  }

  return day.update({
    day_number: data.day_number ?? day.day_number,
    title: data.title ?? day.title,
    description: data.description ?? day.description
  });
};

const eliminarRoutineDay = async (id_routine_day) => {
  const day = await RoutineDay.findByPk(id_routine_day);
  if (!day) throw new NotFoundError('Día de rutina');

  const activeSessions = await WorkoutSession.count({
    where: {
      id_routine_day,
      status: 'IN_PROGRESS'
    }
  });

  if (activeSessions > 0) {
    throw new ValidationError('No se puede eliminar un día con sesiones activas');
  }

  await day.destroy();
  return true;
};

module.exports = {
  getRoutineWithExercises,
  createRoutineWithExercises,
  updateRoutine,
  updateRoutineExercise,
  deleteRoutine,
  deleteRoutineExercise,
  getRoutinesByUser,
  createRoutineDay,
  listarRoutineDays,
  actualizarRoutineDay,
  eliminarRoutineDay
};
