const assistanceService = require('../services/assistance-service');

const registrarAsistencia = async (req, res) => {
  try {
    const { id_user, id_gym, id_streak, latitude, longitude } = req.body;

    if (!id_user || !id_gym || !id_streak || !latitude || !longitude) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }

    const resultado = await assistanceService.registrarAsistencia({
      id_user,
      id_gym,
      id_streak,
      latitude,
      longitude
    });

    res.status(201).json(resultado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerHistorialAsistencias = async (req, res) => {
  try {
    const historial = await assistanceService.obtenerHistorialAsistencias(req.params.id_user);
    res.json(historial);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { 
  registrarAsistencia,
  obtenerHistorialAsistencias
};
