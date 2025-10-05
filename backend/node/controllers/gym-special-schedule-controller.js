const service = require('../services/gym-special-schedule-service');

const crearHorarioEspecial = async (req, res) => {
  try {
    const { id_gym, date, opening_time, closing_time, closed, motive } = req.body;
    if (!id_gym || !date || closed === undefined) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }

    const resultado = await service.crearHorarioEspecial({
      id_gym,
      date,
      opening_time,
      closing_time,
      closed,
      motive
    });

    res.status(201).json({ data: resultado, message: 'Horario especial creado con éxito' });
  } catch (err) {
    res.status(400).json({ error: { code: 'CREATE_SPECIAL_SCHEDULE_FAILED', message: err.message } });
  }
};

const obtenerHorariosEspecialesPorGimnasio = async (req, res) => {
  try {
    const resultado = await service.obtenerHorariosEspecialesPorGimnasio(req.params.id_gym);
    res.json({ data: resultado, message: 'Horarios especiales obtenidos con éxito' });
  } catch (err) {
    res.status(400).json({ error: { code: 'GET_SPECIAL_SCHEDULE_FAILED', message: err.message } });
  }
};

module.exports = {
  crearHorarioEspecial,
  obtenerHorariosEspecialesPorGimnasio
};
