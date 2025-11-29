/**
 * Test Unitario: achievement-side-effects
 *
 * Este test sigue las mejores prácticas del Golden Sample:
 * - Aislamiento completo: Todos los servicios están mockeados
 * - Setup y teardown consistente
 * - Estructura clara por funcionalidad
 * - Cobertura completa: happy path, edge cases, error handling
 */

jest.mock('../../../services/notification-service', () => ({
  createNotification: jest.fn(),
}));

jest.mock('../../../services/token-ledger-service', () => ({
  existeMovimiento: jest.fn(),
  registrarMovimiento: jest.fn(),
}));

jest.mock('../../../services/reward-service', () => ({
  getActiveMultiplier: jest.fn(),
}));

jest.mock('../../../config/constants', () => ({
  TOKEN_REASONS: {
    ACHIEVEMENT_UNLOCKED: 'ACHIEVEMENT_UNLOCKED',
  },
}));

const notificationService = require('../../../services/notification-service');
const tokenLedgerService = require('../../../services/token-ledger-service');
const rewardService = require('../../../services/reward-service');
const achievementSideEffects = require('../../../services/achievement-side-effects');

beforeEach(() => {
  jest.clearAllMocks();
  // Mock console.error para evitar logs en tests
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
  console.error.mockRestore();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('achievement-side-effects handleUnlock', () => {
  const idUserProfile = 10;
  const mockDefinition = {
    id_achievement_definition: 1,
    code: 'STREAK_7',
    name: 'Racha de 7 días',
    description: 'Completa 7 días consecutivos',
    metadata: {
      token_reward: 100,
      unlock_message: '¡Increíble! Has completado 7 días seguidos',
      icon: 'streak_icon.png',
    },
  };
  const mockUserAchievement = {
    id_user_achievement: 50,
  };

  it('crea notificación y otorga tokens cuando se desbloquea un logro', async () => {
    notificationService.createNotification.mockResolvedValue({ id_notification: 1 });
    tokenLedgerService.existeMovimiento.mockResolvedValue(false);
    rewardService.getActiveMultiplier.mockResolvedValue(1);
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ id_ledger: 1 });

    await achievementSideEffects.handleUnlock({
      idUserProfile,
      definition: mockDefinition,
      userAchievement: mockUserAchievement,
    });

    expect(notificationService.createNotification).toHaveBeenCalledWith({
      id_user_profile: idUserProfile,
      type: 'ACHIEVEMENT',
      title: '¡Nuevo logro desbloqueado!',
      message: '¡Increíble! Has completado 7 días seguidos',
      icon: 'streak_icon.png',
    });

    expect(tokenLedgerService.existeMovimiento).toHaveBeenCalledWith(
      'achievement',
      mockUserAchievement.id_user_achievement
    );

    expect(rewardService.getActiveMultiplier).toHaveBeenCalledWith(idUserProfile);

    expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalledWith({
      userId: idUserProfile,
      delta: 100,
      reason: 'ACHIEVEMENT_UNLOCKED',
      refType: 'achievement',
      refId: mockUserAchievement.id_user_achievement,
    });
  });

  it('aplica multiplicador de recompensa cuando está activo', async () => {
    notificationService.createNotification.mockResolvedValue({ id_notification: 1 });
    tokenLedgerService.existeMovimiento.mockResolvedValue(false);
    rewardService.getActiveMultiplier.mockResolvedValue(1.5);
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ id_ledger: 1 });

    await achievementSideEffects.handleUnlock({
      idUserProfile,
      definition: mockDefinition,
      userAchievement: mockUserAchievement,
    });

    expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalledWith(
      expect.objectContaining({
        delta: 150, // 100 * 1.5
      })
    );
  });

  it('usa description como fallback cuando no hay unlock_message', async () => {
    const definitionWithoutMessage = {
      ...mockDefinition,
      metadata: {
        token_reward: 50,
        icon: 'icon.png',
      },
    };

    notificationService.createNotification.mockResolvedValue({ id_notification: 1 });
    tokenLedgerService.existeMovimiento.mockResolvedValue(false);
    rewardService.getActiveMultiplier.mockResolvedValue(1);

    await achievementSideEffects.handleUnlock({
      idUserProfile,
      definition: definitionWithoutMessage,
      userAchievement: mockUserAchievement,
    });

    expect(notificationService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Completa 7 días consecutivos',
      })
    );
  });

  it('usa name como fallback cuando no hay description ni unlock_message', async () => {
    const definitionMinimal = {
      ...mockDefinition,
      description: null,
      metadata: {},
    };

    notificationService.createNotification.mockResolvedValue({ id_notification: 1 });
    tokenLedgerService.existeMovimiento.mockResolvedValue(true);

    await achievementSideEffects.handleUnlock({
      idUserProfile,
      definition: definitionMinimal,
      userAchievement: mockUserAchievement,
    });

    expect(notificationService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Racha de 7 días',
      })
    );
  });

  it('no otorga tokens cuando token_reward es 0', async () => {
    const definitionNoReward = {
      ...mockDefinition,
      metadata: {
        token_reward: 0,
        unlock_message: 'Logro desbloqueado',
      },
    };

    notificationService.createNotification.mockResolvedValue({ id_notification: 1 });

    await achievementSideEffects.handleUnlock({
      idUserProfile,
      definition: definitionNoReward,
      userAchievement: mockUserAchievement,
    });

    expect(tokenLedgerService.existeMovimiento).not.toHaveBeenCalled();
    expect(tokenLedgerService.registrarMovimiento).not.toHaveBeenCalled();
  });

  it('no otorga tokens cuando ya fueron otorgados previamente', async () => {
    notificationService.createNotification.mockResolvedValue({ id_notification: 1 });
    tokenLedgerService.existeMovimiento.mockResolvedValue(true);

    await achievementSideEffects.handleUnlock({
      idUserProfile,
      definition: mockDefinition,
      userAchievement: mockUserAchievement,
    });

    expect(tokenLedgerService.existeMovimiento).toHaveBeenCalled();
    expect(tokenLedgerService.registrarMovimiento).not.toHaveBeenCalled();
  });

  it('no otorga tokens cuando el multiplicador resulta en 0 tokens ajustados', async () => {
    const definitionSmallReward = {
      ...mockDefinition,
      metadata: {
        token_reward: 1,
        unlock_message: 'Test',
      },
    };

    notificationService.createNotification.mockResolvedValue({ id_notification: 1 });
    tokenLedgerService.existeMovimiento.mockResolvedValue(false);
    rewardService.getActiveMultiplier.mockResolvedValue(0.5);

    await achievementSideEffects.handleUnlock({
      idUserProfile,
      definition: definitionSmallReward,
      userAchievement: mockUserAchievement,
    });

    // 1 * 0.5 = 0.5, Math.floor = 0
    expect(tokenLedgerService.registrarMovimiento).not.toHaveBeenCalled();
  });

  it('maneja errores en la creación de notificaciones sin interrumpir el flujo', async () => {
    notificationService.createNotification.mockRejectedValue(new Error('Notification error'));
    tokenLedgerService.existeMovimiento.mockResolvedValue(false);
    rewardService.getActiveMultiplier.mockResolvedValue(1);
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ id_ledger: 1 });

    await expect(
      achievementSideEffects.handleUnlock({
        idUserProfile,
        definition: mockDefinition,
        userAchievement: mockUserAchievement,
      })
    ).resolves.not.toThrow();

    expect(console.error).toHaveBeenCalledWith(
      '[achievement-side-effects] Error creando notificación',
      expect.any(Error)
    );

    // Los tokens se deben otorgar de todas formas
    expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalled();
  });

  it('maneja errores en el otorgamiento de tokens sin interrumpir el flujo', async () => {
    notificationService.createNotification.mockResolvedValue({ id_notification: 1 });
    tokenLedgerService.existeMovimiento.mockResolvedValue(false);
    rewardService.getActiveMultiplier.mockResolvedValue(1);
    tokenLedgerService.registrarMovimiento.mockRejectedValue(new Error('Token error'));

    await expect(
      achievementSideEffects.handleUnlock({
        idUserProfile,
        definition: mockDefinition,
        userAchievement: mockUserAchievement,
      })
    ).resolves.not.toThrow();

    expect(console.error).toHaveBeenCalledWith(
      '[achievement-side-effects] Error otorgando tokens por logro',
      expect.any(Error)
    );
  });
});

describe('achievement-side-effects processUnlockResults', () => {
  const idUserProfile = 10;

  it('procesa múltiples logros desbloqueados y retorna sus códigos', async () => {
    const results = [
      {
        justUnlocked: true,
        definition: {
          code: 'STREAK_7',
          name: 'Racha 7',
          metadata: { token_reward: 100 },
        },
        userAchievement: { id_user_achievement: 1 },
      },
      {
        justUnlocked: false,
        definition: {
          code: 'STREAK_30',
          name: 'Racha 30',
          metadata: { token_reward: 300 },
        },
        userAchievement: { id_user_achievement: 2 },
      },
      {
        justUnlocked: true,
        definition: {
          code: 'ASSIST_10',
          name: '10 asistencias',
          metadata: { token_reward: 50 },
        },
        userAchievement: { id_user_achievement: 3 },
      },
    ];

    notificationService.createNotification.mockResolvedValue({ id_notification: 1 });
    tokenLedgerService.existeMovimiento.mockResolvedValue(false);
    rewardService.getActiveMultiplier.mockResolvedValue(1);
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ id_ledger: 1 });

    const unlockedCodes = await achievementSideEffects.processUnlockResults(
      idUserProfile,
      results
    );

    expect(unlockedCodes).toEqual(['STREAK_7', 'ASSIST_10']);
    expect(notificationService.createNotification).toHaveBeenCalledTimes(2);
    expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalledTimes(2);
  });

  it('retorna array vacío cuando no hay logros desbloqueados', async () => {
    const results = [
      {
        justUnlocked: false,
        definition: { code: 'STREAK_7' },
        userAchievement: { id_user_achievement: 1 },
      },
    ];

    const unlockedCodes = await achievementSideEffects.processUnlockResults(
      idUserProfile,
      results
    );

    expect(unlockedCodes).toEqual([]);
    expect(notificationService.createNotification).not.toHaveBeenCalled();
  });

  it('procesa array vacío sin errores', async () => {
    const unlockedCodes = await achievementSideEffects.processUnlockResults(idUserProfile, []);

    expect(unlockedCodes).toEqual([]);
    expect(notificationService.createNotification).not.toHaveBeenCalled();
  });

  it('continúa procesando aunque un logro falle', async () => {
    const results = [
      {
        justUnlocked: true,
        definition: {
          code: 'STREAK_7',
          name: 'Racha 7',
          metadata: { token_reward: 100 },
        },
        userAchievement: { id_user_achievement: 1 },
      },
      {
        justUnlocked: true,
        definition: {
          code: 'ASSIST_10',
          name: '10 asistencias',
          metadata: { token_reward: 50 },
        },
        userAchievement: { id_user_achievement: 2 },
      },
    ];

    notificationService.createNotification
      .mockRejectedValueOnce(new Error('Notification error'))
      .mockResolvedValueOnce({ id_notification: 2 });
    tokenLedgerService.existeMovimiento.mockResolvedValue(false);
    rewardService.getActiveMultiplier.mockResolvedValue(1);
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ id_ledger: 1 });

    const unlockedCodes = await achievementSideEffects.processUnlockResults(
      idUserProfile,
      results
    );

    expect(unlockedCodes).toEqual(['STREAK_7', 'ASSIST_10']);
    expect(notificationService.createNotification).toHaveBeenCalledTimes(2);
  });
});
