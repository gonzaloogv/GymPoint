const progressService = require('../services/progress-service');

const registrarProgreso = async (req, res) => {
  try {
    const progreso = await progressService.registrarProgreso(req.body);
    res.status(201).json(progreso);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerProgresoPorUsuario = async (req, res) => {
  try {
    const lista = await progressService.obtenerProgresoPorUsuario(req.params.id_user);
    res.json(lista);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const obtenerEstadisticaPeso = async (req, res) => {
  try {
    const datos = await progressService.obtenerEstadisticaPeso(req.params.id_user);
    res.json(datos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerHistorialEjercicios = async (req, res) => {
  try {
    const data = await progressService.obtenerHistorialEjercicios(req.params.id_user);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerHistorialPorEjercicio = async (req, res) => {
  try {
    const data = await progressService.obtenerHistorialPorEjercicio(
      req.params.id_user,
      req.params.id_exercise
    );
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerMejorLevantamiento = async (req, res) => {
  try {
    const mejor = await progressService.obtenerMejorLevantamiento(
      req.params.id_user,
      req.params.id_exercise
    );
    if (!mejor) return res.status(404).json({ error: 'No se encontraron registros' });
    res.json(mejor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerPromedioLevantamiento = async (req, res) => {
  try {
    const data = await progressService.obtenerPromedioLevantamiento(
      req.params.id_user,
      req.params.id_exercise
    );
    if (!data) return res.status(404).json({ error: 'No se encontraron registros' });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
