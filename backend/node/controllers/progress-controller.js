const progressService = require('../services/progress-service');

const registrarProgreso = async (req, res) => {
  try {
    const id_user = req.user.id; // token
    const { date, body_weight, body_fat, ejercicios } = req.body;

    const progreso = await progressService.registrarProgreso({
      id_user,
      date,
      body_weight,
      body_fat,
      ejercicios,
    });

    res.status(201).json(progreso);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerProgresoPorUsuario = async (req, res) => {
  try {
    const id_user = req.user.id;
    const lista = await progressService.obtenerProgresoPorUsuario(id_user);
    res.json(lista);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const obtenerEstadisticaPeso = async (req, res) => {
  try {
    const id_user = req.user.id;
    const datos = await progressService.obtenerEstadisticaPeso(id_user);
    res.json(datos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerHistorialEjercicios = async (req, res) => {
  try {
    const id_user = req.user.id;
    const data = await progressService.obtenerHistorialEjercicios(id_user);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerHistorialPorEjercicio = async (req, res) => {
  try {
    const id_user = req.user.id;
    const data = await progressService.obtenerHistorialPorEjercicio(
      id_user,
      req.params.id_exercise
    );
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerMejorLevantamiento = async (req, res) => {
  try {
    const id_user = req.user.id;
    const mejor = await progressService.obtenerMejorLevantamiento(id_user, req.params.id_exercise);
    if (!mejor) {
      return res.status(404).json({ error: 'No se encontraron registros' });
    }
    res.json(mejor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerPromedioLevantamiento = async (req, res) => {
  try {
    const id_user = req.user.id;
    const data = await progressService.obtenerPromedioLevantamiento(
      id_user,
      req.params.id_exercise
    );
    if (!data) {
      return res.status(404).json({ error: 'No se encontraron registros' });
    }
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
  obtenerPromedioLevantamiento,
};
