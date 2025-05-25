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
    const { id_user, id_reward, id_gym } = req.body;

    if (!id_user || !id_reward || !id_gym) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }

    const result = await rewardService.canjearRecompensa({ id_user, id_reward, id_gym });
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

const obtenerEstadisticasDeRecompensas = async (req, res) => {
  try {
    const estadisticas = await rewardService.obtenerEstadisticasDeRecompensas();
    res.json(estadisticas);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  listarRecompensas,
  canjearRecompensa,
  obtenerHistorialRecompensas,
  obtenerEstadisticasDeRecompensas
};
