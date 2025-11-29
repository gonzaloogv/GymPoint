/**
 * Tests para challenge-service - Templates CRUD
 * Cubre: createChallengeTemplate, updateChallengeTemplate, getChallengeTemplateById, listChallengeTemplates
 */

const {
  mockDailyChallengeRepository,
  mockErrors,
  challengeService,
} = require('./test-setup');

describe('challenge-service templates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createChallengeTemplate', () => {
    it('crea template exitosamente', async () => {
      const command = {
        name: 'Entrena 30 minutos',
        description: 'Completa 30 minutos de ejercicio',
        challengeType: 'MINUTES',
        targetValue: 30,
        targetUnit: 'minutos',
        tokensReward: 20,
        difficulty: 'MEDIUM',
        rotationWeight: 5,
        isActive: true,
      };

      mockDailyChallengeRepository.createTemplate.mockResolvedValue({
        id_template: 1,
        name: 'Entrena 30 minutos',
        challenge_type: 'MINUTES',
        target_value: 30,
      });

      const result = await challengeService.createChallengeTemplate(command);

      expect(mockDailyChallengeRepository.createTemplate).toHaveBeenCalledWith({
        name: 'Entrena 30 minutos',
        description: 'Completa 30 minutos de ejercicio',
        challenge_type: 'MINUTES',
        target_value: 30,
        target_unit: 'minutos',
        tokens_reward: 20,
        difficulty: 'MEDIUM',
        rotation_weight: 5,
        is_active: true,
      });

      expect(result.id_template).toBe(1);
    });

    it('usa valores por defecto para campos opcionales', async () => {
      const command = {
        name: 'Template mínimo',
        challengeType: 'EXERCISES',
        targetValue: 10,
      };

      mockDailyChallengeRepository.createTemplate.mockResolvedValue({
        id_template: 1,
      });

      await challengeService.createChallengeTemplate(command);

      expect(mockDailyChallengeRepository.createTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          tokens_reward: 10, // Default
          difficulty: 'MEDIUM', // Default
          rotation_weight: 1, // Default
          is_active: true, // Default
        })
      );
    });

    it('no normaliza challengeType', async () => {
      const command = {
        name: 'Template',
        challengeType: 'MINUTES',
        targetValue: 20,
      };

      mockDailyChallengeRepository.createTemplate.mockResolvedValue({
        id_template: 1,
      });

      await challengeService.createChallengeTemplate(command);

      expect(mockDailyChallengeRepository.createTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          challenge_type: 'MINUTES',
        })
      );
    });

    it('no normaliza difficulty', async () => {
      const command = {
        name: 'Template',
        challengeType: 'EXERCISES',
        targetValue: 10,
        difficulty: 'HARD',
      };

      mockDailyChallengeRepository.createTemplate.mockResolvedValue({
        id_template: 1,
      });

      await challengeService.createChallengeTemplate(command);

      expect(mockDailyChallengeRepository.createTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: 'HARD',
        })
      );
    });
  });

  describe('updateChallengeTemplate', () => {
    it('actualiza template existente', async () => {
      const command = {
        idTemplate: 1,
        name: 'Nombre actualizado',
        description: 'Descripción actualizada',
        tokensReward: 25,
        difficulty: 'HARD',
        isActive: false,
      };

      mockDailyChallengeRepository.findTemplateById.mockResolvedValue({
        id_template: 1,
        name: 'Nombre original',
      });
      mockDailyChallengeRepository.updateTemplate.mockResolvedValue({
        id_template: 1,
        name: 'Nombre actualizado',
      });

      const result = await challengeService.updateChallengeTemplate(command);

      expect(mockDailyChallengeRepository.findTemplateById).toHaveBeenCalledWith(1);
      expect(mockDailyChallengeRepository.updateTemplate).toHaveBeenCalledWith(1, {
        name: 'Nombre actualizado',
        description: 'Descripción actualizada',
        tokens_reward: 25,
        difficulty: 'HARD',
        is_active: false,
      });

      expect(result.name).toBe('Nombre actualizado');
    });

    it('actualiza solo campos especificados', async () => {
      const command = {
        idTemplate: 1,
        rotationWeight: 10,
      };

      mockDailyChallengeRepository.findTemplateById.mockResolvedValue({
        id_template: 1,
      });
      mockDailyChallengeRepository.updateTemplate.mockResolvedValue({
        id_template: 1,
      });

      await challengeService.updateChallengeTemplate(command);

      expect(mockDailyChallengeRepository.updateTemplate).toHaveBeenCalledWith(1, {
        rotation_weight: 10,
      });
    });

    it('no normaliza difficulty', async () => {
      const command = {
        idTemplate: 1,
        difficulty: 'EASY',
      };

      mockDailyChallengeRepository.findTemplateById.mockResolvedValue({
        id_template: 1,
      });
      mockDailyChallengeRepository.updateTemplate.mockResolvedValue({
        id_template: 1,
      });

      await challengeService.updateChallengeTemplate(command);

      expect(mockDailyChallengeRepository.updateTemplate).toHaveBeenCalledWith(1, {
        difficulty: 'EASY',
      });
    });

    it('no normaliza challengeType', async () => {
      const command = {
        idTemplate: 1,
        challengeType: 'EXERCISES',
      };

      mockDailyChallengeRepository.findTemplateById.mockResolvedValue({
        id_template: 1,
      });
      mockDailyChallengeRepository.updateTemplate.mockResolvedValue({
        id_template: 1,
      });

      await challengeService.updateChallengeTemplate(command);

      expect(mockDailyChallengeRepository.updateTemplate).toHaveBeenCalledWith(1, {
        challenge_type: 'EXERCISES',
      });
    });

    it('lanza NotFoundError si template no existe', async () => {
      const command = {
        idTemplate: 999,
        name: 'Nuevo nombre',
      };

      mockDailyChallengeRepository.findTemplateById.mockResolvedValue(null);

      await expect(challengeService.updateChallengeTemplate(command)).rejects.toThrow(
        mockErrors.NotFoundError
      );
      await expect(challengeService.updateChallengeTemplate(command)).rejects.toThrow(
        'Plantilla'
      );

      expect(mockDailyChallengeRepository.updateTemplate).not.toHaveBeenCalled();
    });

    it('permite actualizar todos los campos', async () => {
      const command = {
        idTemplate: 1,
        name: 'Nuevo nombre',
        description: 'Nueva descripción',
        challengeType: 'MINUTES',
        targetValue: 45,
        targetUnit: 'minutos',
        tokensReward: 30,
        difficulty: 'HARD',
        rotationWeight: 8,
        isActive: true,
      };

      mockDailyChallengeRepository.findTemplateById.mockResolvedValue({
        id_template: 1,
      });
      mockDailyChallengeRepository.updateTemplate.mockResolvedValue({
        id_template: 1,
      });

      await challengeService.updateChallengeTemplate(command);

      expect(mockDailyChallengeRepository.updateTemplate).toHaveBeenCalledWith(1, {
        name: 'Nuevo nombre',
        description: 'Nueva descripción',
        challenge_type: 'MINUTES',
        target_value: 45,
        target_unit: 'minutos',
        tokens_reward: 30,
        difficulty: 'HARD',
        rotation_weight: 8,
        is_active: true,
      });
    });
  });

  describe('getChallengeTemplateById', () => {
    it('obtiene template por ID', async () => {
      const mockTemplate = {
        id_template: 1,
        title: 'Entrena 30 minutos',
        challenge_type: 'MINUTES',
        target_value: 30,
      };

      mockDailyChallengeRepository.findTemplateById.mockResolvedValue(mockTemplate);

      const result = await challengeService.getChallengeTemplateById({ idTemplate: 1 });

      expect(mockDailyChallengeRepository.findTemplateById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTemplate);
    });

    it('acepta idTemplate como número directo', async () => {
      mockDailyChallengeRepository.findTemplateById.mockResolvedValue({
        id_template: 1,
      });

      await challengeService.getChallengeTemplateById(1);

      expect(mockDailyChallengeRepository.findTemplateById).toHaveBeenCalledWith(1);
    });

    it('lanza NotFoundError si template no existe', async () => {
      mockDailyChallengeRepository.findTemplateById.mockResolvedValue(null);

      await expect(
        challengeService.getChallengeTemplateById({ idTemplate: 999 })
      ).rejects.toThrow(mockErrors.NotFoundError);
      await expect(
        challengeService.getChallengeTemplateById({ idTemplate: 999 })
      ).rejects.toThrow('Plantilla');
    });
  });

  describe('listChallengeTemplates', () => {
    it('lista templates con valores por defecto', async () => {
      const mockTemplates = [
        { id_template: 1, name: 'Template 1' },
        { id_template: 2, name: 'Template 2' },
      ];

      mockDailyChallengeRepository.listTemplates.mockResolvedValue({
        rows: mockTemplates,
        count: 2,
      });

      const result = await challengeService.listChallengeTemplates({});

      expect(mockDailyChallengeRepository.listTemplates).toHaveBeenCalledWith({
        filters: {
          isActive: null,
        },
        pagination: {
          limit: 20,
          offset: 0,
        },
      });

      expect(result).toEqual({
        items: mockTemplates,
        total: 2,
        page: 1,
        limit: 20,
      });
    });

    it('aplica filtros personalizados', async () => {
      mockDailyChallengeRepository.listTemplates.mockResolvedValue({
        rows: [],
        count: 0,
      });

      await challengeService.listChallengeTemplates({
        page: 2,
        limit: 10,
        isActive: true,
      });

      expect(mockDailyChallengeRepository.listTemplates).toHaveBeenCalledWith({
        filters: {
          isActive: true,
        },
        pagination: {
          limit: 10,
          offset: 10,
        },
      });
    });

    it('maneja isActive como false explícitamente', async () => {
      mockDailyChallengeRepository.listTemplates.mockResolvedValue({
        rows: [],
        count: 0,
      });

      await challengeService.listChallengeTemplates({ isActive: false });

      expect(mockDailyChallengeRepository.listTemplates).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            isActive: false,
          }),
        })
      );
    });
  });
});
