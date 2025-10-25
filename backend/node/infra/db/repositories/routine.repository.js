/**
 * Routine Repository - Lote 7
 * Data access layer for Routine, RoutineDay, and RoutineExercise with explicit projections
 */

const Routine = require('../../../models/Routine');
const RoutineDay = require('../../../models/RoutineDay');
const RoutineExercise = require('../../../models/RoutineExercise');
const Exercise = require('../../../models/Exercise');
const { UserProfile } = require('../../../models');
const { toRoutine, toRoutines, toRoutineDay, toRoutineDays, toRoutineExercise, toRoutineExercises } = require('../mappers/routine.mapper');
const { Op } = require('sequelize');

// ==================== Routine Operations ====================

async function createRoutine(payload, options = {}) {
  const routine = await Routine.create(payload, { transaction: options.transaction });
  return toRoutine(routine);
}

async function findRoutineById(idRoutine, options = {}) {
  const includeOptions = [];

  if (options.includeCreator) {
    includeOptions.push({
      model: UserProfile,
      as: 'creator',
      attributes: ['id_user_profile', 'name', 'lastname']
    });
  }

  if (options.includeDays) {
    includeOptions.push({
      model: RoutineDay,
      as: 'days',
      order: [['day_number', 'ASC']]
    });
  }

  if (options.includeExercises) {
    includeOptions.push({
      model: Exercise,
      as: 'Exercises', // Usar el alias correcto con mayúscula
      through: {
        attributes: ['sets', 'reps', 'exercise_order', 'id_routine_day']
      }
    });
  }

  const routine = await Routine.findByPk(idRoutine, {
    include: includeOptions.length > 0 ? includeOptions : undefined,
    transaction: options.transaction
  });

  return toRoutine(routine);
}

async function findRoutineWithExercises(idRoutine, options = {}) {
  const routine = await Routine.findByPk(idRoutine, {
    attributes: ['id_routine', 'routine_name', 'description', 'created_by', 'is_template', 'recommended_for', 'template_order'],
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
                attributes: ['id_exercise', 'exercise_name', 'muscular_group']
              }
            ]
          }
        ],
        order: [['day_number', 'ASC']]
      },
      {
        model: Exercise,
        as: 'Exercises', // Usar el alias correcto con mayúscula
        through: {
          attributes: ['sets', 'reps', 'exercise_order', 'id_routine_day']
        }
      }
    ],
    transaction: options.transaction
  });

  return toRoutine(routine);
}

async function findRoutinesByUser(idUser, options = {}) {
  const where = { created_by: idUser };

  if (options.isTemplate !== undefined) {
    where.is_template = options.isTemplate;
  }

  const queryOptions = {
    where,
    transaction: options.transaction
  };

  if (options.pagination) {
    queryOptions.limit = options.pagination.limit;
    queryOptions.offset = options.pagination.offset;
  }

  const routines = await Routine.findAll(queryOptions);
  return toRoutines(routines);
}

async function findRoutineTemplates(options = {}) {
  const { pagination = {}, sort = {} } = options;

  const queryOptions = {
    where: { is_template: true },
    limit: pagination.limit || 20,
    offset: pagination.offset || 0,
    transaction: options.transaction
  };

  if (sort.field) {
    queryOptions.order = [[sort.field, sort.order || 'ASC']];
  } else {
    queryOptions.order = [['routine_name', 'ASC']];
  }

  const { rows, count } = await Routine.findAndCountAll(queryOptions);
  return { rows: toRoutines(rows), count };
}

async function updateRoutine(idRoutine, payload, options = {}) {
  const routine = await Routine.findByPk(idRoutine, { transaction: options.transaction });
  if (!routine) throw new Error('Routine not found');

  await routine.update(payload, { transaction: options.transaction });
  return toRoutine(routine);
}

async function deleteRoutine(idRoutine, options = {}) {
  const routine = await Routine.findByPk(idRoutine, { transaction: options.transaction });
  if (!routine) throw new Error('Routine not found');

  await routine.destroy({ transaction: options.transaction });
  return true;
}

// ==================== RoutineDay Operations ====================

async function createRoutineDay(payload, options = {}) {
  const day = await RoutineDay.create(payload, { transaction: options.transaction });
  return toRoutineDay(day);
}

async function findRoutineDayById(idRoutineDay, options = {}) {
  const day = await RoutineDay.findByPk(idRoutineDay, { transaction: options.transaction });
  return toRoutineDay(day);
}

async function findRoutineDaysByRoutine(idRoutine, options = {}) {
  const days = await RoutineDay.findAll({
    where: { id_routine: idRoutine },
    order: [['day_number', 'ASC']],
    transaction: options.transaction
  });
  return toRoutineDays(days);
}

async function findRoutineDayByRoutineAndNumber(idRoutine, dayNumber, options = {}) {
  const day = await RoutineDay.findOne({
    where: { id_routine: idRoutine, day_number: dayNumber },
    transaction: options.transaction
  });
  return toRoutineDay(day);
}

async function updateRoutineDay(idRoutineDay, payload, options = {}) {
  const day = await RoutineDay.findByPk(idRoutineDay, { transaction: options.transaction });
  if (!day) throw new Error('RoutineDay not found');

  await day.update(payload, { transaction: options.transaction });
  return toRoutineDay(day);
}

async function deleteRoutineDay(idRoutineDay, options = {}) {
  const day = await RoutineDay.findByPk(idRoutineDay, { transaction: options.transaction });
  if (!day) throw new Error('RoutineDay not found');

  await day.destroy({ transaction: options.transaction });
  return true;
}

// ==================== RoutineExercise Operations ====================

async function createRoutineExercise(payload, options = {}) {
  const routineExercise = await RoutineExercise.create(payload, { transaction: options.transaction });
  return toRoutineExercise(routineExercise);
}

async function findRoutineExercise(idRoutine, idExercise, options = {}) {
  const routineExercise = await RoutineExercise.findOne({
    where: { id_routine: idRoutine, id_exercise: idExercise },
    transaction: options.transaction
  });
  return toRoutineExercise(routineExercise);
}

async function findRoutineExercisesByRoutine(idRoutine, options = {}) {
  const where = { id_routine: idRoutine };

  if (options.idRoutineDay !== undefined) {
    where.id_routine_day = options.idRoutineDay;
  }

  const routineExercises = await RoutineExercise.findAll({
    where,
    order: [['order', 'ASC']],
    transaction: options.transaction
  });
  return toRoutineExercises(routineExercises);
}

async function updateRoutineExercise(idRoutine, idExercise, payload, options = {}) {
  const routineExercise = await RoutineExercise.findOne({
    where: { id_routine: idRoutine, id_exercise: idExercise },
    transaction: options.transaction
  });

  if (!routineExercise) throw new Error('RoutineExercise not found');

  await routineExercise.update(payload, { transaction: options.transaction });
  return toRoutineExercise(routineExercise);
}

async function deleteRoutineExercise(idRoutine, idExercise, options = {}) {
  const deleted = await RoutineExercise.destroy({
    where: { id_routine: idRoutine, id_exercise: idExercise },
    transaction: options.transaction
  });

  return deleted > 0;
}

module.exports = {
  // Routine
  createRoutine,
  findRoutineById,
  findRoutineWithExercises,
  findRoutinesByUser,
  findRoutineTemplates,
  updateRoutine,
  deleteRoutine,

  // RoutineDay
  createRoutineDay,
  findRoutineDayById,
  findRoutineDaysByRoutine,
  findRoutineDayByRoutineAndNumber,
  updateRoutineDay,
  deleteRoutineDay,

  // RoutineExercise
  createRoutineExercise,
  findRoutineExercise,
  findRoutineExercisesByRoutine,
  updateRoutineExercise,
  deleteRoutineExercise
};
