const tokenService = require('../services/token-service');

const otorgarTokens = async (req, res) => {
  try {
    const resultado = await tokenService.otorgarTokens(req.body);
    res.status(201).json(resultado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
const obtenerResumenTokens = async (req, res) => {
    try {
      const data = await tokenService.obtenerResumenTokens(req.params.id_user);
      res.json(data);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
};

module.exports = {
  otorgarTokens,
  obtenerResumenTokens
};
