const Frequency = require('../models/Frequency');
const { UserProfile } = require('../models');

/**
 * Crear o actualizar meta semanal de un usuario
 * @param {Object} data - Datos de la frecuencia
 * @param {number} data.id_user - ID del user_profile
 * @param {number} data.goal - Meta semanal
 * @returns {Promise<Frequency>} Frecuencia creada/actualizada
 */
const crearMetaSemanal = async ({ id_user, goal }) => {
  // id_user ahora apunta a user_profiles.id_user_profile
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
    id_user, // id_user_profile
    goal,
    assist: 0,
    achieved_goal: false
  });

  return nueva;
};

/**
 * Actualizar contador de asistencia semanal
 * @param {number} idUserProfile - ID del user_profile
 */
const actualizarAsistenciaSemanal = async (idUserProfile) => {
  const frecuencia = await Frequency.findOne({ where: { id_user: idUserProfile } });

  if (!frecuencia || frecuencia.achieved_goal) return;

  frecuencia.assist += 1;

  if (frecuencia.assist >= frecuencia.goal) {
    frecuencia.achieved_goal = true;
  }

  await frecuencia.save();
};

/**
 * Reiniciar contadores semanales de todos los usuarios
 * (Ejecutar vía cron semanal)
 */
const reiniciarSemana = async () => {
  await Frequency.update(
    { assist: 0, achieved_goal: false },
    { where: {} }
  );
};

/**
 * Consultar meta semanal de un usuario
 * @param {number} idUserProfile - ID del user_profile
 * @returns {Promise<Frequency>} Frecuencia del usuario
 */
const consultarMetaSemanal = async (idUserProfile) => {
  const frecuencia = await Frequency.findOne({ 
    where: { id_user: idUserProfile },
    include: {
      model: UserProfile,
      as: 'userProfile',
      attributes: ['name', 'lastname']
    }
  });

  if (!frecuencia) {
    throw new Error('El usuario no tiene una meta semanal asignada.');
  }

  return frecuencia;
};

/**
 * Actualizar usuario asociado a una frecuencia
 * (Usado en migración de datos)
 * @param {number} id_frequency - ID de la frecuencia
 * @param {number} idUserProfile - ID del user_profile
 * @returns {Promise<Frequency>} Frecuencia actualizada
 */
const actualizarUsuarioFrecuencia = async (id_frequency, idUserProfile) => {
  const frecuencia = await Frequency.findByPk(id_frequency);
  
  if (!frecuencia) {
    throw new Error('Frecuencia no encontrada');
  }
  
  frecuencia.id_user = idUserProfile;
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