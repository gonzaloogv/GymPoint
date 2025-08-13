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
    const id_user = req.user.id;
    const { id_reward, id_gym } = req.body;

    if (!id_reward || !id_gym) {
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
    const id_user = req.user.id;
    const historial = await rewardService.obtenerHistorialRecompensas(id_user);
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

const crearRecompensa = async (req, res) => {
  try {
    const { name, description, cost_tokens, type, stock, start_date, finish_date } = req.body;

    if (!name || !description || !cost_tokens || !type || !stock || !start_date || !finish_date) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }

    const recompensa = await rewardService.crearRecompensa({
      name,
      description,
      cost_tokens,
      type,
      stock,
      start_date,
      finish_date,
    });

    res.status(201).json(recompensa);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  listarRecompensas,
  canjearRecompensa,
  obtenerHistorialRecompensas,
  obtenerEstadisticasDeRecompensas,
  crearRecompensa,
};
