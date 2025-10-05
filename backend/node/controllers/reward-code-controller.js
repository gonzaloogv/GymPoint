const rewardCodeService = require('../services/reward-code-service');

const obtenerCodigosPorUsuario = async (req, res) => {
  try {
    const { used } = req.query;
    const id_user = req.user.id_user_profile;
    const codigos = await rewardCodeService.obtenerCodigosPorUsuario(id_user, used);
    res.json({ data: codigos, message: 'Códigos obtenidos con éxito' });
  } catch (err) {
    res.status(400).json({ error: { code: 'GET_CODES_FAILED', message: err.message } });
  }
};

const marcarComoUsado = async (req, res) => {
  try {
    const codigo = await rewardCodeService.marcarComoUsado(req.params.id_code);
    res.json({
      message: 'Código marcado como usado',
      codigo
    });
  } catch (err) {
    res.status(400).json({ error: { code: 'MARK_AS_USED_FAILED', message: err.message } });
  }
};

const obtenerEstadisticasPorGimnasio = async (req, res) => {
  try {
    const resultado = await rewardCodeService.obtenerEstadisticasPorGimnasio();
    res.json({ data: resultado, message: 'Estadísticas obtenidas con éxito' });
    } catch (err) {
    res.status(400).json({ error: { code: 'GET_STATS_FAILED', message: err.message } });
  }
};

const obtenerCodigosActivos = async (req, res) => {
  try {
    const id_user = req.user.id_user_profile;
    const codigos = await rewardCodeService.obtenerCodigosActivos(id_user);
    res.json({ data: codigos, message: 'Códigos activos obtenidos con éxito' });
  } catch (err) {
    res.status(400).json({ error: { code: 'GET_ACTIVE_CODES_FAILED', message: err.message } });
  }
};

const obtenerCodigosExpirados = async (req, res) => {
  try {
    const id_user = req.user.id_user_profile;
    const codigos = await rewardCodeService.obtenerCodigosExpirados(id_user);
    res.json({ message: 'Códigos expirados obtenidos con éxito', data: codigos });
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