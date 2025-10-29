/**
 * Progress Controller - Refactorizado con Mappers (Lote 8)
 * Gestiona endpoints de progreso físico
 */

const progressService = require('../services/progress-service');
const progressMappers = require('../services/mappers/progress.mappers');
const { NotFoundError } = require('../utils/errors');

const registrarProgreso = async (req, res) => {
  try {
    const idUserProfile = req.user.id_user_profile;
    const command = progressMappers.toRegisterProgressCommand(req.body, idUserProfile);
    const progress = await progressService.registerProgress(command);
    res.status(201).json({
      message: 'Progreso registrado con éxito',
      data: progressMappers.toProgressResponse(progress)
    });
  } catch (err) {
    res.status(400).json({ error: { code: 'REGISTER_PROGRESS_FAILED', message: err.message } });
  }
};

const obtenerProgresoPorUsuario = async (req, res) => {
  try {
    const idUserProfile = req.user.id_user_profile;
    const query = progressMappers.toGetUserProgressQuery({ idUserProfile, ...req.query });
    const progressList = await progressService.getUserProgress(query);
    res.json({
      message: 'Progreso obtenido con éxito',
      data: progressMappers.toProgressListResponse(progressList)
    });
  } catch (err) {
    res.status(400).json({ error: { code: 'GET_PROGRESS_FAILED', message: err.message } });
  }
};

const obtenerEstadisticaPeso = async (req, res) => {
  try {
    const idUserProfile = req.user.id_user_profile;
    const query = progressMappers.toGetWeightStatsQuery({ idUserProfile, ...req.query });
    const stats = await progressService.getWeightStats(query);
    res.json({
      message: 'Estadísticas de peso obtenidas con éxito',
      data: progressMappers.toWeightStatsResponse(stats)
    });
  } catch (err) {
    res.status(400).json({ error: { code: 'GET_WEIGHT_STATS_FAILED', message: err.message } });
  }
};

const obtenerHistorialEjercicios = async (req, res) => {
  try {
    const idUserProfile = req.user.id_user_profile;
    const query = progressMappers.toGetExerciseHistoryQuery({ idUserProfile, ...req.query });
    const history = await progressService.getExerciseHistory(query);
    res.json({
      message: 'Historial de ejercicios obtenido con éxito',
      data: progressMappers.toExerciseHistoryResponse(history)
    });
  } catch (err) {
    res.status(400).json({ error: { code: 'GET_EXERCISE_HISTORY_FAILED', message: err.message } });
  }
};

const obtenerHistorialPorEjercicio = async (req, res) => {
  try {
    const idUserProfile = req.user.id_user_profile;
    const idExercise = Number.parseInt(req.params.id_exercise, 10);
    const query = progressMappers.toGetExerciseHistoryQuery({ idUserProfile, idExercise, ...req.query });
    const history = await progressService.getExerciseHistory(query);
    res.json({
      message: 'Historial del ejercicio obtenido con éxito',
      data: progressMappers.toExerciseHistoryResponse(history)
    });
  } catch (err) {
    res.status(400).json({ error: { code: 'GET_EXERCISE_HISTORY_FAILED', message: err.message } });
  }
};

const obtenerMejorLevantamiento = async (req, res) => {
  try {
    const idUserProfile = req.user.id_user_profile;
    const idExercise = Number.parseInt(req.params.id_exercise, 10);
    const query = progressMappers.toGetPersonalRecordQuery(idUserProfile, idExercise);
    const pr = await progressService.getPersonalRecord(query);
    if (!pr) {
      return res.status(404).json({ error: { code: 'NO_RECORDS_FOUND', message: 'No se encontraron registros para este ejercicio' } });
    }
    res.json({
      message: 'Mejor levantamiento obtenido con éxito',
      data: progressMappers.toPersonalRecordResponse(pr)
    });
  } catch (err) {
    res.status(400).json({ error: { code: 'GET_BEST_LIFT_FAILED', message: err.message } });
  }
};

const obtenerPromedioLevantamiento = async (req, res) => {
  try {
    const idUserProfile = req.user.id_user_profile;
    const idExercise = Number.parseInt(req.params.id_exercise, 10);
    const query = progressMappers.toGetExerciseAveragesQuery(idUserProfile, idExercise);
    const averages = await progressService.getExerciseAverages(query);
    if (!averages) {
      return res.status(404).json({ error: { code: 'NO_RECORDS_FOUND', message: 'No se encontraron registros para este ejercicio' } });
    }
    res.json({
      message: 'Promedio de levantamiento obtenido con éxito',
      data: progressMappers.toExerciseAveragesResponse(averages)
    });
  } catch (err) {
    res.status(400).json({ error: { code: 'GET_AVERAGE_LIFT_FAILED', message: err.message } });
  }
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
