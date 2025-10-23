/**
 * Frequency Service - Refactorizado con Command/Query pattern
 * Gestión de frecuencia semanal y metas siguiendo arquitectura limpia
 */

const { frequencyRepository } = require('../infra/db/repositories');
const tokenLedgerService = require('./token-ledger-service');
const { NotFoundError, BusinessError } = require('../utils/errors');
const { TOKENS, TOKEN_REASONS } = require('../config/constants');
const sequelize = require('../config/database');

// ==================== Helper Functions (Week Calculations) ====================

const MILLIS_IN_DAY = 24 * 60 * 60 * 1000;

/**
 * Obtener el inicio de la semana ISO (Lunes)
 * @param {Date} date
 * @returns {Date}
 */
const startOfISOWeek = (date) => {
  const result = new Date(date);
  const day = result.getDay(); // 0 = Sunday, 1 = Monday
  const diff = (day === 0 ? -6 : 1) - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Obtener el número de semana ISO
 * @param {Date} date
 * @returns {number}
 */
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

/**
 * Obtener metadata de la semana (inicio, número de semana, año)
 * @param {Date} reference
 * @returns {Object}
 */
const getWeekMetadata = (reference = new Date()) => {
  const weekStartDate = startOfISOWeek(reference);
  const weekNumber = getISOWeekNumber(weekStartDate);
  const year = weekStartDate.getFullYear();
  return { weekStartDate, weekNumber, year };
};

/**
 * Formatear fecha a string YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
const formatDate = (date) => date.toISOString().slice(0, 10);

/**
 * Asegurar que la frecuencia tenga metadata de semana actualizada
 * Si cambió la semana, resetea contadores
 * @param {Object} frequency
 * @param {Date} referenceDate
 */
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

// Ensure functions
const ensureCommand = (input) => input;
const ensureQuery = (input) => input;

// ==================== Query Operations ====================

/**
 * Consultar meta semanal de un usuario
 * @param {GetUserFrequencyQuery|number} query
 * @returns {Promise<Object>}
 */
const getUserFrequency = async (query) => {
  const q = typeof query === 'object' && query.idUserProfile ? query : { idUserProfile: query };

  const frequency = await frequencyRepository.findByUserProfileId(q.idUserProfile, {
    includeRelations: true
  });

  if (!frequency) {
    throw new NotFoundError('Meta semanal del usuario');
  }

  return frequency;
};

/**
 * Listar historial de frecuencia de un usuario
 * @param {ListFrequencyHistoryQuery} query
 * @returns {Promise<Object>}
 */
const listFrequencyHistory = async (query) => {
  const q = ensureQuery(query);

  const { rows, count } = await frequencyRepository.listHistory({
    idUserProfile: q.idUserProfile,
    filters: {
      startDate: q.startDate || null,
      endDate: q.endDate || null,
      goalMet: q.goalMet ?? null
    },
    pagination: {
      limit: q.limit || 20,
      offset: ((q.page || 1) - 1) * (q.limit || 20)
    }
  });

  return {
    items: rows,
    total: count,
    page: q.page || 1,
    limit: q.limit || 20
  };
};

/**
 * Obtener estadísticas de frecuencia de un usuario
 * @param {GetFrequencyStatsQuery|number} query
 * @returns {Promise<Object>}
 */
const getFrequencyStats = async (query) => {
  const q = typeof query === 'object' && query.idUserProfile ? query : { idUserProfile: query };

  const stats = await frequencyRepository.getStats(q.idUserProfile);
  return stats;
};

// ==================== Command Operations ====================

/**
 * Crear o actualizar meta semanal de un usuario
 * @param {CreateWeeklyGoalCommand} command
 * @returns {Promise<Object>}
 */
const createWeeklyGoal = async (command) => {
  const cmd = ensureCommand(command);

  const existente = await frequencyRepository.findByUserProfileId(cmd.idUserProfile);

  if (existente) {
    // Actualizar meta existente
    const payload = {
      goal: cmd.goal
    };

    // Resetear semana actual al cambiar meta
    const { weekStartDate, weekNumber, year } = getWeekMetadata(new Date());
    payload.week_start_date = formatDate(weekStartDate);
    payload.week_number = weekNumber;
    payload.year = year;
    payload.assist = 0;
    payload.achieved_goal = false;

    return frequencyRepository.updateByUserProfileId(cmd.idUserProfile, payload, {
      transaction: cmd.transaction
    });
  }

  // Crear nueva meta
  const { weekStartDate, weekNumber, year } = getWeekMetadata(new Date());
  return frequencyRepository.create({
    id_user_profile: cmd.idUserProfile || cmd.id_user,
    goal: cmd.goal,
    assist: 0,
    achieved_goal: false,
    week_start_date: formatDate(weekStartDate),
    week_number: weekNumber,
    year: year
  }, {
    transaction: cmd.transaction
  });
};

/**
 * Actualizar meta semanal existente
 * @param {UpdateWeeklyGoalCommand} command
 * @returns {Promise<Object>}
 */
const updateWeeklyGoal = async (command) => {
  const cmd = ensureCommand(command);

  const frequency = await frequencyRepository.findByUserProfileId(cmd.idUserProfile);

  if (!frequency) {
    throw new NotFoundError('Meta semanal del usuario');
  }

  const payload = {};
  if (cmd.goal !== undefined) payload.goal = cmd.goal;

  return frequencyRepository.updateByUserProfileId(cmd.idUserProfile, payload, {
    transaction: cmd.transaction
  });
};

/**
 * Incrementar contador de asistencia semanal
 * Esta función es llamada desde assistance-service
 * @param {IncrementAssistanceCommand|number} command
 * @returns {Promise<Object|null>}
 */
const incrementAssistance = async (command) => {
  const cmd = typeof command === 'object' && command.idUserProfile
    ? command
    : { idUserProfile: command };

  const frequency = await frequencyRepository.findByUserProfileId(cmd.idUserProfile);

  if (!frequency) {
    return null; // Usuario no tiene meta semanal configurada
  }

  // Asegurar que estamos en la semana correcta
  const { weekStartDate, weekNumber, year } = getWeekMetadata(new Date());
  const currentWeekStart = formatDate(weekStartDate);

  if (frequency.week_start_date !== currentWeekStart) {
    // Nueva semana - resetear contadores
    await frequencyRepository.updateByUserProfileId(cmd.idUserProfile, {
      week_start_date: currentWeekStart,
      week_number: weekNumber,
      year: year,
      assist: 0,
      achieved_goal: false
    });
  }

  // Si ya alcanzó la meta, no incrementar más
  if (frequency.achieved_goal) {
    return frequency;
  }

  // Incrementar asistencia usando la función del repositorio
  // que automáticamente verifica si se alcanzó la meta
  return frequencyRepository.incrementAssist(cmd.idUserProfile, {
    transaction: cmd.transaction
  });
};

/**
 * Archivar frecuencias de la semana anterior y resetear contadores
 * Esta función se ejecuta automáticamente cada semana (cron job)
 * @param {ResetWeekCommand} command
 * @returns {Promise<void>}
 */
const resetWeek = async (command = {}) => {
  const cmd = ensureCommand(command);
  const referenceDate = cmd.referenceDate || new Date();

  const transaction = await sequelize.transaction();

  try {
    // Obtener todas las frecuencias
    const frequencies = await frequencyRepository.findAll({ transaction });
    const nextWeekMeta = getWeekMetadata(referenceDate);

    for (const frequency of frequencies) {
      // Si no tiene week_start_date, inicializar
      if (!frequency.week_start_date) {
        await frequencyRepository.update(frequency.id_frequency, {
          week_start_date: formatDate(nextWeekMeta.weekStartDate),
          week_number: nextWeekMeta.weekNumber,
          year: nextWeekMeta.year,
          assist: 0,
          achieved_goal: false
        }, { transaction });
        continue;
      }

      // Calcular fechas de la semana
      const currentWeekStart = new Date(frequency.week_start_date);
      currentWeekStart.setHours(0, 0, 0, 0);
      const weekEndDate = new Date(currentWeekStart.getTime() + 6 * MILLIS_IN_DAY);

      // Determinar si alcanzó la meta
      const goalMet = frequency.assist >= frequency.goal;
      const tokensEarned = goalMet && Number.isFinite(TOKENS.WEEKLY_BONUS) ? TOKENS.WEEKLY_BONUS : 0;

      // Crear registro histórico
      const history = await frequencyRepository.createHistory({
        id_user_profile: frequency.id_user_profile || frequency.id_user,
        week_start_date: frequency.week_start_date,
        week_end_date: formatDate(weekEndDate),
        goal: frequency.goal,
        achieved: frequency.assist,
        goal_met: goalMet,
        tokens_earned: goalMet ? tokensEarned : 0,
        created_at: new Date()
      }, { transaction });

      // Otorgar tokens si cumplió la meta
      if (goalMet && tokensEarned > 0) {
        await tokenLedgerService.registrarMovimiento({
          userId: frequency.id_user_profile || frequency.id_user,
          delta: tokensEarned,
          reason: TOKEN_REASONS.WEEKLY_BONUS,
          refType: 'frequency_history',
          refId: history.id_history,
          transaction
        });
      }

      // Resetear contadores para la nueva semana
      await frequencyRepository.update(frequency.id_frequency, {
        assist: 0,
        achieved_goal: false,
        week_start_date: formatDate(nextWeekMeta.weekStartDate),
        week_number: nextWeekMeta.weekNumber,
        year: nextWeekMeta.year
      }, { transaction });
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Actualizar usuario asociado a una frecuencia (legacy)
 * @param {number} idFrequency
 * @param {number} idUserProfile
 * @returns {Promise<Object>}
 */
const updateFrequencyUser = async (idFrequency, idUserProfile) => {
  const frequency = await frequencyRepository.findById(idFrequency);

  if (!frequency) {
    throw new NotFoundError('Frecuencia');
  }

  return frequencyRepository.update(idFrequency, {
    id_user_profile: idUserProfile
  });
};

// ==================== Legacy Aliases ====================

const crearMetaSemanal = ({ id_user, goal }, options = {}) =>
  createWeeklyGoal({ idUserProfile: id_user, goal, transaction: options.transaction });

const actualizarAsistenciaSemanal = (idUserProfile) =>
  incrementAssistance({ idUserProfile });

const archivarFrecuencias = (referenceDate) =>
  resetWeek({ referenceDate });

const reiniciarSemana = () =>
  resetWeek();

const consultarMetaSemanal = (idUserProfile) =>
  getUserFrequency({ idUserProfile });

const actualizarUsuarioFrecuencia = (id_frequency, idUserProfile) =>
  updateFrequencyUser(id_frequency, idUserProfile);

module.exports = {
  // Query Operations
  getUserFrequency,
  listFrequencyHistory,
  getFrequencyStats,

  // Command Operations
  createWeeklyGoal,
  updateWeeklyGoal,
  incrementAssistance,
  resetWeek,
  updateFrequencyUser,

  // Legacy Aliases (backward compatibility)
  crearMetaSemanal,
  actualizarAsistenciaSemanal,
  archivarFrecuencias,
  reiniciarSemana,
  consultarMetaSemanal,
  actualizarUsuarioFrecuencia,

  // Exported helpers for testing
  __private: {
    getWeekMetadata,
    startOfISOWeek,
    getISOWeekNumber,
    formatDate,
    ensureWeekMetadata
  }
};
