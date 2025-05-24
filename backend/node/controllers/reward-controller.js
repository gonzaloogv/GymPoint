const rewardService = require('../services/reward-service');

const listarRecompensas = async (req, res) => {
  try {
    const recompensas = await rewardService.listarRecompensas();
    res.json(recompensas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const canjearRecompensa = async (req, res) => {
  try {
    const result = await rewardService.canjearRecompensa(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerHistorialRecompensas = async (req, res) => {
  try {
    const historial = await rewardService.obtenerHistorialRecompensas(req.params.id_user);
    res.json(historial);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  listarRecompensas,
  canjearRecompensa,
  obtenerHistorialRecompensas
};
