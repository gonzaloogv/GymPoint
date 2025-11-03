/**
 * Tests unitarios para achievement-controller
 */

jest.mock('../../../services/achievement-service');
jest.mock('../../../services/achievement-side-effects');

const achievementController = require('../../../controllers/achievement-controller');
const achievementService = require('../../../services/achievement-service');
const { processUnlockResults } = require('../../../services/achievement-side-effects');

const createRes = () => ({
  json: jest.fn(),
  status: jest.fn().mockReturnThis(),
});

const createNext = () => jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('achievement-controller getMyAchievements', () => {
  it('retorna los logros del usuario autenticado (200)', async () => {
    const req = {
      user: { id_user_profile: 10 },
      query: {},
    };
    const res = createRes();
    const next = createNext();

    const mockEntries = [
      {
        definition: {
          id_achievement_definition: 1,
          code: 'FIRST_VISIT',
          name: 'Primera visita',
          description: 'Completa tu primera visita',
          category: 'ONBOARDING',
          metric_type: 'ASSISTANCE_TOTAL',
          target_value: 1,
          icon_url: null,
          is_active: true,
          metadata: null,
        },
        progress: 1,
        unlocked: true,
        unlocked_at: '2025-11-02T10:00:00.000Z',
        last_source_type: 'assistance',
        last_source_id: 5,
      },
    ];

    achievementService.getUserAchievements.mockResolvedValue(mockEntries);

    await achievementController.getMyAchievements(req, res, next);

    expect(achievementService.getUserAchievements).toHaveBeenCalledWith(10, {});
    expect(res.json).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          code: 'FIRST_VISIT',
          name: 'Primera visita',
          progress: 1,
          unlocked: true,
        }),
      ]),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('filtra por categoría cuando se proporciona', async () => {
    const req = {
      user: { id_user_profile: 10 },
      query: { category: 'STREAK' },
    };
    const res = createRes();
    const next = createNext();

    achievementService.getUserAchievements.mockResolvedValue([]);

    await achievementController.getMyAchievements(req, res, next);

    expect(achievementService.getUserAchievements).toHaveBeenCalledWith(10, { category: 'STREAK' });
  });

  it('maneja errores llamando a next', async () => {
    const req = {
      user: { id_user_profile: 10 },
      query: {},
    };
    const res = createRes();
    const next = createNext();

    const error = new Error('Database error');
    achievementService.getUserAchievements.mockRejectedValue(error);

    await achievementController.getMyAchievements(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe('achievement-controller syncMyAchievements', () => {
  it('sincroniza logros y retorna resultados (200)', async () => {
    const req = {
      user: { id_user_profile: 10 },
      body: {},
    };
    const res = createRes();
    const next = createNext();

    const mockSyncResults = [{ unlocked: true }];
    const mockUnlockedNow = [{ code: 'NEW_ACHIEVEMENT' }];
    const mockEntries = [
      {
        definition: {
          id_achievement_definition: 1,
          code: 'TEST',
          name: 'Test Achievement',
          description: 'Test',
          category: 'ONBOARDING',
          metric_type: 'ASSISTANCE_TOTAL',
          target_value: 1,
          icon_url: null,
          is_active: true,
          metadata: null,
        },
        progress: 1,
        unlocked: true,
        unlocked_at: '2025-11-02T10:00:00.000Z',
        last_source_type: null,
        last_source_id: null,
      },
    ];

    achievementService.syncAllAchievementsForUser.mockResolvedValue(mockSyncResults);
    processUnlockResults.mockResolvedValue(mockUnlockedNow);
    achievementService.getUserAchievements.mockResolvedValue(mockEntries);

    await achievementController.syncMyAchievements(req, res, next);

    expect(achievementService.syncAllAchievementsForUser).toHaveBeenCalledWith(10, {});
    expect(processUnlockResults).toHaveBeenCalledWith(10, mockSyncResults);
    expect(achievementService.getUserAchievements).toHaveBeenCalledWith(10, {});
    expect(res.json).toHaveBeenCalledWith({
      message: 'Logros sincronizados',
      data: expect.any(Array),
      unlocked: mockUnlockedNow,
    });
  });

  it('sincroniza con filtro de categoría', async () => {
    const req = {
      user: { id_user_profile: 10 },
      body: { category: 'STREAK' },
    };
    const res = createRes();
    const next = createNext();

    achievementService.syncAllAchievementsForUser.mockResolvedValue([]);
    processUnlockResults.mockResolvedValue([]);
    achievementService.getUserAchievements.mockResolvedValue([]);

    await achievementController.syncMyAchievements(req, res, next);

    expect(achievementService.syncAllAchievementsForUser).toHaveBeenCalledWith(10, {
      category: 'STREAK',
    });
  });
});

describe('achievement-controller listDefinitions', () => {
  it('retorna lista de definiciones (200)', async () => {
    const req = {
      query: {},
    };
    const res = createRes();
    const next = createNext();

    const mockDefinitions = [
      {
        id_achievement_definition: 1,
        code: 'TEST',
        name: 'Test',
        category: 'ONBOARDING',
        is_active: true,
      },
    ];

    achievementService.getDefinitions.mockResolvedValue(mockDefinitions);

    await achievementController.listDefinitions(req, res, next);

    expect(achievementService.getDefinitions).toHaveBeenCalledWith({
      category: undefined,
      includeInactive: false,
    });
    expect(res.json).toHaveBeenCalledWith({ data: mockDefinitions });
  });

  it('incluye inactivos cuando se solicita', async () => {
    const req = {
      query: { includeInactive: 'true' },
    };
    const res = createRes();
    const next = createNext();

    achievementService.getDefinitions.mockResolvedValue([]);

    await achievementController.listDefinitions(req, res, next);

    expect(achievementService.getDefinitions).toHaveBeenCalledWith({
      category: undefined,
      includeInactive: true,
    });
  });
});

describe('achievement-controller createDefinition', () => {
  it('crea una nueva definición (201)', async () => {
    const req = {
      body: {
        code: 'NEW_ACH',
        name: 'New Achievement',
        category: 'ONBOARDING',
        metric_type: 'ASSISTANCE_TOTAL',
        target_value: 1,
      },
    };
    const res = createRes();
    const next = createNext();

    const mockDefinition = {
      id_achievement_definition: 1,
      ...req.body,
      is_active: true,
    };

    achievementService.createDefinition.mockResolvedValue(mockDefinition);

    await achievementController.createDefinition(req, res, next);

    expect(achievementService.createDefinition).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Logro creado con éxito',
      data: mockDefinition,
    });
  });

  it('maneja errores de validación', async () => {
    const req = { body: {} };
    const res = createRes();
    const next = createNext();

    const error = new Error('Validation error');
    achievementService.createDefinition.mockRejectedValue(error);

    await achievementController.createDefinition(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('achievement-controller updateDefinition', () => {
  it('actualiza una definición existente (200)', async () => {
    const req = {
      params: { id: '1' },
      body: { name: 'Updated Name' },
    };
    const res = createRes();
    const next = createNext();

    const mockDefinition = {
      id_achievement_definition: 1,
      code: 'TEST',
      name: 'Updated Name',
      is_active: true,
    };

    achievementService.updateDefinition.mockResolvedValue(mockDefinition);

    await achievementController.updateDefinition(req, res, next);

    expect(achievementService.updateDefinition).toHaveBeenCalledWith(1, req.body);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Logro actualizado con éxito',
      data: mockDefinition,
    });
  });

  it('retorna error cuando el ID es inválido', async () => {
    const req = {
      params: { id: 'invalid' },
      body: {},
    };
    const res = createRes();
    const next = createNext();

    await achievementController.updateDefinition(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'ID inválido' }));
    expect(achievementService.updateDefinition).not.toHaveBeenCalled();
  });
});

describe('achievement-controller deleteDefinition', () => {
  it('elimina una definición existente (200)', async () => {
    const req = {
      params: { id: '1' },
    };
    const res = createRes();
    const next = createNext();

    achievementService.deleteDefinition.mockResolvedValue({ success: true });

    await achievementController.deleteDefinition(req, res, next);

    expect(achievementService.deleteDefinition).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Logro eliminado con éxito',
    });
  });

  it('retorna error cuando el ID es inválido', async () => {
    const req = {
      params: { id: 'not-a-number' },
    };
    const res = createRes();
    const next = createNext();

    await achievementController.deleteDefinition(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'ID inválido' }));
    expect(achievementService.deleteDefinition).not.toHaveBeenCalled();
  });

  it('maneja errores del servicio', async () => {
    const req = {
      params: { id: '1' },
    };
    const res = createRes();
    const next = createNext();

    const error = new Error('Achievement not found');
    achievementService.deleteDefinition.mockRejectedValue(error);

    await achievementController.deleteDefinition(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
