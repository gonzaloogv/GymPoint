/**
 * Tests para admin-daily-challenge-service - Template CRUD
 * Cubre: listTemplates, createTemplate, updateTemplate, deleteTemplate
 */

const {
  mockDailyChallengeTemplate,
  mockDailyChallenge,
} = require('./test-setup');

const adminDailyChallengeService = require('../../../../services/admin-daily-challenge-service');

describe('admin-daily-challenge-service templates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listTemplates', () => {
    it('lista templates ordenadas por is_active, rotation_weight e id', async () => {
      const mockTemplates = [
        { id_template: 1, title: 'Template 1', is_active: true, rotation_weight: 10 },
        { id_template: 2, title: 'Template 2', is_active: true, rotation_weight: 5 },
        { id_template: 3, title: 'Template 3', is_active: false, rotation_weight: 1 },
      ];

      mockDailyChallengeTemplate.findAll.mockResolvedValue(mockTemplates);

      const result = await adminDailyChallengeService.listTemplates();

      expect(result).toEqual(mockTemplates);
      expect(mockDailyChallengeTemplate.findAll).toHaveBeenCalledWith({
        order: [
          ['is_active', 'DESC'],
          ['rotation_weight', 'DESC'],
          ['id_template', 'ASC'],
        ],
      });
    });

    it('retorna array vacío cuando no hay templates', async () => {
      mockDailyChallengeTemplate.findAll.mockResolvedValue([]);

      const result = await adminDailyChallengeService.listTemplates();

      expect(result).toEqual([]);
    });
  });

  describe('createTemplate', () => {
    it('crea template con datos válidos', async () => {
      const payload = {
        title: 'Entrena 30 minutos',
        description: 'Completa 30 minutos de ejercicio continuo',
        challenge_type: 'minutes',
        target_value: 30,
        target_unit: 'minutos',
        tokens_reward: 20,
        difficulty: 'medium',
        rotation_weight: 5,
        is_active: true,
      };

      mockDailyChallengeTemplate.create.mockResolvedValue({
        id_template: 1,
        ...payload,
        challenge_type: 'MINUTES',
        difficulty: 'MEDIUM',
      });

      const result = await adminDailyChallengeService.createTemplate(payload, {
        createdBy: 'admin@test.com',
      });

      expect(mockDailyChallengeTemplate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Entrena 30 minutos',
          challenge_type: 'MINUTES',
          target_value: 30,
          tokens_reward: 20,
          difficulty: 'MEDIUM',
          rotation_weight: 5,
          is_active: true,
          created_by: 'admin@test.com',
        })
      );

      expect(result.id_template).toBe(1);
    });

    it('usa valores por defecto para campos opcionales', async () => {
      const payload = {
        title: 'Template Mínimo',
        challenge_type: 'EXERCISES',
        target_value: 10,
      };

      mockDailyChallengeTemplate.create.mockResolvedValue({
        id_template: 1,
        ...payload,
      });

      await adminDailyChallengeService.createTemplate(payload);

      expect(mockDailyChallengeTemplate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tokens_reward: 10, // Default
          difficulty: 'MEDIUM', // Default
          rotation_weight: 1, // Default
          is_active: true, // Default
        })
      );
    });

    it('permite rotation_weight = 0', async () => {
      const payload = {
        title: 'Template Sin Peso',
        challenge_type: 'FREQUENCY',
        target_value: 3,
        rotation_weight: 0,
      };

      mockDailyChallengeTemplate.create.mockResolvedValue({
        id_template: 1,
      });

      await adminDailyChallengeService.createTemplate(payload);

      expect(mockDailyChallengeTemplate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          rotation_weight: 0,
        })
      );
    });

    it('lanza error si falta title', async () => {
      const payload = {
        challenge_type: 'MINUTES',
        target_value: 30,
      };

      await expect(
        adminDailyChallengeService.createTemplate(payload)
      ).rejects.toThrow('title, challenge_type y target_value son requeridos');
    });

    it('lanza error si falta challenge_type', async () => {
      const payload = {
        title: 'Template Sin Tipo',
        target_value: 30,
      };

      await expect(
        adminDailyChallengeService.createTemplate(payload)
      ).rejects.toThrow('title, challenge_type y target_value son requeridos');
    });

    it('lanza error si falta target_value', async () => {
      const payload = {
        title: 'Template Sin Target',
        challenge_type: 'MINUTES',
      };

      await expect(
        adminDailyChallengeService.createTemplate(payload)
      ).rejects.toThrow('title, challenge_type y target_value son requeridos');
    });

    it('lanza error si challenge_type es inválido', async () => {
      const payload = {
        title: 'Template Inválido',
        challenge_type: 'INVALID_TYPE',
        target_value: 30,
      };

      await expect(
        adminDailyChallengeService.createTemplate(payload)
      ).rejects.toThrow('Tipo de desafío no admitido');
    });

    it('lanza error si target_value es negativo', async () => {
      const payload = {
        title: 'Template Negativo',
        challenge_type: 'MINUTES',
        target_value: -10,
      };

      await expect(
        adminDailyChallengeService.createTemplate(payload)
      ).rejects.toThrow('target_value debe ser un número mayor a 0');
    });

    it('lanza error si rotation_weight es negativo', async () => {
      const payload = {
        title: 'Template',
        challenge_type: 'MINUTES',
        target_value: 30,
        rotation_weight: -1,
      };

      await expect(
        adminDailyChallengeService.createTemplate(payload)
      ).rejects.toThrow('rotation_weight debe ser un número no negativo');
    });

    it('normaliza challenge_type y difficulty', async () => {
      const payload = {
        title: 'Test',
        challenge_type: 'exercises',
        target_value: 10,
        difficulty: 'easy',
      };

      mockDailyChallengeTemplate.create.mockResolvedValue({ id_template: 1 });

      await adminDailyChallengeService.createTemplate(payload);

      expect(mockDailyChallengeTemplate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          challenge_type: 'EXERCISES',
          difficulty: 'EASY',
        })
      );
    });
  });

  describe('updateTemplate', () => {
    it('actualiza template existente', async () => {
      const mockTemplate = {
        id_template: 1,
        title: 'Título original',
        challenge_type: 'MINUTES',
        target_value: 30,
        update: jest.fn().mockResolvedValue(),
      };

      const payload = {
        title: 'Título actualizado',
        tokens_reward: 25,
        rotation_weight: 10,
      };

      mockDailyChallengeTemplate.findByPk.mockResolvedValue(mockTemplate);

      const result = await adminDailyChallengeService.updateTemplate(1, payload);

      expect(mockTemplate.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Título actualizado',
          tokens_reward: 25,
          rotation_weight: 10,
        })
      );
      expect(result).toEqual(mockTemplate);
    });

    it('lanza error si template no existe', async () => {
      mockDailyChallengeTemplate.findByPk.mockResolvedValue(null);

      await expect(
        adminDailyChallengeService.updateTemplate(999, { title: 'Test' })
      ).rejects.toThrow('Plantilla no encontrada');
    });

    it('convierte is_active a boolean', async () => {
      const mockTemplate = {
        id_template: 1,
        update: jest.fn().mockResolvedValue(),
      };

      mockDailyChallengeTemplate.findByPk.mockResolvedValue(mockTemplate);

      await adminDailyChallengeService.updateTemplate(1, { is_active: false });

      expect(mockTemplate.update).toHaveBeenCalledWith(
        expect.objectContaining({
          is_active: false,
        })
      );
    });

    it('permite actualizar parcialmente', async () => {
      const mockTemplate = {
        id_template: 1,
        title: 'Original',
        rotation_weight: 5,
        update: jest.fn().mockResolvedValue(),
      };

      mockDailyChallengeTemplate.findByPk.mockResolvedValue(mockTemplate);

      await adminDailyChallengeService.updateTemplate(1, { rotation_weight: 8 });

      expect(mockTemplate.update).toHaveBeenCalledWith(
        expect.objectContaining({
          rotation_weight: 8,
        })
      );
    });
  });

  describe('deleteTemplate', () => {
    it('elimina template sin challenges generados', async () => {
      const mockTemplate = {
        id_template: 1,
        destroy: jest.fn().mockResolvedValue(),
      };

      mockDailyChallengeTemplate.findByPk.mockResolvedValue(mockTemplate);
      mockDailyChallenge.count.mockResolvedValue(0);

      const result = await adminDailyChallengeService.deleteTemplate(1);

      expect(mockDailyChallenge.count).toHaveBeenCalledWith({
        where: { id_template: 1 },
      });
      expect(mockTemplate.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('lanza error si template no existe', async () => {
      mockDailyChallengeTemplate.findByPk.mockResolvedValue(null);

      await expect(adminDailyChallengeService.deleteTemplate(999)).rejects.toThrow(
        'Plantilla no encontrada'
      );
    });

    it('lanza error si template tiene challenges generados', async () => {
      const mockTemplate = {
        id_template: 1,
        destroy: jest.fn(),
      };

      mockDailyChallengeTemplate.findByPk.mockResolvedValue(mockTemplate);
      mockDailyChallenge.count.mockResolvedValue(3);

      await expect(adminDailyChallengeService.deleteTemplate(1)).rejects.toThrow(
        'Existen desafíos generados desde esta plantilla'
      );

      expect(mockTemplate.destroy).not.toHaveBeenCalled();
    });
  });
});
