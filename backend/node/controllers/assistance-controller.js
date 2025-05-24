const assistanceService = require('../services/assistance-service');

const registrarAsistencia = async (req, res) => {
  try {
    const { id_user, id_gym, id_streak } = req.body;

    if (!id_user || !id_gym || !id_streak) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }

    const asistencia = await assistanceService.registrarAsistencia({ id_user, id_gym, id_streak });

    res.status(201).json(asistencia);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { 
    registrarAsistencia 
};
