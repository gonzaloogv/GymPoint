const gymScheduleService = require('../services/gym-schedule-service');

const crearHorario = async (req, res) => {
  try {
    const { id_gym, day_of_week, opening_time, closing_time, closed } = req.body;

    if (!id_gym || !day_of_week || closed === undefined) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }

    const horario = await gymScheduleService.crearHorario({
      id_gym,
      day_of_week,
      opening_time,
      closing_time,
      closed
    });

    res.status(201).json({ data: horario, message: 'Horario creado con éxito' });
  } catch (err) {
    res.status(400).json({ error: { code: 'CREATE_SCHEDULE_FAILED', message: err.message } });
  }
};

const obtenerHorariosPorGimnasio = async (req, res) => {
  try {
    const horarios = await gymScheduleService.obtenerHorariosPorGimnasio(req.params.id_gym);
    res.json({ data: horarios, message: 'Horarios obtenidos con éxito' });
  } catch (err) {
    res.status(400).json({ error: { code: 'GET_SCHEDULE_FAILED', message: err.message } });
  }
};

const actualizarHorario = async (req, res) => {
    try {
      const id_schedule = req.params.id_schedule;
      const data = req.body;
  
      const actualizado = await gymScheduleService.actualizarHorario(id_schedule, data);
      res.json({ data: actualizado, message: 'Horario actualizado con éxito' });
    } catch (err) {
      res.status(400).json({ error: { code: 'UPDATE_SCHEDULE_FAILED', message: err.message } });
    }
};
  
module.exports = {
  crearHorario,
  obtenerHorariosPorGimnasio,
  actualizarHorario
};
