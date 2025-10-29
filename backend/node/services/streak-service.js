/**
 * Streak Service - Refactorizado con Command/Query pattern
 * Gestión de rachas de asistencia siguiendo arquitectura limpia
 */

const { streakRepository } = require('../infra/db/repositories');
const { NotFoundError, BusinessError } = require('../utils/errors');
const { UserProfile } = require('../models');

// Ensure functions para aceptar Commands/Queries/plain objects
const ensureCommand = (input) => input;
const ensureQuery = (input) => input;

// ==================== Query Operations ====================

/**
 * Obtener la racha de un usuario por ID de perfil
 * @param {GetUserStreakQuery|number} query
 * @returns {Promise<Object>}
 */
const getUserStreak = async (query) => {
  const q = typeof query === 'object' && query.idUserProfile ? query : { idUserProfile: query };

  console.log(`[streak-service] Buscando streak para usuario ${q.idUserProfile}`);

  // NO incluir relaciones para evitar error de SQL con id_user
  const streak = await streakRepository.findByUserProfileId(q.idUserProfile, {
    includeRelations: false
  });

  console.log(`[streak-service] Streak encontrado:`, streak);

  if (!streak) {
    console.error(`[streak-service] NO se encontró streak para usuario ${q.idUserProfile}`);
    throw new NotFoundError('Racha del usuario');
  }

  console.log(`[streak-service] Devolviendo streak:`, {
    id_streak: streak.id_streak,
    value: streak.value,
    last_value: streak.last_value,
    recovery_items: streak.recovery_items
  });

  return streak;
};

/**
 * Obtener racha por ID directo
 * @param {GetStreakByIdQuery|number} query
 * @returns {Promise<Object>}
 */
const getStreakById = async (query) => {
  const q = typeof query === 'object' && query.idStreak ? query : { idStreak: query };

  const streak = await streakRepository.findById(q.idStreak, {
    includeRelations: true
  });

  if (!streak) {
    throw new NotFoundError('Racha');
  }

  return streak;
};

/**
 * Obtener estadísticas globales de rachas (admin)
 * @param {GetStreakStatsQuery} query
 * @returns {Promise<Object>}
 */
const getStreakStats = async (query = {}) => {
  const stats = await streakRepository.getStreakStats();
  return stats;
};

/**
 * Listar las rachas más altas (leaderboard)
 * @param {ListTopStreaksQuery} query
 * @returns {Promise<Array>}
 */
const listTopStreaks = async (query = {}) => {
  const q = ensureQuery(query);
  const limit = q.limit || 10;

  const streaks = await streakRepository.listTopStreaks(limit);
  return streaks;
};

// ==================== Command Operations ====================

/**
 * Usar un item de recuperación para mantener la racha
 * @param {UseRecoveryItemCommand} command
 * @returns {Promise<Object>}
 */
const useRecoveryItem = async (command) => {
  const cmd = ensureCommand(command);

  const streak = await streakRepository.findByUserProfileId(cmd.idUserProfile);

  if (!streak) {
    throw new NotFoundError('Racha del usuario');
  }

  if (streak.recovery_items <= 0) {
    throw new BusinessError(
      'No tienes items de recuperación disponibles',
      'NO_RECOVERY_ITEMS'
    );
  }

  const updated = await streakRepository.updateStreak(streak.id_streak, {
    recovery_items: streak.recovery_items - 1
  });

  return {
    message: 'Item de recuperación usado exitosamente',
    recovery_items_remaining: updated.recovery_items,
    streak_value: updated.value
  };
};

/**
 * Actualizar la racha de un usuario
 * Esta función es llamada desde assistance-service al registrar asistencias
 * @param {UpdateStreakCommand} command
 * @returns {Promise<Object>}
 */
const updateStreak = async (command) => {
  const cmd = ensureCommand(command);

  const streak = await streakRepository.findById(cmd.idStreak);

  if (!streak) {
    throw new NotFoundError('Racha');
  }

  const payload = {};

  if (cmd.continuaRacha !== undefined) {
    if (cmd.continuaRacha) {
      // Continúa la racha
      payload.value = streak.value + 1;
      payload.last_assistance_date = new Date();

      // Actualizar max_value si corresponde
      if ((streak.value + 1) > (streak.max_value || 0)) {
        payload.max_value = streak.value + 1;
      }
    } else {
      // No continúa la racha - verificar items de recuperación
      if (streak.recovery_items > 0) {
        // Usa automáticamente un item de recuperación
        payload.recovery_items = streak.recovery_items - 1;
        // Mantiene el value actual
      } else {
        // Pierde la racha
        payload.last_value = streak.value;
        payload.value = 1; // Nueva racha comienza en 1
        payload.last_assistance_date = new Date();
      }
    }
  }

  // Permitir actualización directa de campos (para admin)
  if (cmd.value !== undefined) payload.value = cmd.value;
  if (cmd.lastValue !== undefined) payload.last_value = cmd.lastValue;
  if (cmd.recoveryItems !== undefined) payload.recovery_items = cmd.recoveryItems;

  return streakRepository.updateStreak(cmd.idStreak, payload);
};

/**
 * Resetear la racha de un usuario (admin)
 * @param {ResetStreakCommand} command
 * @returns {Promise<Object>}
 */
const resetStreak = async (command) => {
  const cmd = ensureCommand(command);

  const streak = await streakRepository.findByUserProfileId(cmd.idUserProfile);

  if (!streak) {
    throw new NotFoundError('Racha del usuario');
  }

  return streakRepository.updateStreak(streak.id_streak, {
    last_value: streak.value,
    value: 0
  });
};

/**
 * Otorgar items de recuperación a un usuario (admin)
 * @param {GrantRecoveryItemsCommand} command
 * @returns {Promise<Object>}
 */
const grantRecoveryItems = async (command) => {
  const cmd = ensureCommand(command);

  const streak = await streakRepository.findByUserProfileId(cmd.idUserProfile);

  if (!streak) {
    throw new NotFoundError('Racha del usuario');
  }

  const cantidad = cmd.cantidad || cmd.amount || 1;

  return streakRepository.updateStreak(streak.id_streak, {
    recovery_items: streak.recovery_items + cantidad
  });
};

/**
 * Crear una nueva racha para un usuario
 * Esta función es llamada durante el registro de usuario
 * @param {CreateStreakCommand} command
 * @returns {Promise<Object>}
 */
const createStreak = async (command) => {
  const cmd = ensureCommand(command);

  return streakRepository.createStreak({
    id_user_profile: cmd.idUserProfile || cmd.idUser,
    value: 0,
    last_value: 0,
    max_value: 0,
    recovery_items: 0,
    id_frequency: cmd.idFrequency || null,
    last_assistance_date: null
  }, {
    transaction: cmd.transaction
  });
};

// ==================== Legacy Aliases ====================

const obtenerRachaUsuario = getUserStreak;
const usarItemRecuperacion = useRecoveryItem;
const obtenerEstadisticasGlobales = getStreakStats;
const resetearRachaUsuario = resetStreak;
const otorgarItemsRecuperacion = grantRecoveryItems;
const actualizarRacha = (idStreak, continuaRacha) =>
  updateStreak({ idStreak, continuaRacha });
const crearRacha = (idUser, idFrequency) =>
  createStreak({ idUser, idFrequency });

module.exports = {
  // Query Operations
  getUserStreak,
  getStreakById,
  getStreakStats,
  listTopStreaks,

  // Command Operations
  useRecoveryItem,
  updateStreak,
  resetStreak,
  grantRecoveryItems,
  createStreak,

  // Legacy Aliases (backward compatibility)
  obtenerRachaUsuario,
  usarItemRecuperacion,
  obtenerEstadisticasGlobales,
  resetearRachaUsuario,
  otorgarItemsRecuperacion,
  actualizarRacha,
  crearRacha
};
