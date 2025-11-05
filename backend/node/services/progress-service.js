/**
 * Progress Service - Refactorizado con CQRS pattern
 * Gesti�n de progreso f�sico de usuarios y ejercicios
 */

const { progressRepository } = require('../infra/db/repositories');
const { NotFoundError, ValidationError } = require('../utils/errors');
const sequelize = require('../config/database');

// Ensure functions para aceptar Commands/Queries/plain objects
const ensureCommand = (input) => input;
const ensureQuery = (input) => input;

// ==================== Query Operations ====================

/**
 * Obtener progreso de usuario por ID
 * @param {GetProgressByIdQuery|number} query
 * @returns {Promise<Object>}
 */
const getProgressById = async (query) => {
  const q = typeof query === 'object' && query.idProgress ? query : { idProgress: query };

  const progress = await progressRepository.findById(q.idProgress);

  if (!progress) {
    throw new NotFoundError('Progreso');
  }

  return progress;
};

/**
 * Obtener todo el progreso de un usuario
 * @param {GetUserProgressQuery} query
 * @returns {Promise<Array>}
 */
const getUserProgress = async (query) => {
  const q = ensureQuery(query);

  return progressRepository.findByUserProfile(q.idUserProfile, {
    limit: q.limit,
    offset: q.offset,
    includeExercises: q.includeExercises || false
  });
};

/**
 * Obtener estad�sticas de peso de un usuario
 * @param {GetWeightStatsQuery} query
 * @returns {Promise<Array>}
 */
const getWeightStats = async (query) => {
  const q = ensureQuery(query);

  return progressRepository.getWeightStats(q.idUserProfile, {
    startDate: q.startDate,
    endDate: q.endDate
  });
};

/**
 * Obtener historial de ejercicios de un usuario
 * @param {GetExerciseHistoryQuery} query
 * @returns {Promise<Array>}
 */
const getExerciseHistory = async (query) => {
  const q = ensureQuery(query);

  return progressRepository.getExerciseHistory(q.idUserProfile, {
    idExercise: q.idExercise,
    limit: q.limit || 100
  });
};

/**
 * Obtener mejor marca personal (PR) de un ejercicio
 * @param {GetPersonalRecordQuery} query
 * @returns {Promise<Object|null>}
 */
const getPersonalRecord = async (query) => {
  const q = ensureQuery(query);

  return progressRepository.getPersonalRecord(q.idUserProfile, q.idExercise);
};

/**
 * Obtener promedios de un ejercicio
 * @param {GetExerciseAveragesQuery} query
 * @returns {Promise<Object|null>}
 */
const getExerciseAverages = async (query) => {
  const q = ensureQuery(query);

  return progressRepository.getExerciseAverages(q.idUserProfile, q.idExercise);
};

// ==================== Command Operations ====================

/**
 * Registrar nuevo progreso con ejercicios
 * @param {RegisterProgressCommand} command
 * @returns {Promise<Object>}
 */
const registerProgress = async (command) => {
  const cmd = ensureCommand(command);

  // Validaciones
  if (!cmd.idUserProfile) {
    throw new ValidationError('idUserProfile es requerido');
  }

  if (!cmd.date) {
    throw new ValidationError('date es requerido');
  }

  if (cmd.exercises && !Array.isArray(cmd.exercises)) {
    throw new ValidationError('exercises debe ser un array');
  }

  // Validar que cada ejercicio tenga los datos requeridos
  if (cmd.exercises && cmd.exercises.length > 0) {
    for (const ex of cmd.exercises) {
      if (!ex.idExercise) {
        throw new ValidationError('Cada ejercicio debe tener idExercise');
      }
      if (ex.usedWeight === undefined || ex.usedWeight === null) {
        throw new ValidationError('Cada ejercicio debe tener usedWeight');
      }
      if (ex.reps === undefined || ex.reps === null) {
        throw new ValidationError('Cada ejercicio debe tener reps');
      }
    }
  }

  return sequelize.transaction(async (transaction) => {
    // Check if progress already exists for this user and date
    const existingProgress = await progressRepository.findByUserAndDate(
      cmd.idUserProfile,
      cmd.date,
      { transaction }
    );

    if (existingProgress) {
      // Update existing progress (aggregate the values)
      console.log('[registerProgress] 📝 Actualizando progreso existente para', cmd.date);

      const updatedProgress = await progressRepository.update(existingProgress.id_progress, {
        totalWeightLifted: (existingProgress.total_weight_lifted || 0) + (cmd.totalWeightLifted || 0),
        totalReps: (existingProgress.total_reps || 0) + (cmd.totalReps || 0),
        totalSets: (existingProgress.total_sets || 0) + (cmd.totalSets || 0),
        notes: cmd.notes || existingProgress.notes
      }, { transaction });

      // TODO: También actualizar ProgressExercise si hay ejercicios
      // Por ahora solo actualizamos los totales

      return updatedProgress;
    } else {
      // Create new progress
      console.log('[registerProgress] 🆕 Creando nuevo registro de progreso para', cmd.date);

      const progress = await progressRepository.create({
        idUserProfile: cmd.idUserProfile,
        date: cmd.date,
        totalWeightLifted: cmd.totalWeightLifted,
        totalReps: cmd.totalReps,
        totalSets: cmd.totalSets,
        notes: cmd.notes,
        exercises: cmd.exercises || []
      }, { transaction });

      return progress;
    }
  });
};

/**
 * Actualizar registro de progreso
 * @param {UpdateProgressCommand} command
 * @returns {Promise<Object>}
 */
const updateProgress = async (command) => {
  const cmd = ensureCommand(command);

  if (!cmd.idProgress) {
    throw new ValidationError('idProgress es requerido');
  }

  return sequelize.transaction(async (transaction) => {
    const progress = await progressRepository.update(cmd.idProgress, {
      date: cmd.date,
      totalWeightLifted: cmd.totalWeightLifted,
      totalReps: cmd.totalReps,
      totalSets: cmd.totalSets,
      notes: cmd.notes
    }, { transaction });

    if (!progress) {
      throw new NotFoundError('Progreso');
    }

    return progress;
  });
};

/**
 * Eliminar registro de progreso
 * @param {DeleteProgressCommand|number} command
 * @returns {Promise<boolean>}
 */
const deleteProgress = async (command) => {
  const cmd = typeof command === 'object' && command.idProgress ? command : { idProgress: command };

  return sequelize.transaction(async (transaction) => {
    const deleted = await progressRepository.deleteById(cmd.idProgress, { transaction });

    if (!deleted) {
      throw new NotFoundError('Progreso');
    }

    return true;
  });
};

// ==================== Legacy Aliases ====================
// Para compatibilidad con c�digo existente

const registrarProgreso = async (data) => {
  return registerProgress({
    idUserProfile: data.id_user || data.id_user_profile || data.idUserProfile,
    date: data.date,
    totalWeightLifted: data.total_weight_lifted || data.totalWeightLifted,
    totalReps: data.total_reps || data.totalReps,
    totalSets: data.total_sets || data.totalSets,
    notes: data.notes,
    exercises: data.ejercicios ? data.ejercicios.map(ex => ({
      idExercise: ex.id_exercise || ex.idExercise,
      usedWeight: ex.used_weight || ex.usedWeight,
      reps: ex.reps,
      sets: ex.sets || 1
    })) : (data.exercises || [])
  });
};

const obtenerProgresoPorUsuario = async (idUserProfile) => {
  return getUserProgress({ idUserProfile });
};

const obtenerEstadisticaPeso = async (idUserProfile) => {
  return getWeightStats({ idUserProfile });
};

const obtenerHistorialEjercicios = async (idUserProfile) => {
  return getExerciseHistory({ idUserProfile });
};

const obtenerHistorialPorEjercicio = async (idUserProfile, idExercise) => {
  return getExerciseHistory({ idUserProfile, idExercise });
};

const obtenerMejorLevantamiento = async (idUserProfile, idExercise) => {
  return getPersonalRecord({ idUserProfile, idExercise });
};

const obtenerPromedioLevantamiento = async (idUserProfile, idExercise) => {
  return getExerciseAverages({ idUserProfile, idExercise });
};

module.exports = {
  // Query Operations
  getProgressById,
  getUserProgress,
  getWeightStats,
  getExerciseHistory,
  getPersonalRecord,
  getExerciseAverages,

  // Command Operations
  registerProgress,
  updateProgress,
  deleteProgress,

  // Legacy Aliases
  registrarProgreso,
  obtenerProgresoPorUsuario,
  obtenerEstadisticaPeso,
  obtenerHistorialEjercicios,
  obtenerHistorialPorEjercicio,
  obtenerMejorLevantamiento,
  obtenerPromedioLevantamiento
};
