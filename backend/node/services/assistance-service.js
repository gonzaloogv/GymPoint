/**
 * Assistance Service (CQRS - Phase 4 Compliant)
 * - NO dependencies on Sequelize or Express
 * - Receives pure Commands/Queries
 * - Returns POJOs (no ORM instances)
 * - Uses repositories for data access
 */

// Repositories
const { assistanceRepository } = require('../infra/db/repositories');
const { gymRepository } = require('../infra/db/repositories');
const { userProfileRepository } = require('../infra/db/repositories');
const { streakRepository } = require('../infra/db/repositories');
const { presenceRepository } = require('../infra/db/repositories');

// Other services
const tokenLedgerService = require('./token-ledger-service');
const achievementService = require('./achievement-service');
const { processUnlockResults } = require('./achievement-side-effects');
const frequencyService = require('./frequency-service');

// Utils and errors
const { NotFoundError, ConflictError, BusinessError, ValidationError } = require('../utils/errors');
const { PROXIMITY_METERS, ACCURACY_MAX_METERS, TOKENS, TOKEN_REASONS } = require('../config/constants');
const { calculateDistance } = require('../utils/geo');

const ATTENDANCE_ACHIEVEMENT_CATEGORIES = ['STREAK', 'ATTENDANCE', 'FREQUENCY'];

const syncAttendanceAchievements = async (idUserProfile) => {
  try {
    const results = await achievementService.syncAllAchievementsForUser(idUserProfile, {
      categories: ATTENDANCE_ACHIEVEMENT_CATEGORIES
    });
    await processUnlockResults(idUserProfile, results);
  } catch (error) {
    console.error('[assistance-service] Error sincronizando logros', error);
  }
};

/**
 * Validar suscripción activa o trial disponible (Enfoque Híbrido)
 * @param {number} userProfileId
 * @param {number} gymId
 * @returns {Promise<{allowed: boolean, reason: string, usedTrial?: boolean}>}
 */
const validateSubscriptionOrTrial = async (userProfileId, gymId) => {
  const { userGymRepository } = require('../infra/db/repositories');

  // 1. Buscar relación user_gym (puede no existir)
  const userGym = await userGymRepository.findByUserAndGym(userProfileId, gymId);

  const hoy = new Date().toISOString().split('T')[0];

  // 2. ✅ CASO A: Usuario TIENE suscripción activa y vigente
  if (userGym && userGym.is_active && userGym.subscription_end) {
    if (userGym.subscription_end >= hoy) {
      return { allowed: true, reason: 'ACTIVE_SUBSCRIPTION' };
    }
  }

  // 3. Verificar si gym permite trials
  const gym = await gymRepository.findById(gymId);
  if (!gym) throw new NotFoundError('Gimnasio');

  // 4. ✅ CASO B: Gym permite trial Y usuario NO lo ha usado
  if (gym.trial_allowed && (!userGym || !userGym.trial_used)) {
    return { allowed: true, reason: 'TRIAL_VISIT', usedTrial: false };
  }

  // 5. ❌ CASO C: No cumple ninguna condición
  const errorMessage = userGym && userGym.trial_used
    ? `Ya utilizaste tu visita de prueba en ${gym.name}. Para seguir entrenando, activa tu suscripción.`
    : `Necesitas una suscripción activa para hacer check-in en ${gym.name}.`;

  throw new BusinessError(errorMessage, 'SUBSCRIPTION_REQUIRED', {
    gymId,
    gymName: gym.name,
    trialUsed: userGym?.trial_used || false,
    hasSubscription: !!userGym
  });
};

/**
 * Registrar asistencia a un gimnasio
 * @param {CreateAssistanceCommand} command
 * @returns {Promise<Object>} POJO con asistencia + tokens + racha
 */
const registrarAsistencia = async (command) => {
  const hoy = new Date();
  const fecha = hoy.toISOString().split('T')[0];
  const hora = hoy.toTimeString().split(' ')[0];

  const idUserProfile = command.userProfileId;
  const idGym = command.gymId;

  // ⭐ NUEVA VALIDACIÓN: Verificar suscripción o trial
  const validation = await validateSubscriptionOrTrial(idUserProfile, idGym);
  const isTrialVisit = validation.reason === 'TRIAL_VISIT';

  // Validar que no haya registrado ya hoy
  const asistenciaHoy = await assistanceRepository.findAssistanceByUserAndDate(idUserProfile, fecha);
  if (asistenciaHoy) throw new ConflictError('Ya registraste asistencia hoy');

  // Validar precisión GPS si se envía
  if (command.accuracy != null) {
    const acc = Number(command.accuracy);
    if (Number.isFinite(acc) && acc > ACCURACY_MAX_METERS) {
      throw new ValidationError(`GPS con baja precisión (> ${ACCURACY_MAX_METERS} m)`, [{ field: 'accuracy', message: 'GPS_INACCURATE' }]);
    }
  }

  // Validar gimnasio
  const gym = await gymRepository.findById(idGym);
  if (!gym) throw new NotFoundError('Gimnasio');

  // Validar proximidad
  const distancia = calculateDistance(command.latitude, command.longitude, gym.latitude, gym.longitude);
  if (distancia > PROXIMITY_METERS) {
    throw new BusinessError(
      `Estás fuera del rango del gimnasio (distancia: ${Math.round(distancia)} m, máximo: ${PROXIMITY_METERS} m)`,
      'OUT_OF_RANGE'
    );
  }

  // Cargar user profile
  const userProfile = await userProfileRepository.findById(idUserProfile);
  if (!userProfile) throw new NotFoundError('Usuario');

  // El streak se crea automáticamente con el usuario (id_streak = id_user_profile)
  // Buscar el streak usando directamente el id del usuario
  let racha = await streakRepository.findById(idUserProfile);

  if (!racha) {
    console.error(`[assistance-service] ERROR: Usuario ${idUserProfile} no tiene streak asociado`);
    console.error(`[assistance-service] user_profile.id_streak:`, userProfile.id_streak);
    throw new NotFoundError('Racha no encontrada para el usuario');
  }

  console.log(`[assistance-service] Streak encontrado para usuario ${idUserProfile}:`, {
    id_streak: racha.id_streak,
    value: racha.value,
    last_value: racha.last_value,
    recovery_items: racha.recovery_items
  });

  // Crear asistencia
  const nuevaAsistencia = await assistanceRepository.createAssistance({
    id_user_profile: idUserProfile,
    id_gym: idGym,
    date: fecha,
    check_in_time: hora,
    check_out_time: null,
    duration_minutes: null,
    auto_checkin: command.autoCheckin || false,
    distance_meters: command.distanceMeters || null,
    verified: command.verified || false
  });

  // ⭐ Si es trial, marcar como usado
  if (isTrialVisit) {
    const { userGymRepository } = require('../infra/db/repositories');
    await userGymRepository.markTrialAsUsed(idUserProfile, idGym, fecha);
  }

  // Actualizar racha
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);
  const fechaAyer = ayer.toISOString().split('T')[0];

  const ultimaAsistencia = await assistanceRepository.findYesterdayAssistance(idUserProfile, idGym, fechaAyer);

  let updatedStreak;
  if (ultimaAsistencia) {
    updatedStreak = await streakRepository.updateStreak(racha.id_streak, {
      value: racha.value + 1
    });
  } else {
    if (racha.recovery_items > 0) {
      updatedStreak = await streakRepository.updateStreak(racha.id_streak, {
        recovery_items: racha.recovery_items - 1
      });
    } else {
      updatedStreak = await streakRepository.updateStreak(racha.id_streak, {
        last_value: racha.value,
        value: 1
      });
    }
  }

  // Otorgar tokens usando ledger
  const { newBalance } = await tokenLedgerService.registrarMovimiento({
    userId: idUserProfile,
    delta: TOKENS.ATTENDANCE,
    reason: TOKEN_REASONS.ATTENDANCE,
    refType: 'assistance',
    refId: nuevaAsistencia.id_assistance
  });

  // Actualizar frecuencia semanal
  await frequencyService.actualizarAsistenciaSemanal(idUserProfile);
  await syncAttendanceAchievements(idUserProfile);

  return {
    asistencia: nuevaAsistencia,
    distancia: Math.round(distancia),
    tokens_actuales: newBalance,
    racha_actual: updatedStreak.value
  };
};

/**
 * Check-out de asistencia: registra hora de salida y otorga bonus por duración (top-up)
 * @param {CheckOutCommand} command
 */
const checkOut = async (command) => {
  const asistencia = await assistanceRepository.findAssistanceById(command.assistanceId);
  if (!asistencia) throw new NotFoundError('Asistencia');
  if (asistencia.id_user_profile !== command.userProfileId) throw new BusinessError('No puedes modificar esta asistencia', 'FORBIDDEN');
  if (asistencia.check_out_time) throw new ConflictError('La asistencia ya tiene check-out');
  if (!asistencia.check_in_time) throw new BusinessError('No hay check-in registrado', 'CHECKIN_REQUIRED');

  const ahora = new Date();
  const horaSalida = ahora.toTimeString().split(' ')[0];

  const refreshed = await assistanceRepository.updateAssistance(command.assistanceId, {
    check_out_time: horaSalida
  });

  // Calcular duración
  let durMin = refreshed.duration_minutes;
  if (durMin == null && refreshed.check_in_time && refreshed.check_out_time) {
    try {
      const [hIn, mIn, sIn] = String(refreshed.check_in_time).split(':').map(Number);
      const [hOut, mOut, sOut] = String(refreshed.check_out_time).split(':').map(Number);
      const minsIn = (hIn || 0) * 60 + (mIn || 0) + ((sIn || 0) > 0 ? 1 : 0);
      const minsOut = (hOut || 0) * 60 + (mOut || 0) + ((sOut || 0) > 0 ? 1 : 0);
      durMin = Math.max(0, minsOut - minsIn);
    } catch (_) {
      durMin = 0;
    }
  }
  durMin = durMin || 0;

  // Calcular tokens por duración (top-up sobre base ATTENDANCE)
  let tokensByDuration = TOKENS.ATTENDANCE;
  if (durMin >= 60) tokensByDuration = Math.max(tokensByDuration, 15);
  else if (durMin >= 45) tokensByDuration = Math.max(tokensByDuration, 12);
  else if (durMin >= 30) tokensByDuration = Math.max(tokensByDuration, 10);

  const base = TOKENS.ATTENDANCE;
  const delta = Math.max(0, tokensByDuration - base);

  let newBalance = undefined;
  let awarded = 0;
  if (delta > 0) {
    // Evitar doble procesamiento de checkout usando ref_type distinto
    const yaExiste = await tokenLedgerService.existeMovimiento('assistance_checkout', command.assistanceId);
    if (!yaExiste) {
      const res = await tokenLedgerService.registrarMovimiento({
        userId: command.userProfileId,
        delta,
        reason: TOKEN_REASONS.ATTENDANCE,
        refType: 'assistance_checkout',
        refId: command.assistanceId
      });
      newBalance = res.newBalance;
      awarded = delta;
    }
  }

  return {
    asistencia: refreshed,
    duration_minutes: durMin,
    tokens_awarded: awarded,
    tokens_total: newBalance
  };
};

/**
 * Obtener historial de asistencias de un usuario
 * @param {ListAssistancesQuery} query
 * @returns {Promise<Array>} Lista de POJOs de asistencias con gimnasio
 */
const obtenerHistorialAsistencias = async (query) => {
  const filters = {
    userProfileId: query.userProfileId,
    gymId: query.gymId,
    startDate: query.startDate,
    endDate: query.endDate,
    page: query.page || 1,
    limit: query.limit || 100
  };

  const result = await assistanceRepository.findAssistances(filters, {
    includeGym: query.includeGymDetails !== false
  });

  return result.data; // Ya son POJOs
};

/**
 * Check-in con validación de geofence
 * NOTA: "auto" en el nombre es legacy. El usuario DEBE presionar el botón de check-in.
 * Esta función solo VALIDA que el usuario esté dentro del geofence del gimnasio.
 * @param {CreateAssistanceCommand} command
 */
const autoCheckIn = async (command) => {
  const hoy = new Date();
  const fecha = hoy.toISOString().split('T')[0];
  const hora = hoy.toTimeString().split(' ')[0];

  const idUserProfile = command.userProfileId;
  const idGym = command.gymId;

  // ⭐ NUEVA VALIDACIÓN: Verificar suscripción o trial
  const validation = await validateSubscriptionOrTrial(idUserProfile, idGym);
  const isTrialVisit = validation.reason === 'TRIAL_VISIT';

  // Validar que no haya registrado ya hoy
  const asistenciaHoy = await assistanceRepository.findAssistanceByUserAndDate(idUserProfile, fecha);
  if (asistenciaHoy) throw new ConflictError('Ya registraste asistencia hoy');

  // Gym + config geofence
  const gym = await gymRepository.findById(idGym);
  if (!gym) throw new NotFoundError('Gimnasio');

  // Verificar que auto check-in esté habilitado
  if (gym.auto_checkin_enabled === false) {
    throw new BusinessError('Auto check-in deshabilitado', 'AUTO_CHECKIN_DISABLED');
  }

  // Usar radio del geofence del gym
  const radius = gym.geofence_radius_meters ?? PROXIMITY_METERS;

  // Validar proximidad
  const distancia = calculateDistance(command.latitude, command.longitude, gym.latitude, gym.longitude);
  if (distancia > radius) {
    throw new BusinessError(
      `Estás fuera del rango del geofence (distancia: ${Math.round(distancia)} m, máximo: ${radius} m)`,
      'OUT_OF_GEOFENCE_RANGE'
    );
  }

  // Cargar user profile y racha
  const userProfile = await userProfileRepository.findById(idUserProfile);
  if (!userProfile) throw new NotFoundError('Usuario');

  const racha = await streakRepository.findById(userProfile.id_streak);
  if (!racha) throw new NotFoundError('Racha');

  // Crear asistencia
  const nuevaAsistencia = await assistanceRepository.createAssistance({
    id_user_profile: idUserProfile,
    id_gym: idGym,
    date: fecha,
    check_in_time: hora,
    auto_checkin: true,
    distance_meters: Math.round(distancia),
    verified: true
  });

  // ⭐ Si es trial, marcar como usado
  if (isTrialVisit) {
    const { userGymRepository } = require('../infra/db/repositories');
    await userGymRepository.markTrialAsUsed(idUserProfile, idGym, fecha);
  }

  // Actualizar racha
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);
  const fechaAyer = ayer.toISOString().split('T')[0];

  const ultimaAsistencia = await assistanceRepository.findYesterdayAssistance(idUserProfile, idGym, fechaAyer);

  let updatedStreak;
  if (ultimaAsistencia) {
    updatedStreak = await streakRepository.updateStreak(racha.id_streak, {
      value: racha.value + 1
    });
  } else {
    if (racha.recovery_items > 0) {
      updatedStreak = await streakRepository.updateStreak(racha.id_streak, {
        recovery_items: racha.recovery_items - 1
      });
    } else {
      updatedStreak = await streakRepository.updateStreak(racha.id_streak, {
        last_value: racha.value,
        value: 1
      });
    }
  }

  // Otorgar tokens usando ledger
  const { newBalance } = await tokenLedgerService.registrarMovimiento({
    userId: idUserProfile,
    delta: TOKENS.ATTENDANCE,
    reason: TOKEN_REASONS.ATTENDANCE,
    refType: 'assistance',
    refId: nuevaAsistencia.id_assistance
  });

  // Actualizar frecuencia semanal
  await frequencyService.actualizarAsistenciaSemanal(idUserProfile);
  await syncAttendanceAchievements(idUserProfile);

  return {
    asistencia: nuevaAsistencia,
    distancia: Math.round(distancia),
    tokens_actuales: newBalance,
    racha_actual: updatedStreak.value
  };
};

/**
 * Registrar presencia del usuario en el rango geofence
 * Si ya existe una presencia activa, actualizar last_seen_at
 * Si no existe, crear nueva presencia
 *
 * @param {RegisterPresenceCommand} command
 * @returns {Promise<Object>} POJO con presencia
 */
const registrarPresencia = async (command) => {
  // Verificar que usuario es PREMIUM
  const userProfile = await userProfileRepository.findById(command.userProfileId);
  if (!userProfile) throw new NotFoundError('Usuario');

  if (userProfile.app_tier !== 'PREMIUM') {
    throw new BusinessError(
      'Auto check-in es una función exclusiva para usuarios PREMIUM. ¡Actualiza tu suscripción para disfrutar de esta y otras ventajas!',
      'PREMIUM_FEATURE_REQUIRED'
    );
  }

  const gym = await gymRepository.findById(command.gymId);
  if (!gym) throw new NotFoundError('Gimnasio');

  const radius = gym.geofence_radius_meters ?? PROXIMITY_METERS;
  const distancia = calculateDistance(command.latitude, command.longitude, gym.latitude, gym.longitude);

  if (distancia > radius) {
    throw new BusinessError(
      `Fuera de rango geofence (distancia: ${Math.round(distancia)}m, máximo: ${radius}m)`,
      'OUT_OF_GEOFENCE_RANGE'
    );
  }

  const ahora = new Date();

  // Verificar presencia activa (DETECTING o CONFIRMED)
  let presencia = await presenceRepository.findActivePresence(command.userProfileId, command.gymId);

  if (presencia) {
    // Actualizar presencia existente
    presencia = await presenceRepository.updatePresence(presencia.id_presence, {
      last_seen_at: ahora,
      distance_meters: Math.round(distancia),
      location_updates_count: presencia.location_updates_count + 1
    });

    // Calcular duración de permanencia
    const duracionMinutos = (ahora - new Date(presencia.first_seen_at)) / 60000;

    return {
      presencia,
      duracion_minutos: Math.round(duracionMinutos),
      min_stay_minutes: gym.min_stay_minutes || 10,
      listo_para_checkin: duracionMinutos >= (gym.min_stay_minutes || 10)
    };
  }

  // Crear nueva presencia
  presencia = await presenceRepository.createPresence({
    id_user_profile: command.userProfileId,
    id_gym: command.gymId,
    first_seen_at: ahora,
    last_seen_at: ahora,
    status: 'DETECTING',
    distance_meters: Math.round(distancia),
    location_updates_count: 1
  });

  return {
    presencia,
    duracion_minutos: 0,
    min_stay_minutes: gym.min_stay_minutes || 10,
    listo_para_checkin: false
  };
};

/**
 * Verificar si usuario cumplió permanencia mínima
 * Si sí, registrar auto check-in y marcar presencia como completada
 *
 * @param {VerifyAutoCheckInCommand} command
 * @returns {Promise<Object>} POJO resultado del auto check-in
 */
const verificarAutoCheckIn = async (command) => {
  // Verificar que usuario es PREMIUM
  const userProfile = await userProfileRepository.findById(command.userProfileId);
  if (!userProfile) throw new NotFoundError('Usuario');

  if (userProfile.app_tier !== 'PREMIUM') {
    throw new BusinessError(
      'Auto check-in es una función exclusiva para usuarios PREMIUM. ¡Actualiza tu suscripción!',
      'PREMIUM_FEATURE_REQUIRED'
    );
  }

  // ⭐ NUEVA VALIDACIÓN: Verificar suscripción o trial
  const validation = await validateSubscriptionOrTrial(command.userProfileId, command.gymId);
  const isTrialVisit = validation.reason === 'TRIAL_VISIT';

  // Buscar presencia activa
  const presencias = await presenceRepository.findAll({
    filters: {
      userProfileId: command.userProfileId,
      gymId: command.gymId,
      status: 'DETECTING',
      convertedToAssistance: false
    }
  });

  if (!presencias.data || presencias.data.length === 0) {
    throw new BusinessError('No hay presencia activa para verificar', 'NO_ACTIVE_PRESENCE');
  }

  const presencia = presencias.data[0];

  const gym = await gymRepository.findById(command.gymId);
  if (!gym) throw new NotFoundError('Gimnasio');

  const ahora = new Date();
  const duracionMinutos = (ahora - new Date(presencia.first_seen_at)) / 60000;
  const minStayMinutes = gym.min_stay_minutes || 10;

  if (duracionMinutos < minStayMinutes) {
    throw new BusinessError(
      `Permanencia insuficiente (${Math.round(duracionMinutos)}/${minStayMinutes} min)`,
      'MIN_STAY_NOT_MET'
    );
  }

  // Verificar que no haya registrado asistencia hoy
  const hoy = ahora.toISOString().split('T')[0];
  const asistenciaHoy = await assistanceRepository.findAssistanceByUserAndDate(command.userProfileId, hoy);

  if (asistenciaHoy) {
    throw new ConflictError('Ya registraste asistencia hoy');
  }

  // Cargar racha
  const racha = await streakRepository.findById(userProfile.id_streak);
  if (!racha) throw new NotFoundError('Racha');

  // Registrar asistencia
  const hora = ahora.toTimeString().split(' ')[0];
  const nuevaAsistencia = await assistanceRepository.createAssistance({
    id_user_profile: command.userProfileId,
    id_gym: command.gymId,
    date: hoy,
    check_in_time: hora,
    auto_checkin: true,
    distance_meters: presencia.distance_meters,
    verified: true
  });

  // ⭐ Si es trial, marcar como usado
  if (isTrialVisit) {
    const { userGymRepository } = require('../infra/db/repositories');
    await userGymRepository.markTrialAsUsed(command.userProfileId, command.gymId, hoy);
  }

  // Actualizar racha
  const ayer = new Date(ahora);
  ayer.setDate(ahora.getDate() - 1);
  const fechaAyer = ayer.toISOString().split('T')[0];

  const ultimaAsistencia = await assistanceRepository.findYesterdayAssistance(command.userProfileId, command.gymId, fechaAyer);

  let updatedStreak;
  if (ultimaAsistencia) {
    updatedStreak = await streakRepository.updateStreak(racha.id_streak, {
      value: racha.value + 1
    });
  } else {
    if (racha.recovery_items > 0) {
      updatedStreak = await streakRepository.updateStreak(racha.id_streak, {
        recovery_items: racha.recovery_items - 1
      });
    } else {
      updatedStreak = await streakRepository.updateStreak(racha.id_streak, {
        last_value: racha.value,
        value: 1
      });
    }
  }

  // Otorgar tokens
  const { newBalance } = await tokenLedgerService.registrarMovimiento({
    userId: command.userProfileId,
    delta: TOKENS.ATTENDANCE,
    reason: TOKEN_REASONS.ATTENDANCE,
    refType: 'assistance',
    refId: nuevaAsistencia.id_assistance
  });

  // Actualizar frecuencia
  await frequencyService.actualizarAsistenciaSemanal(command.userProfileId);
  await syncAttendanceAchievements(command.userProfileId);

  // Marcar presencia como completada
  await presenceRepository.markAsConvertedToAssistance(presencia.id_presence, nuevaAsistencia.id_assistance);

  return {
    asistencia: nuevaAsistencia,
    duracion_minutos: Math.round(duracionMinutos),
    tokens_actuales: newBalance,
    racha_actual: updatedStreak.value
  };
};

module.exports = {
  registrarAsistencia,
  obtenerHistorialAsistencias,
  checkOut,
  autoCheckIn,
  registrarPresencia,
  verificarAutoCheckIn,
  calculateDistance
};
