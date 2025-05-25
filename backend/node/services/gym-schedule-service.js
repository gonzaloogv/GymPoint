const GymSchedule = require('../models/GymSchedule');

const crearHorario = async ({ id_gym, day_of_week, opening_time, closing_time, closed }) => {
    // Verificar si ya existe un horario para ese día y gimnasio
    const existente = await GymSchedule.findOne({
      where: { id_gym, day_of_week }
    });
  
    if (existente) {
      throw new Error(`El gimnasio ya tiene registrado un horario para "${day_of_week}".`);
    }
  
    return await GymSchedule.create({
      id_gym,
      day_of_week,
      opening_time,
      closing_time,
      closed
    });
};

const obtenerHorariosPorGimnasio = async (id_gym) => {
  return await GymSchedule.findAll({
    where: { id_gym },
    order: [['id_schedule', 'ASC']]
  });
};

const actualizarHorario = async (id_schedule, data) => {
    const horario = await GymSchedule.findByPk(id_schedule);
    if (!horario) {
      throw new Error('Horario no encontrado.');
    }
  
    return await horario.update(data);
};  

module.exports = {
    crearHorario,
    obtenerHorariosPorGimnasio,
    actualizarHorario
};
  