/**
 * Tests para assistance-service - registrarAsistencia
 */

const {
  mockAssistanceRepository,
  mockGymRepository,
  mockUserProfileRepository,
  mockStreakRepository,
  mockUserGymRepository,
  mockFrequencyRepository,
  mockTokenLedgerService,
  mockRewardService,
  mockAchievementService,
  mockAchievementSideEffects,
  mockFrequencyService,
  mockErrors,
  mockGeoUtils,
  mockEventEmitter,
  mockConstants,
} = require('./test-setup');

const assistanceService = require('../../../../services/assistance-service');

describe('assistance-service registrarAsistencia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  it('registra asistencia exitosamente con suscripción activa', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
      accuracy: 10,
    };

    // Mock suscripción activa
    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
      trial_used: false,
    });

    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      name: 'Gym Test',
      latitude: 40.416775,
      longitude: -3.703790,
    });
    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      id_streak: 1,
    });
    mockStreakRepository.findById.mockResolvedValue({
      id_streak: 1,
      value: 5,
      max_value: 10,
      last_value: 5,
      recovery_items: 0,
    });
    mockGeoUtils.calculateDistance.mockReturnValue(50);
    mockAssistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 1,
      id_user_profile: 1,
      id_gym: 1,
      date: expect.any(String),
      check_in_time: expect.any(String),
    });
    mockFrequencyRepository.findByUserProfileId.mockResolvedValue(null);
    mockStreakRepository.updateStreak.mockResolvedValue({
      id_streak: 1,
      value: 6,
      max_value: 10,
    });
    mockRewardService.getActiveMultiplier.mockResolvedValue(1);
    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({
      newBalance: 110,
    });
    mockFrequencyService.actualizarAsistenciaSemanal.mockResolvedValue({
      assist: 3,
      goal: 4,
    });
    mockAchievementService.syncAllAchievementsForUser.mockResolvedValue([]);
    mockAchievementSideEffects.processUnlockResults.mockResolvedValue();

    const result = await assistanceService.registrarAsistencia(command);

    expect(result).toMatchObject({
      asistencia: expect.objectContaining({
        id_assistance: 1,
      }),
      distancia: 50,
      tokens_actuales: 110,
      racha_actual: 6,
    });

    expect(mockUserGymRepository.findByUserAndGym).toHaveBeenCalledWith(1, 1);
    expect(mockAssistanceRepository.createAssistance).toHaveBeenCalled();
    expect(mockStreakRepository.updateStreak).toHaveBeenCalledWith(1, {
      value: 6,
      max_value: 10,
      last_assistance_date: expect.any(String),
    });
    expect(mockTokenLedgerService.registrarMovimiento).toHaveBeenCalledWith({
      userId: 1,
      delta: 10,
      reason: 'ATTENDANCE',
      refType: 'assistance',
      refId: 1,
    });
  });

  it('registra asistencia con trial visit y marca trial como usado', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    };

    // Mock: usuario sin user_gym, gym permite trial
    mockUserGymRepository.findByUserAndGym.mockResolvedValue(null);
    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      name: 'Gym Test',
      latitude: 40.416775,
      longitude: -3.703790,
      trial_allowed: true,
    });
    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      id_streak: 1,
    });
    mockStreakRepository.findById.mockResolvedValue({
      id_streak: 1,
      value: 0,
      max_value: 0,
    });
    mockGeoUtils.calculateDistance.mockReturnValue(30);
    mockAssistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 1,
    });
    mockUserGymRepository.markTrialAsUsed.mockResolvedValue();
    mockFrequencyRepository.findByUserProfileId.mockResolvedValue(null);
    mockStreakRepository.updateStreak.mockResolvedValue({ value: 1 });
    mockRewardService.getActiveMultiplier.mockResolvedValue(1);
    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 10 });
    mockFrequencyService.actualizarAsistenciaSemanal.mockResolvedValue({});
    mockAchievementService.syncAllAchievementsForUser.mockResolvedValue([]);
    mockAchievementSideEffects.processUnlockResults.mockResolvedValue();

    await assistanceService.registrarAsistencia(command);

    expect(mockUserGymRepository.markTrialAsUsed).toHaveBeenCalledWith(
      1,
      1,
      expect.any(String)
    );
  });

  it('lanza BusinessError si no tiene suscripción ni trial disponible', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    };

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: false,
      trial_used: true,
    });
    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      name: 'Gym Test',
      trial_allowed: true,
    });

    await expect(assistanceService.registrarAsistencia(command)).rejects.toThrow(
      mockErrors.BusinessError
    );
    await expect(assistanceService.registrarAsistencia(command)).rejects.toThrow(
      /Ya utilizaste tu visita de prueba/
    );
  });

  it('lanza ConflictError si ya registró asistencia hoy', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    };

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
    });
    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue({
      id_assistance: 1,
    });

    await expect(assistanceService.registrarAsistencia(command)).rejects.toThrow(
      mockErrors.ConflictError
    );
    await expect(assistanceService.registrarAsistencia(command)).rejects.toThrow(
      'Ya registraste asistencia hoy'
    );
  });

  it('lanza ValidationError si accuracy es mayor al máximo', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
      accuracy: 100,
    };

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
    });
    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);

    await expect(assistanceService.registrarAsistencia(command)).rejects.toThrow(
      mockErrors.ValidationError
    );
  });

  it('lanza NotFoundError si gimnasio no existe', async () => {
    const command = {
      userProfileId: 1,
      gymId: 999,
      latitude: 40.416775,
      longitude: -3.703790,
    };

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
    });
    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    mockGymRepository.findById.mockResolvedValue(null);

    await expect(assistanceService.registrarAsistencia(command)).rejects.toThrow(
      mockErrors.NotFoundError
    );
    await expect(assistanceService.registrarAsistencia(command)).rejects.toThrow('Gimnasio');
  });

  it('lanza BusinessError si está fuera del rango de proximidad', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
      latitude: 41.416775,
      longitude: -4.703790,
    };

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
    });
    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      name: 'Gym Test',
      latitude: 40.416775,
      longitude: -3.703790,
    });
    mockGeoUtils.calculateDistance.mockReturnValue(5000);

    await expect(assistanceService.registrarAsistencia(command)).rejects.toThrow(
      mockErrors.BusinessError
    );
    await expect(assistanceService.registrarAsistencia(command)).rejects.toThrow(
      /fuera del rango del gimnasio/
    );
  });

  it('lanza NotFoundError si usuario no existe', async () => {
    const command = {
      userProfileId: 999,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    };

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
    });
    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    });
    mockGeoUtils.calculateDistance.mockReturnValue(50);
    mockUserProfileRepository.findById.mockResolvedValue(null);

    await expect(assistanceService.registrarAsistencia(command)).rejects.toThrow(
      mockErrors.NotFoundError
    );
    await expect(assistanceService.registrarAsistencia(command)).rejects.toThrow('Usuario');
  });

  it('lanza NotFoundError si racha no existe', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    };

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
    });
    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    });
    mockGeoUtils.calculateDistance.mockReturnValue(50);
    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      id_streak: 1,
    });
    mockStreakRepository.findById.mockResolvedValue(null);

    await expect(assistanceService.registrarAsistencia(command)).rejects.toThrow(
      mockErrors.NotFoundError
    );
    await expect(assistanceService.registrarAsistencia(command)).rejects.toThrow(
      'Racha no encontrada para el usuario'
    );
  });

  it('resetea streak si NO cumplió meta de semana anterior (nueva semana)', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    };

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
    });
    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    });
    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      id_streak: 1,
    });
    mockStreakRepository.findById.mockResolvedValue({
      id_streak: 1,
      value: 10,
      max_value: 15,
    });
    mockGeoUtils.calculateDistance.mockReturnValue(50);
    mockAssistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 1,
    });

    // Frequency con semana anterior hace 8 días, NO cumplió meta (2/4)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 8);
    mockFrequencyRepository.findByUserProfileId.mockResolvedValue({
      week_start_date: weekStart.toISOString().split('T')[0],
      assist: 2,
      goal: 4,
    });

    mockStreakRepository.updateStreak.mockResolvedValue({
      value: 1,
      last_value: 10,
      max_value: 15,
    });
    mockRewardService.getActiveMultiplier.mockResolvedValue(1);
    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 10 });
    mockFrequencyService.actualizarAsistenciaSemanal.mockResolvedValue({});
    mockAchievementService.syncAllAchievementsForUser.mockResolvedValue([]);
    mockAchievementSideEffects.processUnlockResults.mockResolvedValue();

    const result = await assistanceService.registrarAsistencia(command);

    expect(result.racha_actual).toBe(1);
    expect(mockStreakRepository.updateStreak).toHaveBeenCalledWith(1, {
      last_value: 10,
      value: 1,
      max_value: 15,
      last_assistance_date: expect.any(String),
    });
  });

  it('continúa incrementando streak si cumplió meta de semana anterior (nueva semana)', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    };

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
    });
    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    });
    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      id_streak: 1,
    });
    mockStreakRepository.findById.mockResolvedValue({
      id_streak: 1,
      value: 10,
      max_value: 15,
    });
    mockGeoUtils.calculateDistance.mockReturnValue(50);
    mockAssistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 1,
    });

    // Frequency con semana anterior hace 8 días, SÍ cumplió meta (4/4)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 8);
    mockFrequencyRepository.findByUserProfileId.mockResolvedValue({
      week_start_date: weekStart.toISOString().split('T')[0],
      assist: 4,
      goal: 4,
    });

    mockStreakRepository.updateStreak.mockResolvedValue({
      value: 11,
      max_value: 15,
    });
    mockRewardService.getActiveMultiplier.mockResolvedValue(1);
    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 110 });
    mockFrequencyService.actualizarAsistenciaSemanal.mockResolvedValue({});
    mockAchievementService.syncAllAchievementsForUser.mockResolvedValue([]);
    mockAchievementSideEffects.processUnlockResults.mockResolvedValue();

    const result = await assistanceService.registrarAsistencia(command);

    expect(result.racha_actual).toBe(11);
    expect(mockStreakRepository.updateStreak).toHaveBeenCalledWith(1, {
      value: 11,
      max_value: 15,
      last_assistance_date: expect.any(String),
    });
  });

  it('emite eventos WebSocket correctamente', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    };

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
    });
    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    });
    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      id_streak: 1,
    });
    mockStreakRepository.findById.mockResolvedValue({
      id_streak: 1,
      value: 5,
      max_value: 10,
    });
    mockGeoUtils.calculateDistance.mockReturnValue(50);
    mockAssistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 1,
    });
    mockFrequencyRepository.findByUserProfileId.mockResolvedValue(null);
    mockStreakRepository.updateStreak.mockResolvedValue({ value: 6, max_value: 10 });
    mockRewardService.getActiveMultiplier.mockResolvedValue(1);
    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 110 });
    mockFrequencyService.actualizarAsistenciaSemanal.mockResolvedValue({
      assist: 3,
      goal: 4,
      week_start_date: '2025-01-20',
      week_number: 3,
      year: 2025,
    });
    mockAchievementService.syncAllAchievementsForUser.mockResolvedValue([]);
    mockAchievementSideEffects.processUnlockResults.mockResolvedValue();

    await assistanceService.registrarAsistencia(command);

    expect(mockEventEmitter.emitEvent).toHaveBeenCalledWith(
      'ASSISTANCE_REGISTERED',
      expect.objectContaining({
        userId: 1,
        gymId: 1,
      })
    );
    expect(mockEventEmitter.emitEvent).toHaveBeenCalledWith(
      'ATTENDANCE_RECORDED',
      expect.objectContaining({
        userId: 1,
        gymId: 1,
        attendanceId: 1,
        tokensAwarded: 10,
        newBalance: 110,
        streak: 6,
      })
    );
    expect(mockEventEmitter.emitEvent).toHaveBeenCalledWith(
      'STREAK_UPDATED',
      expect.objectContaining({
        userProfileId: 1,
        currentStreak: 6,
      })
    );
  });

  it('emite evento de milestone al alcanzar 7 días de streak', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    };

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
    });
    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    });
    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      id_streak: 1,
    });
    mockStreakRepository.findById.mockResolvedValue({
      id_streak: 1,
      value: 6,
      max_value: 10,
    });
    mockGeoUtils.calculateDistance.mockReturnValue(50);
    mockAssistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 1,
    });
    mockFrequencyRepository.findByUserProfileId.mockResolvedValue(null);
    mockStreakRepository.updateStreak.mockResolvedValue({ value: 7, max_value: 10 });
    mockRewardService.getActiveMultiplier.mockResolvedValue(1);
    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 110 });
    mockFrequencyService.actualizarAsistenciaSemanal.mockResolvedValue({});
    mockAchievementService.syncAllAchievementsForUser.mockResolvedValue([]);
    mockAchievementSideEffects.processUnlockResults.mockResolvedValue();

    await assistanceService.registrarAsistencia(command);

    expect(mockEventEmitter.emitEvent).toHaveBeenCalledWith(
      'STREAK_MILESTONE',
      expect.objectContaining({
        userProfileId: 1,
        milestone: 7,
        currentStreak: 7,
        message: '¡Primera semana completada! 🎉',
      })
    );
  });

  it('aplica multiplicador de recompensa a los tokens', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    };

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
    });
    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    });
    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      id_streak: 1,
    });
    mockStreakRepository.findById.mockResolvedValue({
      id_streak: 1,
      value: 5,
      max_value: 10,
    });
    mockGeoUtils.calculateDistance.mockReturnValue(50);
    mockAssistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 1,
    });
    mockFrequencyRepository.findByUserProfileId.mockResolvedValue(null);
    mockStreakRepository.updateStreak.mockResolvedValue({ value: 6 });
    mockRewardService.getActiveMultiplier.mockResolvedValue(2); // Multiplicador x2
    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 120 });
    mockFrequencyService.actualizarAsistenciaSemanal.mockResolvedValue({});
    mockAchievementService.syncAllAchievementsForUser.mockResolvedValue([]);
    mockAchievementSideEffects.processUnlockResults.mockResolvedValue();

    await assistanceService.registrarAsistencia(command);

    expect(mockTokenLedgerService.registrarMovimiento).toHaveBeenCalledWith({
      userId: 1,
      delta: 20, // 10 * 2
      reason: 'ATTENDANCE',
      refType: 'assistance',
      refId: 1,
    });
  });
});
