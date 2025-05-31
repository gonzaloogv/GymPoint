const tokenService = require('../services/token-service');

const otorgarTokens = async (req, res) => {
  try {
    const { id_user, amount, motivo } = req.body;

    if (!id_user || !amount || !motivo) {
      return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }

    const resultado = await tokenService.otorgarTokens({ id_user, amount, motivo });
    res.status(201).json(resultado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerResumenTokens = async (req, res) => {
  try {
    const id_user = req.user.id;
    const data = await tokenService.obtenerResumenTokens(id_user);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

module.exports = {
  otorgarTokens,
  obtenerResumenTokens
};
