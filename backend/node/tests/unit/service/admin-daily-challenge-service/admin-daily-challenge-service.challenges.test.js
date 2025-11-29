/**
 * Tests para admin-daily-challenge-service - Challenge CRUD
 * Cubre: listChallenges, getChallengeById, createChallenge, updateChallenge, deleteChallenge
 */

const {
  mockDailyChallenge,
  mockDailyChallengeTemplate,
  mockUserDailyChallenge,
  mockOp,
} = require('./test-setup');

const adminDailyChallengeService = require('../../../../services/admin-daily-challenge-service');

describe('admin-daily-challenge-service challenges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listChallenges', () => {
    it('lista todos los challenges sin filtros (solo activos por defecto)', async () => {
      const mockChallenges = [
        { id_challenge: 1, challenge_date: '2025-01-15', is_active: true },
        { id_challenge: 2, challenge_date: '2025-01-14', is_active: true },
      ];

      mockDailyChallenge.findAll.mockResolvedValue(mockChallenges);

      const result = await adminDailyChallengeService.listChallenges({});

      expect(result).toEqual(mockChallenges);
      expect(mockDailyChallenge.findAll).toHaveBeenCalledWith({
        where: { is_active: true },
        order: [['challenge_date', 'DESC']],
        include: [{ model: mockDailyChallengeTemplate, as: 'template' }],
      });
    });

    it('filtra challenges por fecha from', async () => {
      mockDailyChallenge.findAll.mockResolvedValue([]);

      await adminDailyChallengeService.listChallenges({ from: '2025-01-01' });

      expect(mockDailyChallenge.findAll).toHaveBeenCalledWith({
        where: {
          challenge_date: { [mockOp.gte]: '2025-01-01' },
          is_active: true,
        },
        order: [['challenge_date', 'DESC']],
        include: [{ model: mockDailyChallengeTemplate, as: 'template' }],
      });
    });

    it('filtra challenges por fecha to', async () => {
      mockDailyChallenge.findAll.mockResolvedValue([]);

      await adminDailyChallengeService.listChallenges({ to: '2025-01-31' });

      expect(mockDailyChallenge.findAll).toHaveBeenCalledWith({
        where: {
          challenge_date: { [mockOp.lte]: '2025-01-31' },
          is_active: true,
        },
        order: [['challenge_date', 'DESC']],
        include: [{ model: mockDailyChallengeTemplate, as: 'template' }],
      });
    });

    it('filtra challenges por rango de fechas', async () => {
      mockDailyChallenge.findAll.mockResolvedValue([]);

      await adminDailyChallengeService.listChallenges({
        from: '2025-01-01',
        to: '2025-01-31',
      });

      expect(mockDailyChallenge.findAll).toHaveBeenCalledWith({
        where: {
          challenge_date: {
            [mockOp.gte]: '2025-01-01',
            [mockOp.lte]: '2025-01-31',
          },
          is_active: true,
        },
        order: [['challenge_date', 'DESC']],
        include: [{ model: mockDailyChallengeTemplate, as: 'template' }],
      });
    });

    it('filtra solo challenges activos por defecto', async () => {
      mockDailyChallenge.findAll.mockResolvedValue([]);

      await adminDailyChallengeService.listChallenges({ includeInactive: false });

      expect(mockDailyChallenge.findAll).toHaveBeenCalledWith({
        where: { is_active: true },
        order: [['challenge_date', 'DESC']],
        include: [{ model: mockDailyChallengeTemplate, as: 'template' }],
      });
    });

    it('incluye challenges inactivos si se especifica', async () => {
      mockDailyChallenge.findAll.mockResolvedValue([]);

      await adminDailyChallengeService.listChallenges({ includeInactive: true });

      expect(mockDailyChallenge.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['challenge_date', 'DESC']],
        include: [{ model: mockDailyChallengeTemplate, as: 'template' }],
      });
    });
  });

  describe('getChallengeById', () => {
    it('obtiene challenge por ID con template y progreso de usuarios', async () => {
      const mockChallenge = {
        id_challenge: 1,
        title: 'Desafío del día',
        challenge_type: 'MINUTES',
        target_value: 30,
        template: { id_template: 1 },
        userProgress: [],
      };

      mockDailyChallenge.findByPk.mockResolvedValue(mockChallenge);

      const result = await adminDailyChallengeService.getChallengeById(1);

      expect(result).toEqual(mockChallenge);
      expect(mockDailyChallenge.findByPk).toHaveBeenCalledWith(1, {
        include: expect.arrayContaining([
          { model: mockDailyChallengeTemplate, as: 'template' },
          expect.objectContaining({ as: 'userProgress' }),
        ]),
      });
    });

    it('retorna null si challenge no existe', async () => {
      mockDailyChallenge.findByPk.mockResolvedValue(null);

      const result = await adminDailyChallengeService.getChallengeById(999);

      expect(result).toBeNull();
    });
  });

  describe('createChallenge', () => {
    it('crea challenge manual con datos válidos', async () => {
      const payload = {
        title: 'Entrena 30 minutos',
        description: 'Completa 30 minutos de ejercicio',
        challenge_type: 'minutes',
        target_value: 30,
        target_unit: 'minutos',
        tokens_reward: 20,
        difficulty: 'medium',
        challenge_date: '2025-01-20',
        is_active: true,
      };

      mockDailyChallenge.findOne.mockResolvedValue(null);
      mockDailyChallenge.create.mockResolvedValue({
        id_challenge: 1,
        ...payload,
        challenge_type: 'MINUTES',
        difficulty: 'MEDIUM',
      });

      const result = await adminDailyChallengeService.createChallenge(payload, {
        createdBy: 'admin@test.com',
      });

      expect(mockDailyChallenge.findOne).toHaveBeenCalledWith({
        where: { challenge_date: '2025-01-20' },
      });

      expect(mockDailyChallenge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Entrena 30 minutos',
          challenge_type: 'MINUTES',
          target_value: 30,
          tokens_reward: 20,
          difficulty: 'MEDIUM',
          challenge_date: '2025-01-20',
          is_active: true,
          auto_generated: false,
          created_by: 'admin@test.com',
        })
      );

      expect(result.id_challenge).toBe(1);
    });

    it('normaliza challenge_type a uppercase', async () => {
      const payload = {
        title: 'Test',
        challenge_type: 'exercises',
        target_value: 10,
        challenge_date: '2025-01-20',
      };

      mockDailyChallenge.findOne.mockResolvedValue(null);
      mockDailyChallenge.create.mockResolvedValue({ id_challenge: 1 });

      await adminDailyChallengeService.createChallenge(payload);

      expect(mockDailyChallenge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          challenge_type: 'EXERCISES',
        })
      );
    });

    it('normaliza difficulty', async () => {
      const payload = {
        title: 'Test',
        challenge_type: 'MINUTES',
        target_value: 30,
        challenge_date: '2025-01-20',
        difficulty: 'beginner',
      };

      mockDailyChallenge.findOne.mockResolvedValue(null);
      mockDailyChallenge.create.mockResolvedValue({ id_challenge: 1 });

      await adminDailyChallengeService.createChallenge(payload);

      expect(mockDailyChallenge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: 'BEGINNER',
        })
      );
    });

    it('usa difficulty MEDIUM como default', async () => {
      const payload = {
        title: 'Test',
        challenge_type: 'MINUTES',
        target_value: 30,
        challenge_date: '2025-01-20',
      };

      mockDailyChallenge.findOne.mockResolvedValue(null);
      mockDailyChallenge.create.mockResolvedValue({ id_challenge: 1 });

      await adminDailyChallengeService.createChallenge(payload);

      expect(mockDailyChallenge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: 'MEDIUM',
        })
      );
    });

    it('usa tokens_reward por defecto 10 si no se especifica', async () => {
      const payload = {
        title: 'Test',
        challenge_type: 'MINUTES',
        target_value: 30,
        challenge_date: '2025-01-20',
      };

      mockDailyChallenge.findOne.mockResolvedValue(null);
      mockDailyChallenge.create.mockResolvedValue({ id_challenge: 1 });

      await adminDailyChallengeService.createChallenge(payload);

      expect(mockDailyChallenge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tokens_reward: 10,
        })
      );
    });

    it('lanza error si challenge_date no está provisto', async () => {
      const payload = {
        title: 'Test',
        challenge_type: 'MINUTES',
        target_value: 30,
      };

      await expect(
        adminDailyChallengeService.createChallenge(payload)
      ).rejects.toThrow('challenge_date es requerido para crear un desafío manual');
    });

    it('lanza error si ya existe challenge para esa fecha', async () => {
      const payload = {
        title: 'Test',
        challenge_type: 'MINUTES',
        target_value: 30,
        challenge_date: '2025-01-20',
      };

      mockDailyChallenge.findOne.mockResolvedValue({ id_challenge: 1 });

      await expect(
        adminDailyChallengeService.createChallenge(payload)
      ).rejects.toThrow('Ya existe un desafío asignado para esa fecha');
    });

    it('lanza error si challenge_type es inválido', async () => {
      const payload = {
        title: 'Test',
        challenge_type: 'INVALID_TYPE',
        target_value: 30,
        challenge_date: '2025-01-20',
      };

      await expect(
        adminDailyChallengeService.createChallenge(payload)
      ).rejects.toThrow('Tipo de desafío no admitido');
    });

    it('lanza error si target_value no es positivo', async () => {
      const payload = {
        title: 'Test',
        challenge_type: 'MINUTES',
        target_value: -10,
        challenge_date: '2025-01-20',
      };

      await expect(
        adminDailyChallengeService.createChallenge(payload)
      ).rejects.toThrow('target_value debe ser un número mayor a 0');
    });

    it('lanza error si tokens_reward es negativo', async () => {
      const payload = {
        title: 'Test',
        challenge_type: 'MINUTES',
        target_value: 30,
        tokens_reward: -5,
        challenge_date: '2025-01-20',
      };

      await expect(
        adminDailyChallengeService.createChallenge(payload)
      ).rejects.toThrow('tokens_reward debe ser un número positivo');
    });
  });

  describe('updateChallenge', () => {
    it('actualiza challenge existente', async () => {
      const mockChallenge = {
        id_challenge: 1,
        title: 'Título original',
        challenge_type: 'MINUTES',
        target_value: 30,
        update: jest.fn().mockResolvedValue(),
        reload: jest.fn().mockResolvedValue({
          id_challenge: 1,
          title: 'Título actualizado',
        }),
      };

      const payload = {
        title: 'Título actualizado',
        tokens_reward: 25,
      };

      mockDailyChallenge.findByPk.mockResolvedValue(mockChallenge);

      const result = await adminDailyChallengeService.updateChallenge(1, payload);

      expect(mockChallenge.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Título actualizado',
          tokens_reward: 25,
        })
      );
      expect(mockChallenge.reload).toHaveBeenCalled();
      expect(result.title).toBe('Título actualizado');
    });

    it('lanza error si challenge no existe', async () => {
      mockDailyChallenge.findByPk.mockResolvedValue(null);

      await expect(
        adminDailyChallengeService.updateChallenge(999, { title: 'Test' })
      ).rejects.toThrow('Desafío no encontrado');
    });

    it('actualiza challenge_date y valida duplicado', async () => {
      const mockChallenge = {
        id_challenge: 1,
        challenge_date: '2025-01-15',
        update: jest.fn().mockResolvedValue(),
        reload: jest.fn().mockResolvedValue({ id_challenge: 1 }),
      };

      mockDailyChallenge.findByPk.mockResolvedValue(mockChallenge);
      mockDailyChallenge.findOne.mockResolvedValue(null);

      await adminDailyChallengeService.updateChallenge(1, {
        challenge_date: '2025-01-20',
      });

      expect(mockDailyChallenge.findOne).toHaveBeenCalledWith({
        where: {
          challenge_date: '2025-01-20',
          id_challenge: { [mockOp.ne]: 1 },
        },
      });
    });

    it('lanza error si nueva fecha ya está ocupada', async () => {
      const mockChallenge = {
        id_challenge: 1,
        challenge_date: '2025-01-15',
      };

      mockDailyChallenge.findByPk.mockResolvedValue(mockChallenge);
      mockDailyChallenge.findOne.mockResolvedValue({ id_challenge: 2 });

      await expect(
        adminDailyChallengeService.updateChallenge(1, { challenge_date: '2025-01-20' })
      ).rejects.toThrow('Ya existe un desafío para la fecha indicada');
    });

    it('convierte is_active a boolean', async () => {
      const mockChallenge = {
        id_challenge: 1,
        update: jest.fn().mockResolvedValue(),
        reload: jest.fn().mockResolvedValue({ id_challenge: 1 }),
      };

      mockDailyChallenge.findByPk.mockResolvedValue(mockChallenge);

      await adminDailyChallengeService.updateChallenge(1, { is_active: 'true' });

      expect(mockChallenge.update).toHaveBeenCalledWith(
        expect.objectContaining({
          is_active: true,
        })
      );
    });
  });

  describe('deleteChallenge', () => {
    it('elimina challenge sin progreso de usuarios', async () => {
      const mockChallenge = {
        id_challenge: 1,
        destroy: jest.fn().mockResolvedValue(),
      };

      mockDailyChallenge.findByPk.mockResolvedValue(mockChallenge);
      mockUserDailyChallenge.count.mockResolvedValue(0);

      const result = await adminDailyChallengeService.deleteChallenge(1);

      expect(mockUserDailyChallenge.count).toHaveBeenCalledWith({
        where: { id_challenge: 1 },
      });
      expect(mockChallenge.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('lanza error si challenge no existe', async () => {
      mockDailyChallenge.findByPk.mockResolvedValue(null);

      await expect(adminDailyChallengeService.deleteChallenge(999)).rejects.toThrow(
        'Desafío no encontrado'
      );
    });

    it('lanza error si challenge tiene progreso de usuarios', async () => {
      const mockChallenge = {
        id_challenge: 1,
        destroy: jest.fn(),
      };

      mockDailyChallenge.findByPk.mockResolvedValue(mockChallenge);
      mockUserDailyChallenge.count.mockResolvedValue(5);

      await expect(adminDailyChallengeService.deleteChallenge(1)).rejects.toThrow(
        'El desafío tiene progreso de usuarios y no puede eliminarse'
      );

      expect(mockChallenge.destroy).not.toHaveBeenCalled();
    });
  });
});
