const Frequency = require('../models/Frequency');

const crearMetaSemanal = async ({ id_user, goal }) => {
  // buscar por id_user ya que el modelo usa id_frequency como PK
  const existente = await Frequency.findOne({ where: { id_user } });

  if (existente) {
    // si ya existe reinicia su meta y contador
    existente.goal = goal;
    existente.assist = 0;
    existente.achieved_goal = false;
    await existente.save();
    return existente;
  }

  // crea nueva frecuencia si no existía
  const nueva = await Frequency.create({
    id_user,
    goal,
    assist: 0,
    achieved_goal: false
  });

  return nueva;
};

const actualizarAsistenciaSemanal = async (id_user) => {
  const frecuencia = await Frequency.findOne({ where: { id_user } });

  if (!frecuencia || frecuencia.achieved_goal) return;

  frecuencia.assist += 1;

  if (frecuencia.assist >= frecuencia.goal) {
    frecuencia.achieved_goal = true;
  }

  await frecuencia.save();
};

const reiniciarSemana = async () => {
  await Frequency.update(
    { assist: 0, achieved_goal: false },
    { where: {} }
  );
};

const consultarMetaSemanal = async (id_user) => {
  const frecuencia = await Frequency.findOne({ where: { id_user } });

  if (!frecuencia) {
    throw new Error('El usuario no tiene una meta semanal asignada.');
  }

  return frecuencia;
};

const actualizarUsuarioFrecuencia = async (id_frequency, id_user) => {
  const frecuencia = await Frequency.findByPk(id_frequency);
  
  if (!frecuencia) {
    throw new Error('Frecuencia no encontrada');
  }
  
  frecuencia.id_user = id_user;
  await frecuencia.save();
  
  return frecuencia;
};

module.exports = {
  crearMetaSemanal,
  actualizarAsistenciaSemanal,
  reiniciarSemana,
  consultarMetaSemanal,
  actualizarUsuarioFrecuencia
};