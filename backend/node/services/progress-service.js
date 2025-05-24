const Progress = require('../models/Progress');
const ProgressExercise = require('../models/ProgressExercise');
const { Op } = require('sequelize');

const registrarProgreso = async ({ id_user, date, body_weight, body_fat, ejercicios }) => {
  // Crear progreso general
  const progreso = await Progress.create({
    id_user,
    date,
    body_weight,
    body_fat
  });

  // Registrar ejercicios asociados
  for (const ex of ejercicios) {
    await ProgressExercise.create({
      id_progress: progreso.id_progress,
      id_exercise: ex.id_exercise,
      used_weight: ex.used_weight,
      reps: ex.reps
    });
  }

  return progreso;
};

const obtenerProgresoPorUsuario = async (id_user) => {
  return await Progress.findAll({
    where: { id_user },
    order: [['date', 'DESC']]
  });
};

const obtenerEstadisticaPeso = async (id_user) => {
  const registros = await Progress.findAll({
    where: { id_user },
    attributes: ['date', 'body_weight'],
    order: [['date', 'ASC']]
  });

  return registros;
};

const obtenerHistorialEjercicios = async (id_user) => {
  // Primero, obtenemos todos los progresos del usuario
  const progresos = await Progress.findAll({
    where: { id_user },
    attributes: ['id_progress', 'date']
  });

  // Si no hay progresos, devolvemos vacío
  if (!progresos.length) return [];

  const idMap = {};
  progresos.forEach(p => idMap[p.id_progress] = p.date);

  const ids = progresos.map(p => p.id_progress);

  // Traer todos los registros de ejercicios de esos progresos
  const ejercicios = await ProgressExercise.findAll({
    where: {
      id_progress: {
        [Op.in]: ids
      }
    }
  });

  // Enlazamos la fecha a cada registro
  return ejercicios.map(e => ({
    date: idMap[e.id_progress],
    id_exercise: e.id_exercise,
    used_weight: e.used_weight,
    reps: e.reps
  }));
};

const obtenerHistorialPorEjercicio = async (id_user, id_exercise) => {
  const progresos = await Progress.findAll({
    where: { id_user },
    attributes: ['id_progress', 'date']
  });

  if (!progresos.length) return [];

  const idMap = {};
  progresos.forEach(p => idMap[p.id_progress] = p.date);

  const ids = progresos.map(p => p.id_progress);

  const registros = await ProgressExercise.findAll({
    where: {
      id_progress: { [Op.in]: ids },
      id_exercise: id_exercise
    }
  });

  return registros.map(r => ({
    date: idMap[r.id_progress],
    used_weight: r.used_weight,
    reps: r.reps
  }));
};

const obtenerMejorLevantamiento = async (id_user, id_exercise) => {
  const progresos = await Progress.findAll({
    where: { id_user },
    attributes: ['id_progress', 'date']
  });

  if (!progresos.length) return null;

  const idMap = {};
  progresos.forEach(p => idMap[p.id_progress] = p.date);
  const ids = progresos.map(p => p.id_progress);

  const registros = await ProgressExercise.findAll({
    where: {
      id_progress: { [Op.in]: ids },
      id_exercise
    }
  });

  if (!registros.length) return null;

  const mejor = registros.reduce((max, actual) => {
    return actual.used_weight > max.used_weight ? actual : max;
  });

  return {
    date: idMap[mejor.id_progress],
    used_weight: mejor.used_weight,
    reps: mejor.reps
  };
};

const obtenerPromedioLevantamiento = async (id_user, id_exercise) => {
  const progresos = await Progress.findAll({
    where: { id_user },
    attributes: ['id_progress']
  });

  if (!progresos.length) return null;

  const ids = progresos.map(p => p.id_progress);

  const registros = await ProgressExercise.findAll({
    where: {
      id_progress: { [Op.in]: ids },
      id_exercise
    }
  });

  if (!registros.length) return null;

  const total = registros.length;
  const suma_peso = registros.reduce((sum, r) => sum + r.used_weight, 0);
  const suma_reps = registros.reduce((sum, r) => sum + r.reps, 0);

  return {
    promedio_peso: parseFloat((suma_peso / total).toFixed(2)),
    promedio_reps: parseFloat((suma_reps / total).toFixed(2))
  };
};  
  
module.exports = {
  registrarProgreso,
  obtenerProgresoPorUsuario,
  obtenerEstadisticaPeso,
  obtenerHistorialEjercicios,
  obtenerHistorialPorEjercicio,
  obtenerMejorLevantamiento,
  obtenerPromedioLevantamiento
};
