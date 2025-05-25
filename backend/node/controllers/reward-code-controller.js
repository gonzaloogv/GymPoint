const rewardCodeService = require('../services/reward-code-service');

const obtenerCodigosPorUsuario = async (req, res) => {
    try {
      const { used } = req.query;
      const codigos = await rewardCodeService.obtenerCodigosPorUsuario(req.params.id_user, used);
      res.json(codigos);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
};

const marcarComoUsado = async (req, res) => {
    try {
      const codigo = await rewardCodeService.marcarComoUsado(req.params.id_code);
      res.json({
        mensaje: 'Código marcado como usado',
        codigo
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
};
  
const obtenerEstadisticasPorGimnasio = async (req, res) => {
    try {
      const resultado = await rewardCodeService.obtenerEstadisticasPorGimnasio();
      res.json(resultado);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
};

const obtenerCodigosActivos = async (req, res) => {
    try {
      const codigos = await rewardCodeService.obtenerCodigosActivos(req.params.id_user);
      res.json(codigos);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
};

const obtenerCodigosExpirados = async (req, res) => {
    try {
      const codigos = await rewardCodeService.obtenerCodigosExpirados(req.params.id_user);
      res.json(codigos);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
};
  
module.exports = {
  obtenerCodigosPorUsuario,
  marcarComoUsado,
  obtenerEstadisticasPorGimnasio,
  obtenerCodigosActivos,
  obtenerCodigosExpirados
};
