const gymScheduleService = require('../services/gym-schedule-service');

const crearHorario = async (req, res) => {
  try {
    const { id_gym, day_of_week, opening_time, closing_time, closed } = req.body;

    if (!id_gym || !day_of_week || closed === undefined) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Faltan datos requeridos: id_gym, day_of_week, closed'
        }
      });
    }

    const horario = await gymScheduleService.crearHorario({
      id_gym,
      day_of_week,
      opening_time,
      closing_time,
      closed
    });

    res.status(201).json(horario);
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'CREATE_SCHEDULE_FAILED',
        message: error.message
      }
    });
  }
};

const obtenerHorariosPorGimnasio = async (req, res) => {
  try {
    const horarios = await gymScheduleService.obtenerHorariosPorGimnasio(req.params.id_gym);
    res.json(horarios);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'GET_SCHEDULES_FAILED',
        message: error.message
      }
    });
  }
};

const actualizarHorario = async (req, res) => {
  try {
    const id_schedule = req.params.id_schedule;
    const data = req.body;

    const actualizado = await gymScheduleService.actualizarHorario(id_schedule, data);
    res.json(actualizado);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: 'UPDATE_SCHEDULE_FAILED',
        message: error.message
      }
    });
  }
};
  
module.exports = {
  crearHorario,
  obtenerHorariosPorGimnasio,
  actualizarHorario
};
