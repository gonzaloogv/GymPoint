const Progress = require('../models/Progress');
const ProgressExercise = require('../models/ProgressExercise');
const { UserProfile } = require('../models');
const { Op } = require('sequelize');

/**
 * Registrar progreso físico de un usuario
 * @param {Object} data - Datos del progreso
 * @param {number} data.id_user - ID del user_profile
 * @param {string} data.date - Fecha del registro
 * @param {number} data.body_weight - Peso corporal
 * @param {number} data.body_fat - Grasa corporal
 * @param {Array} data.ejercicios - Lista de ejercicios realizados
 * @returns {Promise<Progress>} Progreso creado
 */
const registrarProgreso = async ({ id_user, date, body_weight, body_fat, ejercicios }) => {
  // id_user ahora es id_user_profile
  const progreso = await Progress.create({
    id_user,
    date,
    body_weight,
    body_fat
  });

  // registrar ejercicios asociados
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

/**
 * Obtener todo el progreso de un usuario
 * @param {number} idUserProfile - ID del user_profile
 * @returns {Promise<Array>} Lista de progresos
 */
const obtenerProgresoPorUsuario = async (idUserProfile) => {
  return await Progress.findAll({
    where: { id_user: idUserProfile },
    include: {
      model: UserProfile,
      as: 'userProfile',
      attributes: ['name', 'lastname']
    },
    order: [['date', 'DESC']]
  });
};

/**
 * Obtener estadísticas de peso de un usuario
 * @param {number} idUserProfile - ID del user_profile
 * @returns {Promise<Array>} Lista de registros de peso
 */
const obtenerEstadisticaPeso = async (idUserProfile) => {
  const registros = await Progress.findAll({
    where: { id_user: idUserProfile },
    attributes: ['date', 'body_weight'],
    order: [['date', 'ASC']]
  });

  return registros;
};

/**
 * Obtener historial de ejercicios de un usuario
 * @param {number} idUserProfile - ID del user_profile
 * @returns {Promise<Array>} Lista de ejercicios con fechas
 */
const obtenerHistorialEjercicios = async (idUserProfile) => {
  // obtener progresos de usuario
  const progresos = await Progress.findAll({
    where: { id_user: idUserProfile },
    attributes: ['id_progress', 'date']
  });

  // si no hay progresos devolvemos vacio
  if (!progresos.length) return [];

  const idMap = {};
  progresos.forEach(p => idMap[p.id_progress] = p.date);

  const ids = progresos.map(p => p.id_progress);

  // traer registros de ejercicios de esos progresos
  const ejercicios = await ProgressExercise.findAll({
    where: {
      id_progress: {
        [Op.in]: ids
      }
    }
  });

  // enlazamos la fecha a cada registro
  return ejercicios.map(e => ({
    date: idMap[e.id_progress],
    id_exercise: e.id_exercise,
    used_weight: e.used_weight,
    reps: e.reps
  }));
};

/**
 * Obtener historial de un ejercicio específico de un usuario
 * @param {number} idUserProfile - ID del user_profile
 * @param {number} id_exercise - ID del ejercicio
 * @returns {Promise<Array>} Historial del ejercicio
 */
const obtenerHistorialPorEjercicio = async (idUserProfile, id_exercise) => {
  const progresos = await Progress.findAll({
    where: { id_user: idUserProfile },
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

/**
 * Obtener mejor levantamiento de un ejercicio de un usuario
 * @param {number} idUserProfile - ID del user_profile
 * @param {number} id_exercise - ID del ejercicio
 * @returns {Promise<Object>} Mejor levantamiento
 */
const obtenerMejorLevantamiento = async (idUserProfile, id_exercise) => {
  const progresos = await Progress.findAll({
    where: { id_user: idUserProfile },
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

/**
 * Obtener promedio de levantamiento de un ejercicio de un usuario
 * @param {number} idUserProfile - ID del user_profile
 * @param {number} id_exercise - ID del ejercicio
 * @returns {Promise<Object>} Promedios de peso y reps
 */
const obtenerPromedioLevantamiento = async (idUserProfile, id_exercise) => {
  const progresos = await Progress.findAll({
    where: { id_user: idUserProfile },
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
