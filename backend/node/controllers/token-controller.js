const tokenService = require('../services/token-service');

const otorgarTokens = async (req, res) => {
  try {
    const { id_user, amount, motive } = req.body;

    if (!id_user || !amount || !motive) {
      return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }

    const resultado = await tokenService.otorgarTokens({ id_user, amount, motive});
    res.status(201).json(resultado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerResumenTokens = async (req, res) => {
  try {
    const id_user = req.user.id_user_profile;
    const data = await tokenService.obtenerResumenTokens(id_user);
    res.json({
      data,
      message: 'Resumen de tokens obtenido con éxito'
    });
  } catch (err) {
    res.status(404).json({
      error: {
        code: 'GET_TOKEN_SUMMARY_FAILED',
        message: err.message
      }
    });
  }
};

module.exports = {
  otorgarTokens,
  obtenerResumenTokens
};
