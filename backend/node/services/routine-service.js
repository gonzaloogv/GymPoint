const Routine = require('../models/Routine');
const Exercise = require('../models/Exercise');
const RoutineExercise = require('../models/RoutineExercise');
const { UserProfile } = require('../models');

/**
 * Obtener rutina con sus ejercicios
 * @param {number} id_routine - ID de la rutina
 * @returns {Promise<Routine>} Rutina con ejercicios ordenados
 */
const getRoutineWithExercises = async (id_routine) => {
  const rutina = await Routine.findByPk(id_routine, {
    attributes: ['id_routine', 'routine_name', 'description', 'created_by'],
    include: [
      {
        model: Exercise,
        as: 'exercises',
        through: {
          attributes: ['series', 'reps', 'order']
        }
      },
      {
        model: UserProfile,
        as: 'creator',
        attributes: ['name', 'lastname'],
        required: false
      }
    ]
  });

  if (!rutina) {
    throw new Error('Rutina no encontrada');
  }

  // ordena ejercicios por order
  if (rutina.exercises) {
    rutina.exercises.sort((a, b) => {
      return a.RoutineExercise.order - b.RoutineExercise.order;
    });
  }

  return rutina;
};

/**
 * Crear rutina con ejercicios
 * @param {Object} data - Datos de la rutina
 * @param {string} data.routine_name - Nombre de la rutina
 * @param {string} data.description - Descripción
 * @param {Array} data.exercises - Lista de ejercicios
 * @param {number} data.id_user - ID del user_profile creador
 * @returns {Promise<Routine>} Rutina creada
 */
const createRoutineWithExercises = async ({ routine_name, description, exercises, id_user }) => {
  // id_user ahora es id_user_profile (created_by en tabla)
  const rutina = await Routine.create({ 
    routine_name, 
    description, 
    created_by: id_user 
  });

  for (const ex of exercises) {
    await RoutineExercise.create({
      id_routine: rutina.id_routine,
      id_exercise: ex.id_exercise,
      series: ex.series,
      reps: ex.reps,
      order: ex.order
    });
  }

  return rutina;
};

const updateRoutine = async (id, data) => {
    const rutina = await Routine.findByPk(id);
    if (!rutina) throw new Error('Rutina no encontrada');
    return await rutina.update(data);
};

const updateRoutineExercise = async (id_routine, id_exercise, data) => {
    const entry = await RoutineExercise.findOne({
      where: { id_routine, id_exercise }
    });
  
    if (!entry) throw new Error('Ejercicio no encontrado en la rutina');
  
    return await entry.update(data);
};

const deleteRoutine = async (id) => {
    const rutina = await Routine.findByPk(id);
    if (!rutina) throw new Error('Rutina no encontrada');
    return await rutina.destroy();
};

const deleteRoutineExercise = async (id_routine, id_exercise) => {
    const deleted = await RoutineExercise.destroy({
      where: { id_routine, id_exercise }
    });
  
    if (!deleted) {
      throw new Error('Ejercicio no encontrado en la rutina');
    }
  
    return deleted;
};

const getRoutinesByUser = async (id_user) => {
    return await Routine.findAll({
      where: { created_by: id_user }
    });
};

module.exports = {
  getRoutineWithExercises,
  createRoutineWithExercises,
  updateRoutine,
  updateRoutineExercise,
  deleteRoutine,
  deleteRoutineExercise,
  getRoutinesByUser
};
