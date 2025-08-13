const assistanceService = require('../services/assistance-service');

const registrarAsistencia = async (req, res) => {
  try {
    const { id_user, id_gym, latitude, longitude } = req.body;

    // validacion
    if (id_user === null || id_gym === null || latitude === null || longitude === null) {
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
    const id_user = req.user.id;
    const historial = await assistanceService.obtenerHistorialAsistencias(id_user);
    res.json(historial);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  registrarAsistencia,
  obtenerHistorialAsistencias,
};
