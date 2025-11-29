/**
 * Test Unitario: assistance-service
 *
 * Este test sigue las mejores prácticas del Golden Sample:
 * - Aislamiento completo: Todos los repositorios y servicios están mockeados
 * - Setup y teardown consistente
 * - Estructura clara por funcionalidad
 * - Cobertura completa: happy path, edge cases, error handling
 */

jest.mock('../../../infra/db/repositories', () => ({
  assistanceRepository: {
    findAssistanceByUserAndDate: jest.fn(),
    createAssistance: jest.fn(),
    findAssistanceById: jest.fn(),
    updateAssistance: jest.fn(),
    findAssistances: jest.fn(),
  },
  gymRepository: {
    findById: jest.fn(),
  },
  userProfileRepository: {
    findById: jest.fn(),
  },
  streakRepository: {
    findById: jest.fn(),
    updateStreak: jest.fn(),
  },
  presenceRepository: {
    findActivePresence: jest.fn(),
    updatePresence: jest.fn(),
    createPresence: jest.fn(),
    findAll: jest.fn(),
    markAsConvertedToAssistance: jest.fn(),
    countActiveByGym: jest.fn(),
  },
  userGymRepository: {
    findByUserAndGym: jest.fn(),
    markTrialAsUsed: jest.fn(),
  },
  frequencyRepository: {
    findByUserProfileId: jest.fn(),
  },
}));

jest.mock('../../../services/token-ledger-service', () => ({
  registrarMovimiento: jest.fn(),
  existeMovimiento: jest.fn(),
}));

jest.mock('../../../services/reward-service', () => ({
  getActiveMultiplier: jest.fn(),
}));

jest.mock('../../../services/achievement-service', () => ({
  syncAllAchievementsForUser: jest.fn(),
}));

jest.mock('../../../services/achievement-side-effects', () => ({
  processUnlockResults: jest.fn(),
}));

jest.mock('../../../services/frequency-service', () => ({
  actualizarAsistenciaSemanal: jest.fn(),
}));

jest.mock('../../../utils/geo', () => ({
  calculateDistance: jest.fn(),
}));

jest.mock('../../../websocket/events/event-emitter', () => ({
  emitEvent: jest.fn(),
  EVENTS: {
    STREAK_UPDATED: 'streak:updated',
    STREAK_MILESTONE: 'streak:milestone',
    PROGRESS_WEEKLY_UPDATED: 'progress:weekly_updated',
    ATTENDANCE_RECORDED: 'attendance:recorded',
    PRESENCE_UPDATED: 'presence:updated',
    ASSISTANCE_REGISTERED: 'assistance:registered',
  },
}));

jest.mock('../../../config/constants', () => ({
  PROXIMITY_METERS: 100,
  ACCURACY_MAX_METERS: 50,
  TOKENS: {
    ATTENDANCE: 10,
  },
  TOKEN_REASONS: {
    ATTENDANCE: 'ATTENDANCE',
  },
}));

const {
  assistanceRepository,
  gymRepository,
  userProfileRepository,
  streakRepository,
  presenceRepository,
  userGymRepository,
  frequencyRepository,
} = require('../../../infra/db/repositories');

const tokenLedgerService = require('../../../services/token-ledger-service');
const rewardService = require('../../../services/reward-service');
const achievementService = require('../../../services/achievement-service');
const { processUnlockResults } = require('../../../services/achievement-side-effects');
const frequencyService = require('../../../services/frequency-service');
const { calculateDistance } = require('../../../utils/geo');
const { emitEvent, EVENTS } = require('../../../websocket/events/event-emitter');
const assistanceService = require('../../../services/assistance-service');

beforeEach(() => {
  jest.clearAllMocks();
  // Mock console.error para evitar logs en tests
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
  console.error.mockRestore();
  console.log.mockRestore();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('assistance-service registrarAsistencia', () => {
  const baseCommand = {
    userProfileId: 10,
    gymId: 5,
    latitude: 40.7128,
    longitude: -74.006,
    accuracy: 10,
  };

  const mockGym = {
    id_gym: 5,
    name: 'Gym Test',
    latitude: 40.7128,
    longitude: -74.006,
    trial_allowed: false,
  };

  const mockUserProfile = {
    id_user_profile: 10,
    id_streak: 10,
    app_tier: 'FREE',
  };

  const mockStreak = {
    id_streak: 10,
    value: 5,
    last_value: 4,
    max_value: 10,
    recovery_items: 0,
  };

  const mockUserGym = {
    id_user_gym: 1,
    id_user_profile: 10,
    id_gym: 5,
    is_active: true,
    subscription_end: '2025-12-31',
    trial_used: false,
  };

  it('registra asistencia exitosamente con suscripción activa', async () => {
    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    assistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    calculateDistance.mockReturnValue(50);
    gymRepository.findById.mockResolvedValue(mockGym);
    userProfileRepository.findById.mockResolvedValue(mockUserProfile);
    streakRepository.findById.mockResolvedValue(mockStreak);
    assistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 100,
      id_user_profile: 10,
      id_gym: 5,
      date: new Date().toISOString().split('T')[0],
    });
    streakRepository.updateStreak.mockResolvedValue({ ...mockStreak, value: 6 });
    rewardService.getActiveMultiplier.mockResolvedValue(1);
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 150 });
    frequencyService.actualizarAsistenciaSemanal.mockResolvedValue({
      goal: 3,
      assist: 2,
    });
    achievementService.syncAllAchievementsForUser.mockResolvedValue([]);

    const result = await assistanceService.registrarAsistencia(baseCommand);

    expect(assistanceRepository.createAssistance).toHaveBeenCalled();
    expect(streakRepository.updateStreak).toHaveBeenCalledWith(
      mockStreak.id_streak,
      expect.objectContaining({
        value: 6,
        max_value: 10,
      })
    );
    expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 10,
        delta: 10,
        reason: 'ATTENDANCE',
      })
    );
    expect(result).toEqual(
      expect.objectContaining({
        tokens_actuales: 150,
        racha_actual: 6,
        distancia: 50,
      })
    );
  });

  it('lanza error cuando ya registró asistencia hoy', async () => {
    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    assistanceRepository.findAssistanceByUserAndDate.mockResolvedValue({
      id_assistance: 99,
    });

    await expect(assistanceService.registrarAsistencia(baseCommand)).rejects.toThrow(
      'Ya registraste asistencia hoy'
    );
  });

  it('lanza error cuando GPS tiene baja precisión', async () => {
    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    assistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);

    await expect(
      assistanceService.registrarAsistencia({ ...baseCommand, accuracy: 60 })
    ).rejects.toThrow('GPS con baja precisión');
  });

  it('lanza error cuando gimnasio no existe', async () => {
    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    assistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    gymRepository.findById.mockResolvedValue(null);

    await expect(assistanceService.registrarAsistencia(baseCommand)).rejects.toThrow('Gimnasio');
  });

  it('lanza error cuando está fuera del rango del gimnasio', async () => {
    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    assistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    calculateDistance.mockReturnValue(150);
    gymRepository.findById.mockResolvedValue(mockGym);

    await expect(assistanceService.registrarAsistencia(baseCommand)).rejects.toThrow(
      'Estás fuera del rango del gimnasio'
    );
  });

  it('lanza error cuando usuario no existe', async () => {
    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    assistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    calculateDistance.mockReturnValue(50);
    gymRepository.findById.mockResolvedValue(mockGym);
    userProfileRepository.findById.mockResolvedValue(null);

    await expect(assistanceService.registrarAsistencia(baseCommand)).rejects.toThrow('Usuario');
  });

  it('permite trial visit cuando gym lo permite y no se ha usado', async () => {
    userGymRepository.findByUserAndGym.mockResolvedValue(null);
    gymRepository.findById.mockResolvedValue({ ...mockGym, trial_allowed: true });
    assistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    calculateDistance.mockReturnValue(50);
    userProfileRepository.findById.mockResolvedValue(mockUserProfile);
    streakRepository.findById.mockResolvedValue(mockStreak);
    assistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 100,
      id_user_profile: 10,
      id_gym: 5,
    });
    streakRepository.updateStreak.mockResolvedValue({ ...mockStreak, value: 6 });
    rewardService.getActiveMultiplier.mockResolvedValue(1);
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 150 });
    frequencyService.actualizarAsistenciaSemanal.mockResolvedValue({ goal: 3, assist: 2 });
    achievementService.syncAllAchievementsForUser.mockResolvedValue([]);

    await assistanceService.registrarAsistencia(baseCommand);

    expect(userGymRepository.markTrialAsUsed).toHaveBeenCalledWith(
      10,
      5,
      expect.any(String)
    );
  });

  it('lanza error cuando trial ya fue usado', async () => {
    userGymRepository.findByUserAndGym.mockResolvedValue({
      ...mockUserGym,
      is_active: false,
      trial_used: true,
    });
    gymRepository.findById.mockResolvedValue({ ...mockGym, trial_allowed: true });

    await expect(assistanceService.registrarAsistencia(baseCommand)).rejects.toThrow(
      'Ya utilizaste tu visita de prueba'
    );
  });

  it('lanza error cuando no tiene suscripción ni trial disponible', async () => {
    userGymRepository.findByUserAndGym.mockResolvedValue(null);
    gymRepository.findById.mockResolvedValue({ ...mockGym, trial_allowed: false });

    await expect(assistanceService.registrarAsistencia(baseCommand)).rejects.toThrow(
      'Necesitas una suscripción activa'
    );
  });

  it('resetea streak cuando no cumplió meta de frecuencia semanal', async () => {
    const weekOldDate = new Date();
    weekOldDate.setDate(weekOldDate.getDate() - 8);

    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    assistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    calculateDistance.mockReturnValue(50);
    gymRepository.findById.mockResolvedValue(mockGym);
    userProfileRepository.findById.mockResolvedValue(mockUserProfile);
    streakRepository.findById.mockResolvedValue(mockStreak);
    frequencyRepository.findByUserProfileId.mockResolvedValue({
      goal: 3,
      assist: 1,
      week_start_date: weekOldDate.toISOString().split('T')[0],
    });
    assistanceRepository.createAssistance.mockResolvedValue({ id_assistance: 100 });
    streakRepository.updateStreak.mockResolvedValue({ ...mockStreak, value: 1 });
    rewardService.getActiveMultiplier.mockResolvedValue(1);
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 150 });
    frequencyService.actualizarAsistenciaSemanal.mockResolvedValue({ goal: 3, assist: 1 });
    achievementService.syncAllAchievementsForUser.mockResolvedValue([]);

    await assistanceService.registrarAsistencia(baseCommand);

    expect(streakRepository.updateStreak).toHaveBeenCalledWith(
      mockStreak.id_streak,
      expect.objectContaining({
        value: 1,
        last_value: 5,
      })
    );
  });

  it('continúa incrementando streak cuando cumplió meta semanal', async () => {
    const weekOldDate = new Date();
    weekOldDate.setDate(weekOldDate.getDate() - 8);

    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    assistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    calculateDistance.mockReturnValue(50);
    gymRepository.findById.mockResolvedValue(mockGym);
    userProfileRepository.findById.mockResolvedValue(mockUserProfile);
    streakRepository.findById.mockResolvedValue(mockStreak);
    frequencyRepository.findByUserProfileId.mockResolvedValue({
      goal: 3,
      assist: 3,
      week_start_date: weekOldDate.toISOString().split('T')[0],
    });
    assistanceRepository.createAssistance.mockResolvedValue({ id_assistance: 100 });
    streakRepository.updateStreak.mockResolvedValue({ ...mockStreak, value: 6 });
    rewardService.getActiveMultiplier.mockResolvedValue(1);
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 150 });
    frequencyService.actualizarAsistenciaSemanal.mockResolvedValue({ goal: 3, assist: 3 });
    achievementService.syncAllAchievementsForUser.mockResolvedValue([]);

    await assistanceService.registrarAsistencia(baseCommand);

    expect(streakRepository.updateStreak).toHaveBeenCalledWith(
      mockStreak.id_streak,
      expect.objectContaining({
        value: 6,
      })
    );
  });

  it('aplica multiplicador de recompensa a los tokens', async () => {
    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    assistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    calculateDistance.mockReturnValue(50);
    gymRepository.findById.mockResolvedValue(mockGym);
    userProfileRepository.findById.mockResolvedValue(mockUserProfile);
    streakRepository.findById.mockResolvedValue(mockStreak);
    assistanceRepository.createAssistance.mockResolvedValue({ id_assistance: 100 });
    streakRepository.updateStreak.mockResolvedValue({ ...mockStreak, value: 6 });
    rewardService.getActiveMultiplier.mockResolvedValue(2);
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 170 });
    frequencyService.actualizarAsistenciaSemanal.mockResolvedValue({ goal: 3, assist: 2 });
    achievementService.syncAllAchievementsForUser.mockResolvedValue([]);

    await assistanceService.registrarAsistencia(baseCommand);

    expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalledWith(
      expect.objectContaining({
        delta: 20,
      })
    );
  });

  it('emite eventos de WebSocket correctamente', async () => {
    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    assistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    calculateDistance.mockReturnValue(50);
    gymRepository.findById.mockResolvedValue(mockGym);
    userProfileRepository.findById.mockResolvedValue(mockUserProfile);
    streakRepository.findById.mockResolvedValue(mockStreak);
    assistanceRepository.createAssistance.mockResolvedValue({ id_assistance: 100 });
    streakRepository.updateStreak.mockResolvedValue({ ...mockStreak, value: 6 });
    rewardService.getActiveMultiplier.mockResolvedValue(1);
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 150 });
    frequencyService.actualizarAsistenciaSemanal.mockResolvedValue({ goal: 3, assist: 2 });
    achievementService.syncAllAchievementsForUser.mockResolvedValue([]);

    await assistanceService.registrarAsistencia(baseCommand);

    expect(emitEvent).toHaveBeenCalledWith(
      EVENTS.ASSISTANCE_REGISTERED,
      expect.objectContaining({
        userId: 10,
        gymId: 5,
      })
    );
    expect(emitEvent).toHaveBeenCalledWith(
      EVENTS.STREAK_UPDATED,
      expect.objectContaining({
        userProfileId: 10,
        currentStreak: 6,
      })
    );
  });

  it('emite evento de milestone cuando alcanza milestone importante', async () => {
    const streakAt6 = { ...mockStreak, value: 6 };

    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    assistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    calculateDistance.mockReturnValue(50);
    gymRepository.findById.mockResolvedValue(mockGym);
    userProfileRepository.findById.mockResolvedValue(mockUserProfile);
    streakRepository.findById.mockResolvedValue(streakAt6);
    assistanceRepository.createAssistance.mockResolvedValue({ id_assistance: 100 });
    streakRepository.updateStreak.mockResolvedValue({ ...streakAt6, value: 7 });
    rewardService.getActiveMultiplier.mockResolvedValue(1);
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 150 });
    frequencyService.actualizarAsistenciaSemanal.mockResolvedValue({ goal: 3, assist: 2 });
    achievementService.syncAllAchievementsForUser.mockResolvedValue([]);

    await assistanceService.registrarAsistencia(baseCommand);

    expect(emitEvent).toHaveBeenCalledWith(
      EVENTS.STREAK_MILESTONE,
      expect.objectContaining({
        milestone: 7,
        currentStreak: 7,
      })
    );
  });
});

describe('assistance-service checkOut', () => {
  const baseCommand = {
    userProfileId: 10,
    assistanceId: 100,
  };

  const mockAssistance = {
    id_assistance: 100,
    id_user_profile: 10,
    id_gym: 5,
    check_in_time: '10:00:00',
    check_out_time: null,
    duration_minutes: null,
  };

  it('registra checkout y calcula duración correctamente', async () => {
    assistanceRepository.findAssistanceById.mockResolvedValue(mockAssistance);
    assistanceRepository.updateAssistance.mockResolvedValue({
      ...mockAssistance,
      check_out_time: '11:30:00',
      duration_minutes: 90,
    });
    tokenLedgerService.existeMovimiento.mockResolvedValue(false);
    rewardService.getActiveMultiplier.mockResolvedValue(1);
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 165 });

    const result = await assistanceService.checkOut(baseCommand);

    expect(assistanceRepository.updateAssistance).toHaveBeenCalledWith(
      100,
      expect.objectContaining({
        check_out_time: expect.any(String),
      })
    );
    expect(result.duration_minutes).toBeGreaterThan(0);
  });

  it('lanza error cuando asistencia no existe', async () => {
    assistanceRepository.findAssistanceById.mockResolvedValue(null);

    await expect(assistanceService.checkOut(baseCommand)).rejects.toThrow('Asistencia');
  });

  it('lanza error cuando usuario no es dueño de la asistencia', async () => {
    assistanceRepository.findAssistanceById.mockResolvedValue({
      ...mockAssistance,
      id_user_profile: 999,
    });

    await expect(assistanceService.checkOut(baseCommand)).rejects.toThrow(
      'No puedes modificar esta asistencia'
    );
  });

  it('lanza error cuando ya tiene checkout', async () => {
    assistanceRepository.findAssistanceById.mockResolvedValue({
      ...mockAssistance,
      check_out_time: '11:00:00',
    });

    await expect(assistanceService.checkOut(baseCommand)).rejects.toThrow(
      'La asistencia ya tiene check-out'
    );
  });

  it('otorga tokens por duración de 60+ minutos', async () => {
    assistanceRepository.findAssistanceById.mockResolvedValue(mockAssistance);
    assistanceRepository.updateAssistance.mockResolvedValue({
      ...mockAssistance,
      check_in_time: '10:00:00',
      check_out_time: '11:30:00',
    });
    tokenLedgerService.existeMovimiento.mockResolvedValue(false);
    rewardService.getActiveMultiplier.mockResolvedValue(1);
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 165 });

    const result = await assistanceService.checkOut(baseCommand);

    expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalledWith(
      expect.objectContaining({
        delta: 5,
        refType: 'assistance_checkout',
      })
    );
  });

  it('no otorga tokens cuando ya se procesó el checkout', async () => {
    assistanceRepository.findAssistanceById.mockResolvedValue(mockAssistance);
    assistanceRepository.updateAssistance.mockResolvedValue({
      ...mockAssistance,
      check_in_time: '10:00:00',
      check_out_time: '11:30:00',
    });
    tokenLedgerService.existeMovimiento.mockResolvedValue(true);

    const result = await assistanceService.checkOut(baseCommand);

    expect(tokenLedgerService.registrarMovimiento).not.toHaveBeenCalled();
    expect(result.tokens_awarded).toBe(0);
  });

  it('no otorga tokens cuando duración es menor a 30 minutos', async () => {
    assistanceRepository.findAssistanceById.mockResolvedValue(mockAssistance);
    assistanceRepository.updateAssistance.mockResolvedValue({
      ...mockAssistance,
      check_in_time: '10:00:00',
      check_out_time: '10:20:00',
    });

    const result = await assistanceService.checkOut(baseCommand);

    expect(tokenLedgerService.registrarMovimiento).not.toHaveBeenCalled();
    expect(result.tokens_awarded).toBe(0);
  });
});

describe('assistance-service obtenerHistorialAsistencias', () => {
  it('retorna historial de asistencias con filtros', async () => {
    const mockData = [
      {
        id_assistance: 1,
        id_user_profile: 10,
        id_gym: 5,
        date: '2025-01-01',
        gym: {
          name: 'Gym Test',
        },
      },
    ];

    assistanceRepository.findAssistances.mockResolvedValue({ data: mockData });

    const result = await assistanceService.obtenerHistorialAsistencias({
      userProfileId: 10,
      page: 1,
      limit: 20,
    });

    expect(assistanceRepository.findAssistances).toHaveBeenCalledWith(
      expect.objectContaining({
        userProfileId: 10,
        page: 1,
        limit: 20,
      }),
      expect.objectContaining({
        includeGym: true,
      })
    );
    expect(result).toEqual(mockData);
  });

  it('aplica valores por defecto de paginación', async () => {
    assistanceRepository.findAssistances.mockResolvedValue({ data: [] });

    await assistanceService.obtenerHistorialAsistencias({ userProfileId: 10 });

    expect(assistanceRepository.findAssistances).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 100,
      }),
      expect.any(Object)
    );
  });

  it('puede excluir detalles del gimnasio', async () => {
    assistanceRepository.findAssistances.mockResolvedValue({ data: [] });

    await assistanceService.obtenerHistorialAsistencias({
      userProfileId: 10,
      includeGymDetails: false,
    });

    expect(assistanceRepository.findAssistances).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        includeGym: false,
      })
    );
  });
});

describe('assistance-service autoCheckIn', () => {
  const baseCommand = {
    userProfileId: 10,
    gymId: 5,
    latitude: 40.7128,
    longitude: -74.006,
  };

  const mockGym = {
    id_gym: 5,
    name: 'Gym Test',
    latitude: 40.7128,
    longitude: -74.006,
    auto_checkin_enabled: true,
    geofence_radius_meters: 150,
  };

  const mockUserProfile = {
    id_user_profile: 10,
    id_streak: 10,
    app_tier: 'PREMIUM',
  };

  const mockStreak = {
    id_streak: 10,
    value: 5,
    max_value: 10,
  };

  const mockUserGym = {
    id_user_gym: 1,
    id_user_profile: 10,
    id_gym: 5,
    is_active: true,
    subscription_end: '2025-12-31',
  };

  it('realiza auto check-in cuando está dentro del geofence', async () => {
    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    assistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    gymRepository.findById.mockResolvedValue(mockGym);
    calculateDistance.mockReturnValue(100);
    userProfileRepository.findById.mockResolvedValue(mockUserProfile);
    streakRepository.findById.mockResolvedValue(mockStreak);
    assistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 100,
      auto_checkin: true,
    });
    streakRepository.updateStreak.mockResolvedValue({ ...mockStreak, value: 6 });
    rewardService.getActiveMultiplier.mockResolvedValue(1);
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 150 });
    frequencyService.actualizarAsistenciaSemanal.mockResolvedValue({ goal: 3, assist: 2 });
    achievementService.syncAllAchievementsForUser.mockResolvedValue([]);

    const result = await assistanceService.autoCheckIn(baseCommand);

    expect(assistanceRepository.createAssistance).toHaveBeenCalledWith(
      expect.objectContaining({
        auto_checkin: true,
        verified: true,
      })
    );
    expect(result).toEqual(
      expect.objectContaining({
        racha_actual: 6,
        tokens_actuales: 150,
      })
    );
  });

  it('lanza error cuando auto check-in está deshabilitado', async () => {
    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    assistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    gymRepository.findById.mockResolvedValue({
      ...mockGym,
      auto_checkin_enabled: false,
    });

    await expect(assistanceService.autoCheckIn(baseCommand)).rejects.toThrow(
      'Auto check-in deshabilitado'
    );
  });

  it('lanza error cuando está fuera del geofence', async () => {
    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    assistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    gymRepository.findById.mockResolvedValue(mockGym);
    calculateDistance.mockReturnValue(200);

    await expect(assistanceService.autoCheckIn(baseCommand)).rejects.toThrow(
      'Estás fuera del rango del geofence'
    );
  });
});

describe('assistance-service registrarPresencia', () => {
  const baseCommand = {
    userProfileId: 10,
    gymId: 5,
    latitude: 40.7128,
    longitude: -74.006,
  };

  const mockUserProfile = {
    id_user_profile: 10,
    app_tier: 'PREMIUM',
  };

  const mockGym = {
    id_gym: 5,
    name: 'Gym Test',
    latitude: 40.7128,
    longitude: -74.006,
    geofence_radius_meters: 150,
    min_stay_minutes: 10,
  };

  it('crea nueva presencia cuando no existe una activa', async () => {
    userProfileRepository.findById.mockResolvedValue(mockUserProfile);
    gymRepository.findById.mockResolvedValue(mockGym);
    calculateDistance.mockReturnValue(100);
    presenceRepository.findActivePresence.mockResolvedValue(null);
    presenceRepository.createPresence.mockResolvedValue({
      id_presence: 1,
      id_user_profile: 10,
      id_gym: 5,
      status: 'DETECTING',
      first_seen_at: new Date(),
    });
    presenceRepository.countActiveByGym.mockResolvedValue(5);

    const result = await assistanceService.registrarPresencia(baseCommand);

    expect(presenceRepository.createPresence).toHaveBeenCalledWith(
      expect.objectContaining({
        id_user_profile: 10,
        id_gym: 5,
        status: 'DETECTING',
      })
    );
    expect(result.listo_para_checkin).toBe(false);
    expect(result.duracion_minutos).toBe(0);
  });

  it('actualiza presencia existente', async () => {
    const existingPresence = {
      id_presence: 1,
      id_user_profile: 10,
      id_gym: 5,
      first_seen_at: new Date(Date.now() - 15 * 60000),
      location_updates_count: 5,
    };

    userProfileRepository.findById.mockResolvedValue(mockUserProfile);
    gymRepository.findById.mockResolvedValue(mockGym);
    calculateDistance.mockReturnValue(100);
    presenceRepository.findActivePresence.mockResolvedValue(existingPresence);
    presenceRepository.updatePresence.mockResolvedValue({
      ...existingPresence,
      location_updates_count: 6,
    });
    presenceRepository.countActiveByGym.mockResolvedValue(5);

    const result = await assistanceService.registrarPresencia(baseCommand);

    expect(presenceRepository.updatePresence).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        location_updates_count: 6,
      })
    );
    expect(result.listo_para_checkin).toBe(true);
  });

  it('lanza error cuando usuario no es PREMIUM', async () => {
    userProfileRepository.findById.mockResolvedValue({
      ...mockUserProfile,
      app_tier: 'FREE',
    });

    await expect(assistanceService.registrarPresencia(baseCommand)).rejects.toThrow(
      'Auto check-in es una función exclusiva para usuarios PREMIUM'
    );
  });

  it('lanza error cuando está fuera del geofence', async () => {
    userProfileRepository.findById.mockResolvedValue(mockUserProfile);
    gymRepository.findById.mockResolvedValue(mockGym);
    calculateDistance.mockReturnValue(200);

    await expect(assistanceService.registrarPresencia(baseCommand)).rejects.toThrow(
      'Fuera de rango geofence'
    );
  });

  it('emite evento de actualización de presencia', async () => {
    userProfileRepository.findById.mockResolvedValue(mockUserProfile);
    gymRepository.findById.mockResolvedValue(mockGym);
    calculateDistance.mockReturnValue(100);
    presenceRepository.findActivePresence.mockResolvedValue(null);
    presenceRepository.createPresence.mockResolvedValue({
      id_presence: 1,
      status: 'DETECTING',
    });
    presenceRepository.countActiveByGym.mockResolvedValue(5);

    await assistanceService.registrarPresencia(baseCommand);

    expect(emitEvent).toHaveBeenCalledWith(
      EVENTS.PRESENCE_UPDATED,
      expect.objectContaining({
        gymId: 5,
        currentCount: 5,
      })
    );
  });
});

describe('assistance-service verificarAutoCheckIn', () => {
  const baseCommand = {
    userProfileId: 10,
    gymId: 5,
  };

  const mockUserProfile = {
    id_user_profile: 10,
    id_streak: 10,
    app_tier: 'PREMIUM',
  };

  const mockGym = {
    id_gym: 5,
    name: 'Gym Test',
    min_stay_minutes: 10,
  };

  const mockPresence = {
    id_presence: 1,
    id_user_profile: 10,
    id_gym: 5,
    first_seen_at: new Date(Date.now() - 15 * 60000),
    status: 'DETECTING',
    distance_meters: 100,
  };

  const mockStreak = {
    id_streak: 10,
    value: 5,
    max_value: 10,
  };

  const mockUserGym = {
    id_user_gym: 1,
    is_active: true,
    subscription_end: '2025-12-31',
  };

  it('registra auto check-in cuando cumple permanencia mínima', async () => {
    userProfileRepository.findById.mockResolvedValue(mockUserProfile);
    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    presenceRepository.findAll.mockResolvedValue({
      data: [mockPresence],
    });
    gymRepository.findById.mockResolvedValue(mockGym);
    assistanceRepository.findAssistanceByUserAndDate.mockResolvedValue(null);
    streakRepository.findById.mockResolvedValue(mockStreak);
    assistanceRepository.createAssistance.mockResolvedValue({
      id_assistance: 100,
      auto_checkin: true,
    });
    streakRepository.updateStreak.mockResolvedValue({ ...mockStreak, value: 6 });
    rewardService.getActiveMultiplier.mockResolvedValue(1);
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 150 });
    frequencyService.actualizarAsistenciaSemanal.mockResolvedValue({ goal: 3, assist: 2 });
    achievementService.syncAllAchievementsForUser.mockResolvedValue([]);

    const result = await assistanceService.verificarAutoCheckIn(baseCommand);

    expect(assistanceRepository.createAssistance).toHaveBeenCalled();
    expect(presenceRepository.markAsConvertedToAssistance).toHaveBeenCalledWith(1, 100);
    expect(result).toEqual(
      expect.objectContaining({
        racha_actual: 6,
        tokens_actuales: 150,
      })
    );
  });

  it('lanza error cuando usuario no es PREMIUM', async () => {
    userProfileRepository.findById.mockResolvedValue({
      ...mockUserProfile,
      app_tier: 'FREE',
    });

    await expect(assistanceService.verificarAutoCheckIn(baseCommand)).rejects.toThrow(
      'Auto check-in es una función exclusiva para usuarios PREMIUM'
    );
  });

  it('lanza error cuando no hay presencia activa', async () => {
    userProfileRepository.findById.mockResolvedValue(mockUserProfile);
    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    presenceRepository.findAll.mockResolvedValue({ data: [] });

    await expect(assistanceService.verificarAutoCheckIn(baseCommand)).rejects.toThrow(
      'No hay presencia activa para verificar'
    );
  });

  it('lanza error cuando permanencia es insuficiente', async () => {
    const recentPresence = {
      ...mockPresence,
      first_seen_at: new Date(Date.now() - 5 * 60000),
    };

    userProfileRepository.findById.mockResolvedValue(mockUserProfile);
    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    presenceRepository.findAll.mockResolvedValue({ data: [recentPresence] });
    gymRepository.findById.mockResolvedValue(mockGym);

    await expect(assistanceService.verificarAutoCheckIn(baseCommand)).rejects.toThrow(
      'Permanencia insuficiente'
    );
  });

  it('lanza error cuando ya registró asistencia hoy', async () => {
    userProfileRepository.findById.mockResolvedValue(mockUserProfile);
    userGymRepository.findByUserAndGym.mockResolvedValue(mockUserGym);
    presenceRepository.findAll.mockResolvedValue({ data: [mockPresence] });
    gymRepository.findById.mockResolvedValue(mockGym);
    assistanceRepository.findAssistanceByUserAndDate.mockResolvedValue({
      id_assistance: 99,
    });

    await expect(assistanceService.verificarAutoCheckIn(baseCommand)).rejects.toThrow(
      'Ya registraste asistencia hoy'
    );
  });
});
