const Frequency = require('../models/Frequency');
const { UserProfile, FrequencyHistory } = require('../models');
const sequelize = require('../config/database');
const tokenLedgerService = require('./token-ledger-service');
const { TOKENS, TOKEN_REASONS } = require('../config/constants');

const MILLIS_IN_DAY = 24 * 60 * 60 * 1000;

const startOfISOWeek = (date) => {
  const result = new Date(date);
  const day = result.getDay(); // 0 = Sunday, 1 = Monday
  const diff = (day === 0 ? -6 : 1) - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getISOWeekNumber = (date) => {
  const temp = new Date(date);
  temp.setHours(0, 0, 0, 0);
  temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
  const week1 = new Date(temp.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((temp.getTime() - week1.getTime()) / MILLIS_IN_DAY - 3 + ((week1.getDay() + 6) % 7)) /
        7
    )
  );
};

const getWeekMetadata = (reference = new Date()) => {
  const weekStartDate = startOfISOWeek(reference);
  const weekNumber = getISOWeekNumber(weekStartDate);
  const year = weekStartDate.getFullYear();
  return { weekStartDate, weekNumber, year };
};

const formatDate = (date) => date.toISOString().slice(0, 10);

const ensureWeekMetadata = (frequency, referenceDate = new Date()) => {
  const { weekStartDate, weekNumber, year } = getWeekMetadata(referenceDate);
  if (!frequency.week_start_date || frequency.week_start_date !== formatDate(weekStartDate)) {
    frequency.week_start_date = formatDate(weekStartDate);
    frequency.week_number = weekNumber;
    frequency.year = year;
    frequency.assist = 0;
    frequency.achieved_goal = false;
  }
};

/**
 * Crear o actualizar meta semanal de un usuario
 * @param {Object} data
 * @param {number} data.id_user
 * @param {number} data.goal
 * @param {Object} [options]
 * @returns {Promise<Frequency>}
 */
const crearMetaSemanal = async ({ id_user, goal }, { transaction } = {}) => {
  const findOptions = { where: { id_user } };
  if (transaction) {
    findOptions.transaction = transaction;
  }

  const existente = await Frequency.findOne(findOptions);

  if (existente) {
    existente.goal = goal;
    ensureWeekMetadata(existente);
    existente.assist = 0;
    existente.achieved_goal = false;
    if (transaction) {
      await existente.save({ transaction });
    } else {
      await existente.save();
    }
    return existente;
  }

  const { weekStartDate, weekNumber, year } = getWeekMetadata(new Date());
  const nuevaData = {
    id_user,
    goal,
    assist: 0,
    achieved_goal: false,
    week_start_date: formatDate(weekStartDate),
    week_number: weekNumber,
    year
  };

  return transaction
    ? await Frequency.create(nuevaData, { transaction })
    : await Frequency.create(nuevaData);
};

/**
 * Actualizar contador de asistencia semanal
 * @param {number} idUserProfile
 */
const actualizarAsistenciaSemanal = async (idUserProfile) => {
  const frecuencia = await Frequency.findOne({ where: { id_user: idUserProfile } });
  if (!frecuencia) return;

  ensureWeekMetadata(frecuencia);

  if (frecuencia.achieved_goal) return;

  frecuencia.assist += 1;

  if (frecuencia.assist >= frecuencia.goal) {
    frecuencia.achieved_goal = true;
  }

  await frecuencia.save();
};

/**
 * Archivar frecuencias de la semana anterior y resetear contadores
 * @param {Date} [referenceDate]
 */
const archivarFrecuencias = async (referenceDate = new Date()) => {
  const transaction = await sequelize.transaction();

  try {
    const frecuencias = await Frequency.findAll({ transaction });
    const nextWeekMeta = getWeekMetadata(referenceDate);

    for (const frecuencia of frecuencias) {
      if (!frecuencia.week_start_date) {
        frecuencia.week_start_date = formatDate(nextWeekMeta.weekStartDate);
        frecuencia.week_number = nextWeekMeta.weekNumber;
        frecuencia.year = nextWeekMeta.year;
        frecuencia.assist = 0;
        frecuencia.achieved_goal = false;
        await frecuencia.save({ transaction });
        continue;
      }

      const currentWeekStart = new Date(frecuencia.week_start_date);
      currentWeekStart.setHours(0, 0, 0, 0);
      const weekEndDate = new Date(currentWeekStart.getTime() + 6 * MILLIS_IN_DAY);

      const goalMet = frecuencia.assist >= frecuencia.goal;
      const tokensEarned =
        goalMet && Number.isFinite(TOKENS.WEEKLY_BONUS) ? TOKENS.WEEKLY_BONUS : 0;

      const history = await FrequencyHistory.create({
        id_user_profile: frecuencia.id_user,
        week_start_date: frecuencia.week_start_date,
        week_end_date: formatDate(weekEndDate),
        goal: frecuencia.goal,
        achieved: frecuencia.assist,
        goal_met: goalMet,
        tokens_earned: goalMet ? tokensEarned : 0,
        created_at: new Date()
      }, { transaction });

      if (goalMet && tokensEarned > 0) {
        await tokenLedgerService.registrarMovimiento({
          userId: frecuencia.id_user,
          delta: tokensEarned,
          reason: TOKEN_REASONS.WEEKLY_BONUS,
          refType: 'frequency_history',
          refId: history.id_history,
          transaction
        });
      }

      frecuencia.assist = 0;
      frecuencia.achieved_goal = false;
      frecuencia.week_start_date = formatDate(nextWeekMeta.weekStartDate);
      frecuencia.week_number = nextWeekMeta.weekNumber;
      frecuencia.year = nextWeekMeta.year;

      await frecuencia.save({ transaction });
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Reiniciar contadores semanales de todos los usuarios
 */
const reiniciarSemana = async () => {
  await archivarFrecuencias();
};

/**
 * Consultar meta semanal de un usuario
 * @param {number} idUserProfile
 * @returns {Promise<Frequency>}
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
 * @param {number} id_frequency
 * @param {number} idUserProfile
 * @returns {Promise<Frequency>}
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
  archivarFrecuencias,
  reiniciarSemana,
  consultarMetaSemanal,
  actualizarUsuarioFrecuencia,
  __private: {
    getWeekMetadata
  }
};
