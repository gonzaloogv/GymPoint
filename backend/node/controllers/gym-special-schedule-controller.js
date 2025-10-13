const service = require('../services/gym-special-schedule-service');

const crearHorarioEspecial = async (req, res) => {
  try {
    const { id_gym, date, opening_time, closing_time, closed, motive } = req.body;
    if (!id_gym || !date || closed === undefined) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Faltan datos requeridos: id_gym, date, closed'
        }
      });
    }

    const resultado = await service.crearHorarioEspecial({
      id_gym,
      date,
      opening_time,
      closing_time,
      closed,
      motive
    });

    res.status(201).json(resultado);
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'CREATE_SPECIAL_SCHEDULE_FAILED',
        message: err.message
      }
    });
  }
};

const obtenerHorariosEspecialesPorGimnasio = async (req, res) => {
  try {
    const resultado = await service.obtenerHorariosEspecialesPorGimnasio(req.params.id_gym);
    res.json(resultado);
  } catch (err) {
    res.status(404).json({
      error: {
        code: 'GET_SPECIAL_SCHEDULES_FAILED',
        message: err.message
      }
    });
  }
};

module.exports = {
  crearHorarioEspecial,
  obtenerHorariosEspecialesPorGimnasio
};
