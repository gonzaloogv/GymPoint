/**
 * Tests para admin-daily-challenge-service - Config & Auto-Generation
 * Cubre: getConfig, updateConfig, runAutoGeneration
 */

const {
  mockDailyChallengeSettings,
  mockDailyChallenge,
  mockDailyChallengeTemplate,
} = require('./test-setup');

const adminDailyChallengeService = require('../../../../services/admin-daily-challenge-service');

describe('admin-daily-challenge-service config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('getConfig', () => {
    it('obtiene configuración singleton', async () => {
      const mockConfig = {
        id_settings: 1,
        auto_rotation_enabled: true,
        rotation_cron: '0 0 * * *',
      };

      mockDailyChallengeSettings.getSingleton.mockResolvedValue(mockConfig);

      const result = await adminDailyChallengeService.getConfig();

      expect(result).toEqual(mockConfig);
      expect(mockDailyChallengeSettings.getSingleton).toHaveBeenCalled();
    });
  });

  describe('updateConfig', () => {
    it('actualiza auto_rotation_enabled', async () => {
      const mockConfig = {
        id_settings: 1,
        auto_rotation_enabled: false,
        rotation_cron: '0 0 * * *',
        update: jest.fn().mockResolvedValue(),
      };

      mockDailyChallengeSettings.getSingleton.mockResolvedValue(mockConfig);

      const result = await adminDailyChallengeService.updateConfig({
        auto_rotation_enabled: true,
      });

      expect(mockConfig.update).toHaveBeenCalledWith({
        auto_rotation_enabled: true,
      });
      expect(result).toEqual(mockConfig);
    });

    it('actualiza rotation_cron', async () => {
      const mockConfig = {
        id_settings: 1,
        auto_rotation_enabled: true,
        rotation_cron: '0 0 * * *',
        update: jest.fn().mockResolvedValue(),
      };

      mockDailyChallengeSettings.getSingleton.mockResolvedValue(mockConfig);

      await adminDailyChallengeService.updateConfig({
        rotation_cron: '0 6 * * *',
      });

      expect(mockConfig.update).toHaveBeenCalledWith({
        rotation_cron: '0 6 * * *',
      });
    });

    it('actualiza múltiples campos', async () => {
      const mockConfig = {
        id_settings: 1,
        update: jest.fn().mockResolvedValue(),
      };

      mockDailyChallengeSettings.getSingleton.mockResolvedValue(mockConfig);

      await adminDailyChallengeService.updateConfig({
        auto_rotation_enabled: false,
        rotation_cron: '0 12 * * *',
      });

      expect(mockConfig.update).toHaveBeenCalledWith({
        auto_rotation_enabled: false,
        rotation_cron: '0 12 * * *',
      });
    });

    it('convierte auto_rotation_enabled a boolean', async () => {
      const mockConfig = {
        id_settings: 1,
        update: jest.fn().mockResolvedValue(),
      };

      mockDailyChallengeSettings.getSingleton.mockResolvedValue(mockConfig);

      await adminDailyChallengeService.updateConfig({
        auto_rotation_enabled: 'true',
      });

      expect(mockConfig.update).toHaveBeenCalledWith({
        auto_rotation_enabled: true,
      });
    });

    it('no actualiza si payload está vacío', async () => {
      const mockConfig = {
        id_settings: 1,
        update: jest.fn().mockResolvedValue(),
      };

      mockDailyChallengeSettings.getSingleton.mockResolvedValue(mockConfig);

      await adminDailyChallengeService.updateConfig({});

      expect(mockConfig.update).toHaveBeenCalledWith({});
    });
  });

  describe('runAutoGeneration', () => {
    beforeEach(() => {
      // Mock today's date
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-01-20T00:00:00.000Z');
    });

    afterEach(() => {
      Date.prototype.toISOString.mockRestore();
    });

    it('genera challenge automático desde template con mayor peso', async () => {
      mockDailyChallenge.findOne.mockResolvedValue(null);

      mockDailyChallengeSettings.getSingleton.mockResolvedValue({
        auto_rotation_enabled: true,
      });

      const mockTemplates = [
        {
          id_template: 1,
          title: 'Entrena 30 minutos',
          description: 'Completa 30 minutos',
          challenge_type: 'MINUTES',
          target_value: 30,
          target_unit: 'minutos',
          tokens_reward: 20,
          difficulty: 'MEDIUM',
          rotation_weight: 10,
        },
        {
          id_template: 2,
          title: 'Haz 20 ejercicios',
          challenge_type: 'EXERCISES',
          target_value: 20,
          tokens_reward: 15,
          difficulty: 'EASY',
          rotation_weight: 5,
        },
      ];

      mockDailyChallengeTemplate.findAll.mockResolvedValue(mockTemplates);

      const mockCreatedChallenge = {
        id_challenge: 1,
        challenge_date: '2025-01-20',
        title: 'Entrena 30 minutos',
        auto_generated: true,
      };

      mockDailyChallenge.create.mockResolvedValue(mockCreatedChallenge);

      // Mock Math.random para que seleccione el primer template
      jest.spyOn(Math, 'random').mockReturnValue(0.1);

      const result = await adminDailyChallengeService.runAutoGeneration();

      expect(mockDailyChallenge.findOne).toHaveBeenCalledWith({
        where: { challenge_date: '2025-01-20', is_active: true },
      });

      expect(mockDailyChallengeTemplate.findAll).toHaveBeenCalledWith({
        where: { is_active: true },
        order: [['rotation_weight', 'DESC']],
      });

      expect(mockDailyChallenge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          challenge_date: '2025-01-20',
          title: 'Entrena 30 minutos',
          challenge_type: 'MINUTES',
          target_value: 30,
          tokens_reward: 20,
          difficulty: 'MEDIUM',
          id_template: 1,
          auto_generated: true,
          is_active: true,
        })
      );

      expect(result).toEqual(mockCreatedChallenge);
      expect(console.log).toHaveBeenCalledWith(
        '[runAutoGeneration] Plantilla seleccionada:',
        'Entrena 30 minutos'
      );

      Math.random.mockRestore();
    });

    it('retorna challenge existente si ya hay uno para hoy', async () => {
      const existingChallenge = {
        id_challenge: 1,
        challenge_date: '2025-01-20',
        title: 'Challenge Existente',
        is_active: true,
      };

      mockDailyChallenge.findOne.mockResolvedValue(existingChallenge);

      const result = await adminDailyChallengeService.runAutoGeneration();

      expect(result).toEqual(existingChallenge);
      expect(console.log).toHaveBeenCalledWith(
        '[runAutoGeneration] Ya existe un desafío para hoy:',
        'Challenge Existente'
      );
      expect(mockDailyChallengeTemplate.findAll).not.toHaveBeenCalled();
      expect(mockDailyChallenge.create).not.toHaveBeenCalled();
    });

    it('retorna null si auto_rotation_enabled está deshabilitado', async () => {
      mockDailyChallenge.findOne.mockResolvedValue(null);

      mockDailyChallengeSettings.getSingleton.mockResolvedValue({
        auto_rotation_enabled: false,
      });

      const result = await adminDailyChallengeService.runAutoGeneration();

      expect(result).toBeNull();
      expect(console.log).toHaveBeenCalledWith(
        '[runAutoGeneration] Rotación automática deshabilitada'
      );
      expect(mockDailyChallengeTemplate.findAll).not.toHaveBeenCalled();
    });

    it('retorna null si no hay templates activas', async () => {
      mockDailyChallenge.findOne.mockResolvedValue(null);

      mockDailyChallengeSettings.getSingleton.mockResolvedValue({
        auto_rotation_enabled: true,
      });

      mockDailyChallengeTemplate.findAll.mockResolvedValue([]);

      const result = await adminDailyChallengeService.runAutoGeneration();

      expect(result).toBeNull();
      expect(console.log).toHaveBeenCalledWith(
        '[runAutoGeneration] No hay plantillas activas'
      );
      expect(mockDailyChallenge.create).not.toHaveBeenCalled();
    });

    it('normaliza difficulty BEGINNER a EASY', async () => {
      mockDailyChallenge.findOne.mockResolvedValue(null);
      mockDailyChallengeSettings.getSingleton.mockResolvedValue({
        auto_rotation_enabled: true,
      });

      const mockTemplates = [
        {
          id_template: 1,
          title: 'Template con BEGINNER',
          challenge_type: 'MINUTES',
          target_value: 15,
          tokens_reward: 10,
          difficulty: 'BEGINNER',
          rotation_weight: 10,
        },
      ];

      mockDailyChallengeTemplate.findAll.mockResolvedValue(mockTemplates);
      mockDailyChallenge.create.mockResolvedValue({ id_challenge: 1 });

      await adminDailyChallengeService.runAutoGeneration();

      expect(mockDailyChallenge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: 'EASY',
        })
      );
    });

    it('normaliza difficulty INTERMEDIATE a MEDIUM', async () => {
      mockDailyChallenge.findOne.mockResolvedValue(null);
      mockDailyChallengeSettings.getSingleton.mockResolvedValue({
        auto_rotation_enabled: true,
      });

      const mockTemplates = [
        {
          id_template: 1,
          title: 'Template con INTERMEDIATE',
          challenge_type: 'MINUTES',
          target_value: 30,
          tokens_reward: 15,
          difficulty: 'INTERMEDIATE',
          rotation_weight: 10,
        },
      ];

      mockDailyChallengeTemplate.findAll.mockResolvedValue(mockTemplates);
      mockDailyChallenge.create.mockResolvedValue({ id_challenge: 1 });

      await adminDailyChallengeService.runAutoGeneration();

      expect(mockDailyChallenge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: 'MEDIUM',
        })
      );
    });

    it('normaliza difficulty ADVANCED a HARD', async () => {
      mockDailyChallenge.findOne.mockResolvedValue(null);
      mockDailyChallengeSettings.getSingleton.mockResolvedValue({
        auto_rotation_enabled: true,
      });

      const mockTemplates = [
        {
          id_template: 1,
          title: 'Template con ADVANCED',
          challenge_type: 'MINUTES',
          target_value: 60,
          tokens_reward: 30,
          difficulty: 'ADVANCED',
          rotation_weight: 10,
        },
      ];

      mockDailyChallengeTemplate.findAll.mockResolvedValue(mockTemplates);
      mockDailyChallenge.create.mockResolvedValue({ id_challenge: 1 });

      await adminDailyChallengeService.runAutoGeneration();

      expect(mockDailyChallenge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: 'HARD',
        })
      );
    });

    it('usa MEDIUM como default si difficulty es inválida', async () => {
      mockDailyChallenge.findOne.mockResolvedValue(null);
      mockDailyChallengeSettings.getSingleton.mockResolvedValue({
        auto_rotation_enabled: true,
      });

      const mockTemplates = [
        {
          id_template: 1,
          title: 'Template sin difficulty',
          challenge_type: 'MINUTES',
          target_value: 30,
          tokens_reward: 15,
          difficulty: null,
          rotation_weight: 10,
        },
      ];

      mockDailyChallengeTemplate.findAll.mockResolvedValue(mockTemplates);
      mockDailyChallenge.create.mockResolvedValue({ id_challenge: 1 });

      await adminDailyChallengeService.runAutoGeneration();

      expect(mockDailyChallenge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: 'MEDIUM',
        })
      );
    });

    it('selecciona template basándose en pesos de rotación', async () => {
      mockDailyChallenge.findOne.mockResolvedValue(null);
      mockDailyChallengeSettings.getSingleton.mockResolvedValue({
        auto_rotation_enabled: true,
      });

      const mockTemplates = [
        {
          id_template: 1,
          title: 'Template Peso 10',
          challenge_type: 'MINUTES',
          target_value: 30,
          tokens_reward: 20,
          difficulty: 'MEDIUM',
          rotation_weight: 10,
        },
        {
          id_template: 2,
          title: 'Template Peso 5',
          challenge_type: 'EXERCISES',
          target_value: 20,
          tokens_reward: 15,
          difficulty: 'EASY',
          rotation_weight: 5,
        },
      ];

      mockDailyChallengeTemplate.findAll.mockResolvedValue(mockTemplates);
      mockDailyChallenge.create.mockResolvedValue({ id_challenge: 2 });

      // Mock Math.random para seleccionar el segundo template
      // Total weight = 15, random = 0.8 * 15 = 12, 12 - 10 = 2, 2 - 5 < 0 => selecciona segundo
      jest.spyOn(Math, 'random').mockReturnValue(0.8);

      await adminDailyChallengeService.runAutoGeneration();

      expect(console.log).toHaveBeenCalledWith(
        '[runAutoGeneration] Plantilla seleccionada:',
        'Template Peso 5'
      );

      Math.random.mockRestore();
    });
  });
});
