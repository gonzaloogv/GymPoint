/**
 * Tests para assistance-service - registrarPresencia y verificarAutoCheckIn
 */

const {
  mockUserProfileRepository,
  mockGymRepository,
  mockPresenceRepository,
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

describe('assistance-service registrarPresencia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('crea nueva presencia para usuario PREMIUM dentro del geofence', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    };

    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      app_tier: 'PREMIUM',
    });

    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      geofence_radius_meters: 150,
      latitude: 40.416775,
      longitude: -3.703790,
      min_stay_minutes: 10,
    });

    mockGeoUtils.calculateDistance.mockReturnValue(50);
    mockPresenceRepository.findActivePresence.mockResolvedValue(null);
    mockPresenceRepository.createPresence.mockResolvedValue({
      id_presence: 1,
      id_user_profile: 1,
      id_gym: 1,
      first_seen_at: new Date(),
      last_seen_at: new Date(),
      status: 'DETECTING',
      distance_meters: 50,
      location_updates_count: 1,
    });
    mockPresenceRepository.countActiveByGym.mockResolvedValue(5);

    const result = await assistanceService.registrarPresencia(command);

    expect(result).toMatchObject({
      presencia: expect.objectContaining({
        id_presence: 1,
        status: 'DETECTING',
      }),
      duracion_minutos: 0,
      min_stay_minutes: 10,
      listo_para_checkin: false,
    });

    expect(mockPresenceRepository.createPresence).toHaveBeenCalledWith({
      id_user_profile: 1,
      id_gym: 1,
      first_seen_at: expect.any(Date),
      last_seen_at: expect.any(Date),
      status: 'DETECTING',
      distance_meters: 50,
      location_updates_count: 1,
    });
  });

  it('actualiza presencia existente e incrementa contador', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    };

    const now = new Date();
    const firstSeen = new Date(now.getTime() - 15 * 60000); // 15 min atrás

    mockUserProfileRepository.findById.mockResolvedValue({
      app_tier: 'PREMIUM',
    });

    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      geofence_radius_meters: 100,
      latitude: 40.416775,
      longitude: -3.703790,
      min_stay_minutes: 10,
    });

    mockGeoUtils.calculateDistance.mockReturnValue(30);
    mockPresenceRepository.findActivePresence.mockResolvedValue({
      id_presence: 1,
      first_seen_at: firstSeen,
      location_updates_count: 5,
    });

    mockPresenceRepository.updatePresence.mockResolvedValue({
      id_presence: 1,
      first_seen_at: firstSeen,
      last_seen_at: now,
      location_updates_count: 6,
    });

    mockPresenceRepository.countActiveByGym.mockResolvedValue(5);

    const result = await assistanceService.registrarPresencia(command);

    expect(result).toMatchObject({
      duracion_minutos: 15,
      listo_para_checkin: true, // >= 10 min
    });

    expect(mockPresenceRepository.updatePresence).toHaveBeenCalledWith(1, {
      last_seen_at: expect.any(Date),
      distance_meters: 30,
      location_updates_count: 6,
    });
  });

  it('lanza BusinessError si usuario no es PREMIUM', async () => {
    mockUserProfileRepository.findById.mockResolvedValue({
      app_tier: 'FREE',
    });

    await expect(
      assistanceService.registrarPresencia({
        userProfileId: 1,
        gymId: 1,
        latitude: 40.416775,
        longitude: -3.703790,
      })
    ).rejects.toThrow(mockErrors.BusinessError);

    await expect(
      assistanceService.registrarPresencia({
        userProfileId: 1,
        gymId: 1,
        latitude: 40.416775,
        longitude: -3.703790,
      })
    ).rejects.toThrow(/Auto check-in es una función exclusiva para usuarios PREMIUM/);
  });

  it('lanza NotFoundError si usuario no existe', async () => {
    mockUserProfileRepository.findById.mockResolvedValue(null);

    await expect(
      assistanceService.registrarPresencia({
        userProfileId: 999,
        gymId: 1,
        latitude: 40.416775,
        longitude: -3.703790,
      })
    ).rejects.toThrow(mockErrors.NotFoundError);
  });

  it('lanza NotFoundError si gimnasio no existe', async () => {
    mockUserProfileRepository.findById.mockResolvedValue({
      app_tier: 'PREMIUM',
    });
    mockGymRepository.findById.mockResolvedValue(null);

    await expect(
      assistanceService.registrarPresencia({
        userProfileId: 1,
        gymId: 999,
        latitude: 40.416775,
        longitude: -3.703790,
      })
    ).rejects.toThrow(mockErrors.NotFoundError);
  });

  it('lanza BusinessError si está fuera del geofence', async () => {
    mockUserProfileRepository.findById.mockResolvedValue({
      app_tier: 'PREMIUM',
    });
    mockGymRepository.findById.mockResolvedValue({
      geofence_radius_meters: 100,
      latitude: 40.416775,
      longitude: -3.703790,
    });
    mockGeoUtils.calculateDistance.mockReturnValue(200);

    await expect(
      assistanceService.registrarPresencia({
        userProfileId: 1,
        gymId: 1,
        latitude: 41.416775,
        longitude: -4.703790,
      })
    ).rejects.toThrow(mockErrors.BusinessError);
  });

  it('emite evento de actualización de presencia', async () => {
    mockUserProfileRepository.findById.mockResolvedValue({
      app_tier: 'PREMIUM',
    });
    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      geofence_radius_meters: 100,
      latitude: 40.416775,
      longitude: -3.703790,
    });
    mockGeoUtils.calculateDistance.mockReturnValue(50);
    mockPresenceRepository.findActivePresence.mockResolvedValue(null);
    mockPresenceRepository.createPresence.mockResolvedValue({
      id_presence: 1,
    });
    mockPresenceRepository.countActiveByGym.mockResolvedValue(8);

    await assistanceService.registrarPresencia({
      userProfileId: 1,
      gymId: 1,
      latitude: 40.416775,
      longitude: -3.703790,
    });

    expect(mockEventEmitter.emitEvent).toHaveBeenCalledWith(
      'PRESENCE_UPDATED',
      expect.objectContaining({
        gymId: 1,
        currentCount: 8,
      })
    );
  });
});

describe('assistance-service verificarAutoCheckIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  it('registra auto check-in después de permanencia mínima', async () => {
    const command = {
      userProfileId: 1,
      gymId: 1,
    };

    const now = new Date();
    const firstSeen = new Date(now.getTime() - 12 * 60000); // 12 min atrás

    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      app_tier: 'PREMIUM',
      id_streak: 1,
    });

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
    });

    mockPresenceRepository.findAll.mockResolvedValue({
      data: [
        {
          id_presence: 1,
          first_seen_at: firstSeen,
          status: 'DETECTING',
          converted_to_assistance: false,
          distance_meters: 50,
        },
      ],
    });

    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      min_stay_minutes: 10,
      latitude: 40.416775,
      longitude: -3.703790,
    });

    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    mockStreakRepository.findById.mockResolvedValue({
      id_streak: 1,
      value: 5,
      max_value: 10,
    });

    mockAssistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 1,
    });

    mockFrequencyRepository.findByUserProfileId.mockResolvedValue(null);
    mockStreakRepository.updateStreak.mockResolvedValue({ value: 6 });
    mockRewardService.getActiveMultiplier.mockResolvedValue(1);
    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({
      newBalance: 110,
    });
    mockFrequencyService.actualizarAsistenciaSemanal.mockResolvedValue({});
    mockAchievementService.syncAllAchievementsForUser.mockResolvedValue([]);
    mockAchievementSideEffects.processUnlockResults.mockResolvedValue();
    mockPresenceRepository.markAsConvertedToAssistance.mockResolvedValue();
    mockPresenceRepository.countActiveByGym.mockResolvedValue(4);

    const result = await assistanceService.verificarAutoCheckIn(command);

    expect(result).toMatchObject({
      asistencia: expect.objectContaining({
        id_assistance: 1,
      }),
      duracion_minutos: 12,
      tokens_actuales: 110,
      racha_actual: 6,
    });

    expect(mockPresenceRepository.markAsConvertedToAssistance).toHaveBeenCalledWith(1, 1);
  });

  it('lanza BusinessError si usuario no es PREMIUM', async () => {
    mockUserProfileRepository.findById.mockResolvedValue({
      app_tier: 'FREE',
    });

    await expect(
      assistanceService.verificarAutoCheckIn({
        userProfileId: 1,
        gymId: 1,
      })
    ).rejects.toThrow(mockErrors.BusinessError);
  });

  it('lanza BusinessError si no tiene suscripción activa', async () => {
    mockUserProfileRepository.findById.mockResolvedValue({
      app_tier: 'PREMIUM',
    });

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: false,
      trial_used: true,
    });

    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      name: 'Gym Test',
      trial_allowed: true,
    });

    await expect(
      assistanceService.verificarAutoCheckIn({
        userProfileId: 1,
        gymId: 1,
      })
    ).rejects.toThrow(mockErrors.BusinessError);
  });

  it('lanza BusinessError si no hay presencia activa', async () => {
    mockUserProfileRepository.findById.mockResolvedValue({
      app_tier: 'PREMIUM',
    });

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
    });

    mockPresenceRepository.findAll.mockResolvedValue({
      data: [],
    });

    await expect(
      assistanceService.verificarAutoCheckIn({
        userProfileId: 1,
        gymId: 1,
      })
    ).rejects.toThrow(mockErrors.BusinessError);

    await expect(
      assistanceService.verificarAutoCheckIn({
        userProfileId: 1,
        gymId: 1,
      })
    ).rejects.toThrow(/No hay presencia activa para verificar/);
  });

  it('lanza BusinessError si permanencia es insuficiente', async () => {
    const now = new Date();
    const firstSeen = new Date(now.getTime() - 5 * 60000); // Solo 5 min

    mockUserProfileRepository.findById.mockResolvedValue({
      app_tier: 'PREMIUM',
    });

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
    });

    mockPresenceRepository.findAll.mockResolvedValue({
      data: [
        {
          id_presence: 1,
          first_seen_at: firstSeen,
          status: 'DETECTING',
          converted_to_assistance: false,
        },
      ],
    });

    mockGymRepository.findById.mockResolvedValue({
      min_stay_minutes: 10,
    });

    await expect(
      assistanceService.verificarAutoCheckIn({
        userProfileId: 1,
        gymId: 1,
      })
    ).rejects.toThrow(mockErrors.BusinessError);

    await expect(
      assistanceService.verificarAutoCheckIn({
        userProfileId: 1,
        gymId: 1,
      })
    ).rejects.toThrow(/Permanencia insuficiente/);
  });

  it('lanza ConflictError si ya registró asistencia hoy', async () => {
    const now = new Date();
    const firstSeen = new Date(now.getTime() - 15 * 60000);

    mockUserProfileRepository.findById.mockResolvedValue({
      app_tier: 'PREMIUM',
    });

    mockUserGymRepository.findByUserAndGym.mockResolvedValue({
      is_active: true,
      subscription_end: '2025-12-31',
    });

    mockPresenceRepository.findAll.mockResolvedValue({
      data: [
        {
          id_presence: 1,
          first_seen_at: firstSeen,
          status: 'DETECTING',
          converted_to_assistance: false,
        },
      ],
    });

    mockGymRepository.findById.mockResolvedValue({
      min_stay_minutes: 10,
    });

    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue({
      id_assistance: 1,
    });

    await expect(
      assistanceService.verificarAutoCheckIn({
        userProfileId: 1,
        gymId: 1,
      })
    ).rejects.toThrow(mockErrors.ConflictError);
  });

  it('marca trial como usado si es trial visit', async () => {
    const now = new Date();
    const firstSeen = new Date(now.getTime() - 12 * 60000);

    mockUserProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      app_tier: 'PREMIUM',
      id_streak: 1,
    });

    // Trial visit: no tiene user_gym
    mockUserGymRepository.findByUserAndGym.mockResolvedValue(null);

    mockGymRepository.findById.mockResolvedValue({
      id_gym: 1,
      trial_allowed: true,
      min_stay_minutes: 10,
    });

    mockPresenceRepository.findAll.mockResolvedValue({
      data: [
        {
          id_presence: 1,
          first_seen_at: firstSeen,
          status: 'DETECTING',
          distance_meters: 50,
        },
      ],
    });

    mockAssistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    mockStreakRepository.findById.mockResolvedValue({
      id_streak: 1,
      value: 0,
    });
    mockAssistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 1,
    });
    mockUserGymRepository.markTrialAsUsed.mockResolvedValue();
    mockFrequencyRepository.findByUserProfileId.mockResolvedValue(null);
    mockStreakRepository.updateStreak.mockResolvedValue({ value: 1 });
    mockRewardService.getActiveMultiplier.mockResolvedValue(1);
    mockTokenLedgerService.registrarMovimiento.mockResolvedValue({
      newBalance: 10,
    });
    mockFrequencyService.actualizarAsistenciaSemanal.mockResolvedValue({});
    mockAchievementService.syncAllAchievementsForUser.mockResolvedValue([]);
    mockAchievementSideEffects.processUnlockResults.mockResolvedValue();
    mockPresenceRepository.markAsConvertedToAssistance.mockResolvedValue();
    mockPresenceRepository.countActiveByGym.mockResolvedValue(1);

    await assistanceService.verificarAutoCheckIn({
      userProfileId: 1,
      gymId: 1,
    });

    expect(mockUserGymRepository.markTrialAsUsed).toHaveBeenCalledWith(
      1,
      1,
      expect.any(String)
    );
  });
});
