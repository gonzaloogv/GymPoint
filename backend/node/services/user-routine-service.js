const UserRoutine = require('../models/UserRoutine');
const Routine = require('../models/Routine');
const Exercise = require('../models/Exercise');

const assignRoutineToUser = async ({ id_user, id_routine, start_date }) => {
  // Verificar si ya tiene una rutina activa
  const existing = await UserRoutine.findOne({
    where: { id_user, active: true }
  });

  if (existing) {
    throw new Error('El usuario ya tiene una rutina activa');
  }

  const userRoutine = await UserRoutine.create({
    id_user,
    id_routine,
    start_date,
    active: true
  });

  return userRoutine;
};

const getActiveRoutine = async (id_user) => {
  return await UserRoutine.findOne({
    where: { id_user, active: true }
  });
};

const endUserRoutine = async (id_user) => {
  const routine = await UserRoutine.findOne({ where: { id_user, active: true } });
  if (!routine) throw new Error('No hay rutina activa para cerrar');

  routine.active = false;
  routine.finish_date = new Date();
  await routine.save();

  return routine;
};

const getActiveRoutineWithExercises = async (id_user) => {
    const active = await UserRoutine.findOne({
      where: { id_user, active: true }
    });
  
    if (!active) {
      throw new Error('El usuario no tiene una rutina activa');
    }
  
    const routine = await Routine.findByPk(active.id_routine, {
      include: {
        model: Exercise,
        through: {
          attributes: ['series', 'reps', 'order']
        }
      }
    });
  
    if (!routine) throw new Error('Rutina activa no encontrada');
  
    // Ordenar ejercicios por order
    routine.Exercises.sort((a, b) => {
      return a.RoutineExercise.order - b.RoutineExercise.order;
    });
  
    return routine;
};

module.exports = {
  assignRoutineToUser,
  getActiveRoutine,
  endUserRoutine,
  getActiveRoutineWithExercises
};
