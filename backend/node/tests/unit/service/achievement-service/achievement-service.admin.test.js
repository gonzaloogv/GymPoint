/**
 * Tests para achievement-service - Admin Methods
 * Cubre: createDefinition, updateDefinition, deleteDefinition
 */

const {
  mockAchievementDefinition,
  mockUserAchievement,
  mockAppEvents,
  mockErrors,
  mockOp,
} = require('./test-setup');

const achievementService = require('../../../../services/achievement-service');
const { EVENTS } = require('../../../../websocket/events/event-emitter');

describe('achievement-service admin methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDefinition', () => {
    it('crea una nueva definición con datos válidos', async () => {
      const payload = {
        code: 'streak_14',
        name: 'Racha de 14 días',
        description: 'Mantén una racha de 14 días consecutivos',
        category: 'streak',
        metric_type: 'streak_days',
        target_value: 14,
        icon_url: 'https://example.com/icon.png',
        metadata: { token_reward: 50 },
        is_active: true,
      };

      const mockCreatedDefinition = {
        id_achievement_definition: 1,
        code: 'STREAK_14',
        name: 'Racha de 14 días',
        description: 'Mantén una racha de 14 días consecutivos',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 14,
        icon_url: 'https://example.com/icon.png',
        metadata: { token_reward: 50 },
        is_active: true,
        get: jest.fn().mockReturnThis(),
      };

      mockAchievementDefinition.findOne.mockResolvedValue(null);
      mockAchievementDefinition.create.mockResolvedValue(mockCreatedDefinition);

      const result = await achievementService.createDefinition(payload);

      expect(mockAchievementDefinition.findOne).toHaveBeenCalledWith({
        where: { code: 'STREAK_14' },
      });
      expect(mockAchievementDefinition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'STREAK_14',
          name: 'Racha de 14 días',
          category: 'STREAK',
          metric_type: 'STREAK_DAYS',
          target_value: 14,
        })
      );
      expect(mockAppEvents.emit).toHaveBeenCalledWith(
        EVENTS.ACHIEVEMENT_CREATED,
        expect.objectContaining({
          achievement: mockCreatedDefinition,
          timestamp: expect.any(String),
        })
      );
      expect(result).toEqual(mockCreatedDefinition);
    });

    it('lanza ConflictError si el código ya existe', async () => {
      const payload = {
        code: 'STREAK_7',
        name: 'Racha de 7 días',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
      };

      mockAchievementDefinition.findOne.mockResolvedValue({ code: 'STREAK_7' });

      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        mockErrors.ConflictError
      );
      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        'Ya existe un logro con el código STREAK_7'
      );
      expect(mockAchievementDefinition.create).not.toHaveBeenCalled();
    });

    it('lanza ValidationError si falta campo code', async () => {
      const payload = {
        name: 'Test',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
      };

      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        mockErrors.ValidationError
      );
      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        'El campo code es requerido'
      );
    });

    it('lanza ValidationError si falta campo name', async () => {
      const payload = {
        code: 'TEST',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
      };

      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        mockErrors.ValidationError
      );
      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        'El campo name es requerido'
      );
    });

    it('lanza ValidationError si category es inválida', async () => {
      const payload = {
        code: 'TEST',
        name: 'Test',
        category: 'INVALID_CATEGORY',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
      };

      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        mockErrors.ValidationError
      );
      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        'Categoría inválida: INVALID_CATEGORY'
      );
    });

    it('lanza ValidationError si metric_type es inválido', async () => {
      const payload = {
        code: 'TEST',
        name: 'Test',
        category: 'STREAK',
        metric_type: 'INVALID_METRIC',
        target_value: 7,
      };

      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        mockErrors.ValidationError
      );
      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        'Tipo de métrica inválido: INVALID_METRIC'
      );
    });

    it('lanza ValidationError si target_value no es entero positivo', async () => {
      const payload = {
        code: 'TEST',
        name: 'Test',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: -5,
      };

      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        mockErrors.ValidationError
      );
      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        'El campo target_value debe ser un entero positivo'
      );
    });

    it('acepta metadata null', async () => {
      const payload = {
        code: 'TEST',
        name: 'Test',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
        metadata: null,
      };

      mockAchievementDefinition.findOne.mockResolvedValue(null);
      mockAchievementDefinition.create.mockResolvedValue({ get: jest.fn().mockReturnThis() });

      await achievementService.createDefinition(payload);

      expect(mockAchievementDefinition.create).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: null })
      );
    });

    it('lanza ValidationError si payload no es un objeto', async () => {
      await expect(achievementService.createDefinition(null)).rejects.toThrow(
        mockErrors.ValidationError
      );
      await expect(achievementService.createDefinition(null)).rejects.toThrow(
        'Datos de logro inválidos'
      );
    });

    it('lanza ValidationError si code excede 50 caracteres', async () => {
      const payload = {
        code: 'A'.repeat(51),
        name: 'Test',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
      };

      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        mockErrors.ValidationError
      );
      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        'El campo code debe tener hasta 50 caracteres'
      );
    });

    it('lanza ValidationError si name excede 120 caracteres', async () => {
      const payload = {
        code: 'TEST',
        name: 'A'.repeat(121),
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
      };

      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        mockErrors.ValidationError
      );
      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        'El campo name debe tener hasta 120 caracteres'
      );
    });

    it('lanza ValidationError si icon_url excede 500 caracteres', async () => {
      const payload = {
        code: 'TEST',
        name: 'Test',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
        icon_url: 'https://example.com/' + 'A'.repeat(500),
      };

      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        mockErrors.ValidationError
      );
      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        'El campo icon_url debe tener hasta 500 caracteres'
      );
    });

    it('lanza ValidationError si metadata no es objeto', async () => {
      const payload = {
        code: 'TEST',
        name: 'Test',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
        metadata: 'invalid',
      };

      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        mockErrors.ValidationError
      );
      await expect(achievementService.createDefinition(payload)).rejects.toThrow(
        'El metadata debe ser un objeto JSON'
      );
    });

    it('normaliza code a uppercase', async () => {
      const payload = {
        code: 'test_lowercase',
        name: 'Test',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
      };

      mockAchievementDefinition.findOne.mockResolvedValue(null);
      mockAchievementDefinition.create.mockResolvedValue({ get: jest.fn().mockReturnThis() });

      await achievementService.createDefinition(payload);

      expect(mockAchievementDefinition.create).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'TEST_LOWERCASE' })
      );
    });

    it('sanitiza strings con trim', async () => {
      const payload = {
        code: '  TEST  ',
        name: '  Test Name  ',
        description: '  Description  ',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
        icon_url: '  https://example.com/icon.png  ',
      };

      mockAchievementDefinition.findOne.mockResolvedValue(null);
      mockAchievementDefinition.create.mockResolvedValue({ get: jest.fn().mockReturnThis() });

      await achievementService.createDefinition(payload);

      expect(mockAchievementDefinition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'TEST',
          name: 'Test Name',
          description: 'Description',
          icon_url: 'https://example.com/icon.png',
        })
      );
    });
  });

  describe('updateDefinition', () => {
    it('actualiza una definición existente', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        code: 'STREAK_7',
        name: 'Racha de 7 días',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
        save: jest.fn().mockResolvedValue(),
        get: jest.fn().mockReturnThis(),
      };

      const payload = {
        name: 'Racha de 7 días actualizada',
        description: 'Nueva descripción',
      };

      mockAchievementDefinition.findByPk.mockResolvedValue(mockDefinition);

      const result = await achievementService.updateDefinition(1, payload);

      expect(mockDefinition.name).toBe('Racha de 7 días actualizada');
      expect(mockDefinition.description).toBe('Nueva descripción');
      expect(mockDefinition.save).toHaveBeenCalled();
      expect(mockAppEvents.emit).toHaveBeenCalledWith(
        EVENTS.ACHIEVEMENT_UPDATED,
        expect.objectContaining({
          achievement: mockDefinition,
          timestamp: expect.any(String),
        })
      );
      expect(result).toEqual(mockDefinition);
    });

    it('lanza NotFoundError si la definición no existe', async () => {
      mockAchievementDefinition.findByPk.mockResolvedValue(null);

      await expect(achievementService.updateDefinition(999, { name: 'Test' })).rejects.toThrow(
        mockErrors.NotFoundError
      );
      await expect(achievementService.updateDefinition(999, { name: 'Test' })).rejects.toThrow(
        'Logro'
      );
    });

    it('lanza ConflictError si el nuevo código ya existe en otra definición', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        code: 'STREAK_7',
        save: jest.fn(),
      };

      mockAchievementDefinition.findByPk.mockResolvedValue(mockDefinition);
      mockAchievementDefinition.findOne.mockResolvedValue({
        id_achievement_definition: 2,
        code: 'STREAK_14',
      });

      await expect(
        achievementService.updateDefinition(1, { code: 'STREAK_14' })
      ).rejects.toThrow(mockErrors.ConflictError);
    });

    it('actualiza progress_denominator de user_achievements si target_value cambió', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        code: 'STREAK_7',
        target_value: 7,
        save: jest.fn().mockResolvedValue(),
        get: jest.fn().mockReturnThis(),
      };

      mockAchievementDefinition.findByPk.mockResolvedValue(mockDefinition);
      mockUserAchievement.update.mockResolvedValue();

      await achievementService.updateDefinition(1, { target_value: 10 });

      expect(mockUserAchievement.update).toHaveBeenCalledWith(
        { progress_denominator: 10 },
        { where: { id_achievement_definition: 1 } }
      );
    });

    it('no actualiza progress_denominator si target_value no cambió', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        code: 'STREAK_7',
        target_value: 7,
        save: jest.fn().mockResolvedValue(),
        get: jest.fn().mockReturnThis(),
      };

      mockAchievementDefinition.findByPk.mockResolvedValue(mockDefinition);

      await achievementService.updateDefinition(1, { name: 'Nuevo nombre' });

      expect(mockUserAchievement.update).not.toHaveBeenCalled();
    });

    it('permite actualizar solo campos específicos (isUpdate=true)', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        code: 'STREAK_7',
        name: 'Original',
        target_value: 7,
        save: jest.fn().mockResolvedValue(),
        get: jest.fn().mockReturnThis(),
      };

      mockAchievementDefinition.findByPk.mockResolvedValue(mockDefinition);

      await achievementService.updateDefinition(1, { name: 'Actualizado' });

      expect(mockDefinition.name).toBe('Actualizado');
      expect(mockDefinition.code).toBe('STREAK_7'); // No cambió
    });
  });

  describe('deleteDefinition', () => {
    it('elimina una definición existente', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        code: 'STREAK_7',
        destroy: jest.fn().mockResolvedValue(),
      };

      mockAchievementDefinition.findByPk.mockResolvedValue(mockDefinition);

      const result = await achievementService.deleteDefinition(1);

      expect(mockDefinition.destroy).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('lanza NotFoundError si la definición no existe', async () => {
      mockAchievementDefinition.findByPk.mockResolvedValue(null);

      await expect(achievementService.deleteDefinition(999)).rejects.toThrow(
        mockErrors.NotFoundError
      );
      await expect(achievementService.deleteDefinition(999)).rejects.toThrow('Logro');
    });
  });
});
