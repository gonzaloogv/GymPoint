const assistanceService = require('../services/assistance-service');

const isNil = (v) => v === undefined || v === null;

const registrarAsistencia = async (req, res) => {
  try {
    const { id_user, id_gym, latitude, longitude } = req.body || {};

    if ([id_user, id_gym, latitude, longitude].some(isNil)) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }

    const resultado = await assistanceService.registrarAsistencia({
      id_user,
      id_gym,
      latitude,
      longitude,
    });

    return res.status(201).json(resultado);
  } catch (err) {
    console.error('Error en registrarAsistencia:', err.message);
    return res.status(400).json({ error: err.message });
  }
};

const obtenerHistorialAsistencias = async (req, res) => {
  try {
    const id_user = req.user?.id;
    if (isNil(id_user)) {
      return res.status(400).json({ error: 'Usuario no autenticado.' });
    }
    const historial = await assistanceService.obtenerHistorialAsistencias(id_user);
    return res.json(historial);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

module.exports = {
  registrarAsistencia,
  obtenerHistorialAsistencias,
};
