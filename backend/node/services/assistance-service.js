const Assistance = require('../models/Assistance');
const Streak = require('../models/Streak');
const { Op } = require('sequelize');

const registrarAsistencia = async ({ id_user, id_gym, id_streak }) => {
  const hoy = new Date();
  const fecha = hoy.toISOString().split('T')[0];     // "YYYY-MM-DD"
  const hora = hoy.toTimeString().split(' ')[0];     // "HH:MM:SS"

  // Verificar si ya hay asistencia hoy
  const asistenciaHoy = await Assistance.findOne({
    where: {
      id_user,
      id_gym,
      date: fecha
    }
  });

  if (asistenciaHoy) {
    throw new Error('Ya registraste asistencia hoy.');
  }

  // Registrar asistencia
  const nuevaAsistencia = await Assistance.create({
    id_user,
    id_gym,
    id_streak,
    date: fecha,
    hour: hora
  });

  // Obtener racha actual
  const racha = await Streak.findByPk(id_streak);
  if (!racha) {
    throw new Error('Racha no encontrada.');
  }

  // Verificar última asistencia (excluyendo hoy)
  const ultimaAsistencia = await Assistance.findOne({
    where: {
      id_user,
      id_gym,
      date: { [Op.lt]: fecha }
    },
    order: [['date', 'DESC']]
  });

  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);
  const fechaAyer = ayer.toISOString().split('T')[0];

  // Lógica de racha
  if (ultimaAsistencia && ultimaAsistencia.date === fechaAyer) {
    // Entrenó ayer → suma racha
    racha.value += 1;
  } else {
    if (racha.recovery_items > 0) {
      // Usa restaurador de racha
      racha.recovery_items -= 1;
    } else {
      // Pierde la racha → guarda el valor anterior
      racha.last_value = racha.value;
      racha.value = 1;
    }
  }

  await racha.save();

  return nuevaAsistencia;
};

module.exports = { registrarAsistencia };
