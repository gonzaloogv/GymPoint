/**
 * Tests para assistance-service - autoCheckIn
 */

const {
  mockUserProfileRepository,
  mockGymRepository,
  mockAssistanceRepository,
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
} = require('./test-setup');

const assistanceService = require('../../../../services/assistance-service');

describe('assistance-service autoCheckIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registra auto check-in exitosamente dentro del geofence', async () => {
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
      auto_checkin_enabled: true,
      geofence_radius_meters: 150,
      latitude: 40.416775,
      longitude: -3.703790,
    });

    mockGeoUtils.calculateDistance.mockReturnValue(100);

    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      id_streak: 1,
    });

    mockStreakRepository.findById.mockResolvedValue({
      id_streak: 1,
      value: 5,
      max_value: 10,
    });

    mockAssistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 1,
      id_user_profile: 1,
      id_gym: 1,
      date: '2025-01-15',
      check_in_time: '10:00:00',
      auto_checkin: true,
      distance_meters: 100,
      verified: true,
    });

    mockFrequencyRepository.findByUserProfileId.mockResolvedValue(null);

    mockStreakRepository.updateStreak.mockResolvedValue({
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

    const result = await assistanceService.autoCheckIn(command);

    expect(result).toMatchObject({
      asistencia: expect.objectContaining({
        id_assistance: 1,
        auto_checkin: true,
      }),
      distancia: 100,
      tokens_actuales: 110,
      racha_actual: 6,
    });

    expect(mockAssistanceRepository.createAssistance).toHaveBeenCalledWith(
      expect.objectContaining({
        auto_checkin: true,
        verified: true,
        distance_meters: 100,
      })
    );
  });

  it('lanza BusinessError si auto_checkin_enabled es false', async () => {
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
      auto_checkin_enabled: false,
      latitude: 40.416775,
      longitude: -3.703790,
    });

    await expect(assistanceService.autoCheckIn(command)).rejects.toThrow(
      mockErrors.BusinessError
    );
    await expect(assistanceService.autoCheckIn(command)).rejects.toThrow(
      /Auto check-in deshabilitado/
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
      date: '2025-01-15',
    });

    await expect(assistanceService.autoCheckIn(command)).rejects.toThrow(
      mockErrors.ConflictError
    );
    await expect(assistanceService.autoCheckIn(command)).rejects.toThrow(
      /Ya registraste asistencia hoy/
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

    await expect(assistanceService.autoCheckIn(command)).rejects.toThrow(
      mockErrors.NotFoundError
    );
    await expect(assistanceService.autoCheckIn(command)).rejects.toThrow(/Gimnasio/);
  });

  it('lanza BusinessError si está fuera del geofence', async () => {
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
      auto_checkin_enabled: true,
      geofence_radius_meters: 100,
      latitude: 40.416775,
      longitude: -3.703790,
    });

    mockGeoUtils.calculateDistance.mockReturnValue(5000);

    await expect(assistanceService.autoCheckIn(command)).rejects.toThrow(
      mockErrors.BusinessError
    );
    await expect(assistanceService.autoCheckIn(command)).rejects.toThrow(
      /fuera del rango del geofence/
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
      auto_checkin_enabled: true,
      geofence_radius_meters: 100,
      latitude: 40.416775,
      longitude: -3.703790,
    });

    mockGeoUtils.calculateDistance.mockReturnValue(50);
    mockUserProfileRepository.findById.mockResolvedValue(null);

    await expect(assistanceService.autoCheckIn(command)).rejects.toThrow(
      mockErrors.NotFoundError
    );
    await expect(assistanceService.autoCheckIn(command)).rejects.toThrow(/Usuario/);
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
      auto_checkin_enabled: true,
      geofence_radius_meters: 100,
      latitude: 40.416775,
      longitude: -3.703790,
    });

    mockGeoUtils.calculateDistance.mockReturnValue(50);

    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      id_streak: 1,
    });

    mockStreakRepository.findById.mockResolvedValue(null);

    await expect(assistanceService.autoCheckIn(command)).rejects.toThrow(
      mockErrors.NotFoundError
    );
    await expect(assistanceService.autoCheckIn(command)).rejects.toThrow(/Racha/);
  });

  it('marca trial como usado si es trial visit', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    };

    // Trial visit: no tiene user_gym
    mockUserGymRepository.findByUserAndGym.mockResolvedValue(null);

    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);

    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      trial_allowed: true,
      auto_checkin_enabled: true,
      geofence_radius_meters: 100,
      latitude: 40.416775,
      longitude: -3.703790,
    });

    mockGeoUtils.calculateDistance.mockReturnValue(50);

    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      id_streak: 1,
    });

    mockStreakRepository.findById.mockResolvedValue({
      id_streak: 1,
      value: 0,
      max_value: 0,
    });

    mockAssistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 1,
      auto_checkin: true,
    });

    mockUserGymRepository.markTrialAsUsed.mockResolvedValue();

    mockFrequencyRepository.findByUserProfileId.mockResolvedValue(null);
    mockStreakRepository.updateStreak.mockResolvedValue({ value: 1 });
    mockRewardService.getActiveMultiplier.mockResolvedValue(1);
    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 10 });
    mockFrequencyService.actualizarAsistenciaSemanal.mockResolvedValue({});
    mockAchievementService.syncAllAchievementsForUser.mockResolvedValue([]);
    mockAchievementSideEffects.processUnlockResults.mockResolvedValue();

    await assistanceService.autoCheckIn(command);

    expect(mockUserGymRepository.markTrialAsUsed).toHaveBeenCalledWith(
      1,
      1,
      expect.any(String)
    );
  });

  it('aplica multiplicador a tokens de asistencia', async () => {
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
      auto_checkin_enabled: true,
      geofence_radius_meters: 100,
      latitude: 40.416775,
      longitude: -3.703790,
    });

    mockGeoUtils.calculateDistance.mockReturnValue(50);

    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      id_streak: 1,
    });

    mockStreakRepository.findById.mockResolvedValue({
      id_streak: 1,
      value: 5,
      max_value: 10,
    });

    mockAssistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 1,
      auto_checkin: true,
    });

    mockFrequencyRepository.findByUserProfileId.mockResolvedValue(null);
    mockStreakRepository.updateStreak.mockResolvedValue({ value: 6 });

    // Multiplicador x2
    mockRewardService.getActiveMultiplier.mockResolvedValue(2);

    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({
      newBalance: 120,
    });

    mockFrequencyService.actualizarAsistenciaSemanal.mockResolvedValue({});
    mockAchievementService.syncAllAchievementsForUser.mockResolvedValue([]);
    mockAchievementSideEffects.processUnlockResults.mockResolvedValue();

    await assistanceService.autoCheckIn(command);

    expect(mockTokenLedgerService.registrarMovimiento).toHaveBeenCalledWith(
      expect.objectContaining({
        delta: 20, // 10 tokens base * 2 multiplier
      })
    );
  });

  it('resetea racha si no cumplió frecuencia semanal', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    };

    const hoy = new Date();
    const weekStart = new Date(hoy);
    weekStart.setDate(weekStart.getDate() - 8); // Hace 8 días

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
    });

    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);

    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      auto_checkin_enabled: true,
      geofence_radius_meters: 100,
      latitude: 40.416775,
      longitude: -3.703790,
    });

    mockGeoUtils.calculateDistance.mockReturnValue(50);

    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      id_streak: 1,
    });

    mockStreakRepository.findById.mockResolvedValue({
      id_streak: 1,
      value: 10,
      max_value: 15,
    });

    mockAssistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 1,
      auto_checkin: true,
    });

    // Frecuencia: no cumplió meta (2 de 4)
    mockFrequencyRepository.findByUserProfileId.mockResolvedValue({
      assist: 2,
      goal: 4,
      week_start_date: weekStart.toISOString().split('T')[0],
    });

    mockStreakRepository.updateStreak.mockResolvedValue({
      value: 1,
      last_value: 10,
    });

    mockRewardService.getActiveMultiplier.mockResolvedValue(1);
    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 110 });
    mockFrequencyService.actualizarAsistenciaSemanal.mockResolvedValue({});
    mockAchievementService.syncAllAchievementsForUser.mockResolvedValue([]);
    mockAchievementSideEffects.processUnlockResults.mockResolvedValue();

    const result = await assistanceService.autoCheckIn(command);

    expect(result.racha_actual).toBe(1);
    expect(mockStreakRepository.updateStreak).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        value: 1,
        last_value: 10,
      })
    );
  });

  it('continúa racha si cumplió frecuencia semanal', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    };

    const hoy = new Date();
    const weekStart = new Date(hoy);
    weekStart.setDate(weekStart.getDate() - 8); // Hace 8 días

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
    });

    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);

    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      auto_checkin_enabled: true,
      geofence_radius_meters: 100,
      latitude: 40.416775,
      longitude: -3.703790,
    });

    mockGeoUtils.calculateDistance.mockReturnValue(50);

    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      id_streak: 1,
    });

    mockStreakRepository.findById.mockResolvedValue({
      id_streak: 1,
      value: 10,
      max_value: 15,
    });

    mockAssistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 1,
      auto_checkin: true,
    });

    // Frecuencia: cumplió meta (4 de 4)
    mockFrequencyRepository.findByUserProfileId.mockResolvedValue({
      assist: 4,
      goal: 4,
      week_start_date: weekStart.toISOString().split('T')[0],
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

    const result = await assistanceService.autoCheckIn(command);

    expect(result.racha_actual).toBe(11);
    expect(mockStreakRepository.updateStreak).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        value: 11,
      })
    );
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
      auto_checkin_enabled: true,
      geofence_radius_meters: 100,
      latitude: 40.416775,
      longitude: -3.703790,
    });

    mockGeoUtils.calculateDistance.mockReturnValue(50);

    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      id_streak: 1,
    });

    mockStreakRepository.findById.mockResolvedValue({
      id_streak: 1,
      value: 5,
      max_value: 10,
    });

    mockAssistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 1,
      auto_checkin: true,
    });

    mockFrequencyRepository.findByUserProfileId.mockResolvedValue(null);
    mockStreakRepository.updateStreak.mockResolvedValue({ value: 6 });
    mockRewardService.getActiveMultiplier.mockResolvedValue(1);
    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 110 });
    mockFrequencyService.actualizarAsistenciaSemanal.mockResolvedValue({});
    mockAchievementService.syncAllAchievementsForUser.mockResolvedValue([]);
    mockAchievementSideEffects.processUnlockResults.mockResolvedValue();

    await assistanceService.autoCheckIn(command);

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
  });

  it('lanza BusinessError si no tiene suscripción ni trial', async () => {
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

    await expect(assistanceService.autoCheckIn(command)).rejects.toThrow(
      mockErrors.BusinessError
    );
  });
});
