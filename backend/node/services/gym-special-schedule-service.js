const GymSpecialSchedule = require('../models/GymSpecialSchedule');

const crearHorarioEspecial = async ({ id_gym, date, opening_time, closing_time, closed, motive }) => {
  // Verificar si ya existe un horario especial para esa fecha y gimnasio
  const existente = await GymSpecialSchedule.findOne({
    where: { id_gym, date }
  });

  if (existente) {
    throw new Error('Ya existe un horario especial registrado para esa fecha.');
  }

  return await GymSpecialSchedule.create({
    id_gym,
    date,
    opening_time,
    closing_time,
    closed,
    motive
  });
};

const obtenerHorariosEspecialesPorGimnasio = async (id_gym) => {
  return await GymSpecialSchedule.findAll({
    where: { id_gym },
    order: [['date', 'ASC']]
  });
};

module.exports = {
    crearHorarioEspecial,
    obtenerHorariosEspecialesPorGimnasio
};
  