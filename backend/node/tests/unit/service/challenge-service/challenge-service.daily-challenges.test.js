/**
 * Tests para challenge-service - Daily Challenges CRUD
 * Cubre: getTodayChallenge, getChallengeById, listChallenges, createDailyChallenge, updateDailyChallenge
 */

const {
  mockDailyChallengeRepository,
  mockErrors,
  challengeService,
} = require('./test-setup');

describe('challenge-service daily challenges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error para tests de sincronización de logros
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('getTodayChallenge', () => {
    it('obtiene challenge de hoy con progreso del usuario', async () => {
      const today = new Date().toISOString().slice(0, 10);
      const mockChallenge = {
        id_challenge: 1,
        challenge_date: today,
        title: 'Entrena 30 minutos',
        challenge_type: 'MINUTES',
        target_value: 30,
      };

      const mockProgress = {
        id_user_challenge: 1,
        id_user_profile: 10,
        id_challenge: 1,
        current_value: 15,
        status: 'IN_PROGRESS',
      };

      mockDailyChallengeRepository.findByDate.mockResolvedValue(mockChallenge);
      mockDailyChallengeRepository.findUserProgress.mockResolvedValue(mockProgress);

      const result = await challengeService.getTodayChallenge({ idUserProfile: 10 });

      expect(mockDailyChallengeRepository.findByDate).toHaveBeenCalledWith(
        today,
        { includeTemplate: true }
      );
      expect(mockDailyChallengeRepository.findUserProgress).toHaveBeenCalledWith(10, 1);
      expect(result).toEqual({
        challenge: mockChallenge,
        progress: mockProgress,
      });
    });

    it('acepta idUserProfile como número directo', async () => {
      const today = new Date().toISOString().slice(0, 10);
      mockDailyChallengeRepository.findByDate.mockResolvedValue({
        id_challenge: 1,
        challenge_date: today,
      });
      mockDailyChallengeRepository.findUserProgress.mockResolvedValue(null);

      await challengeService.getTodayChallenge(10);

      expect(mockDailyChallengeRepository.findUserProgress).toHaveBeenCalledWith(10, 1);
    });

    it('retorna null si no hay challenge para hoy', async () => {
      const today = new Date().toISOString().slice(0, 10);
      mockDailyChallengeRepository.findByDate.mockResolvedValue(null);

      const result = await challengeService.getTodayChallenge({ idUserProfile: 10 });

      expect(result).toBeNull();
      expect(mockDailyChallengeRepository.findUserProgress).not.toHaveBeenCalled();
    });

    it('retorna challenge sin progreso si usuario no lo ha iniciado', async () => {
      const today = new Date().toISOString().slice(0, 10);
      const mockChallenge = {
        id_challenge: 1,
        challenge_date: today,
      };

      mockDailyChallengeRepository.findByDate.mockResolvedValue(mockChallenge);
      mockDailyChallengeRepository.findUserProgress.mockResolvedValue(null);

      const result = await challengeService.getTodayChallenge({ idUserProfile: 10 });

      expect(result).toEqual({
        challenge: mockChallenge,
        progress: null,
      });
    });
  });

  describe('getChallengeById', () => {
    it('obtiene challenge por ID', async () => {
      const mockChallenge = {
        id_challenge: 1,
        title: 'Entrena 30 minutos',
        challenge_type: 'MINUTES',
        target_value: 30,
      };

      mockDailyChallengeRepository.findById.mockResolvedValue(mockChallenge);

      const result = await challengeService.getChallengeById({ idChallenge: 1 });

      expect(mockDailyChallengeRepository.findById).toHaveBeenCalledWith(1, {
        includeTemplate: true,
      });
      expect(result).toEqual(mockChallenge);
    });

    it('acepta idChallenge como número directo', async () => {
      mockDailyChallengeRepository.findById.mockResolvedValue({
        id_challenge: 1,
      });

      await challengeService.getChallengeById(1);

      expect(mockDailyChallengeRepository.findById).toHaveBeenCalledWith(1, {
        includeTemplate: true,
      });
    });

    it('lanza NotFoundError si challenge no existe', async () => {
      mockDailyChallengeRepository.findById.mockResolvedValue(null);

      await expect(challengeService.getChallengeById({ idChallenge: 999 })).rejects.toThrow(
        mockErrors.NotFoundError
      );
      await expect(challengeService.getChallengeById({ idChallenge: 999 })).rejects.toThrow(
        'Desafío'
      );
    });
  });

  describe('listChallenges', () => {
    it('lista challenges con valores por defecto', async () => {
      const mockChallenges = [
        { id_challenge: 1, title: 'Challenge 1' },
        { id_challenge: 2, title: 'Challenge 2' },
      ];

      mockDailyChallengeRepository.findAll.mockResolvedValue({
        rows: mockChallenges,
        count: 2,
      });

      const result = await challengeService.listChallenges({});

      expect(mockDailyChallengeRepository.findAll).toHaveBeenCalledWith({
        filters: {
          startDate: null,
          endDate: null,
          challengeType: null,
          difficulty: null,
          isActive: null,
        },
        pagination: {
          limit: 20,
          offset: 0,
        },
        sort: {
          field: 'challenge_date',
          direction: 'DESC',
        },
      });

      expect(result).toEqual({
        items: mockChallenges,
        total: 2,
        page: 1,
        limit: 20,
      });
    });

    it('aplica filtros personalizados', async () => {
      mockDailyChallengeRepository.findAll.mockResolvedValue({
        rows: [],
        count: 0,
      });

      await challengeService.listChallenges({
        page: 2,
        limit: 10,
        sortBy: 'difficulty',
        order: 'ASC',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        challengeType: 'MINUTES',
        difficulty: 'HARD',
        isActive: true,
      });

      expect(mockDailyChallengeRepository.findAll).toHaveBeenCalledWith({
        filters: {
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          challengeType: 'MINUTES',
          difficulty: 'HARD',
          isActive: true,
        },
        pagination: {
          limit: 10,
          offset: 10,
        },
        sort: {
          field: 'difficulty',
          direction: 'ASC',
        },
      });
    });

    it('maneja isActive como null cuando no se especifica', async () => {
      mockDailyChallengeRepository.findAll.mockResolvedValue({
        rows: [],
        count: 0,
      });

      await challengeService.listChallenges({ isActive: null });

      expect(mockDailyChallengeRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            isActive: null,
          }),
        })
      );
    });
  });

  describe('createDailyChallenge', () => {
    it('crea challenge exitosamente', async () => {
      const command = {
        challengeDate: '2025-01-20',
        title: 'Entrena 30 minutos',
        description: 'Completa 30 minutos de ejercicio',
        challengeType: 'MINUTES',
        targetValue: 30,
        targetUnit: 'minutos',
        tokensReward: 20,
        difficulty: 'MEDIUM',
        idTemplate: 1,
      };

      mockDailyChallengeRepository.findByDate.mockResolvedValue(null);
      mockDailyChallengeRepository.create.mockResolvedValue({
        id_challenge: 1,
        challenge_date: '2025-01-20',
        title: 'Entrena 30 minutos',
      });

      const result = await challengeService.createDailyChallenge(command);

      expect(mockDailyChallengeRepository.findByDate).toHaveBeenCalledWith('2025-01-20');
      expect(mockDailyChallengeRepository.create).toHaveBeenCalledWith({
        challenge_date: '2025-01-20',
        title: 'Entrena 30 minutos',
        description: 'Completa 30 minutos de ejercicio',
        challenge_type: 'MINUTES',
        target_value: 30,
        target_unit: 'minutos',
        tokens_reward: 20,
        difficulty: 'MEDIUM',
        id_template: 1,
        is_active: true,
      });

      expect(result.id_challenge).toBe(1);
    });

    it('usa valores por defecto para campos opcionales', async () => {
      const command = {
        challengeDate: '2025-01-20',
        title: 'Challenge mínimo',
        challengeType: 'EXERCISES',
        targetValue: 10,
      };

      mockDailyChallengeRepository.findByDate.mockResolvedValue(null);
      mockDailyChallengeRepository.create.mockResolvedValue({ id_challenge: 1 });

      await challengeService.createDailyChallenge(command);

      expect(mockDailyChallengeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tokens_reward: 10, // Default
          difficulty: 'MEDIUM', // Default
          id_template: null, // Default
        })
      );
    });

    it('lanza BusinessError si ya existe challenge para esa fecha', async () => {
      const command = {
        challengeDate: '2025-01-20',
        title: 'Challenge duplicado',
        challengeType: 'MINUTES',
        targetValue: 30,
      };

      mockDailyChallengeRepository.findByDate.mockResolvedValue({
        id_challenge: 1,
        challenge_date: '2025-01-20',
      });

      await expect(challengeService.createDailyChallenge(command)).rejects.toThrow(
        mockErrors.BusinessError
      );
      await expect(challengeService.createDailyChallenge(command)).rejects.toThrow(
        'Ya existe un desafío para esta fecha'
      );

      expect(mockDailyChallengeRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateDailyChallenge', () => {
    it('actualiza challenge existente', async () => {
      const command = {
        idChallenge: 1,
        title: 'Título actualizado',
        description: 'Descripción actualizada',
        tokensReward: 25,
        difficulty: 'HARD',
        isActive: false,
      };

      mockDailyChallengeRepository.findById.mockResolvedValue({
        id_challenge: 1,
        title: 'Título original',
      });
      mockDailyChallengeRepository.update.mockResolvedValue({
        id_challenge: 1,
        title: 'Título actualizado',
      });

      const result = await challengeService.updateDailyChallenge(command);

      expect(mockDailyChallengeRepository.findById).toHaveBeenCalledWith(1);
      expect(mockDailyChallengeRepository.update).toHaveBeenCalledWith(1, {
        title: 'Título actualizado',
        description: 'Descripción actualizada',
        tokens_reward: 25,
        difficulty: 'HARD',
        is_active: false,
      });

      expect(result.title).toBe('Título actualizado');
    });

    it('actualiza solo campos especificados', async () => {
      const command = {
        idChallenge: 1,
        tokensReward: 30,
      };

      mockDailyChallengeRepository.findById.mockResolvedValue({
        id_challenge: 1,
      });
      mockDailyChallengeRepository.update.mockResolvedValue({
        id_challenge: 1,
      });

      await challengeService.updateDailyChallenge(command);

      expect(mockDailyChallengeRepository.update).toHaveBeenCalledWith(1, {
        tokens_reward: 30,
      });
    });

    it('lanza NotFoundError si challenge no existe', async () => {
      const command = {
        idChallenge: 999,
        title: 'Nuevo título',
      };

      mockDailyChallengeRepository.findById.mockResolvedValue(null);

      await expect(challengeService.updateDailyChallenge(command)).rejects.toThrow(
        mockErrors.NotFoundError
      );
      await expect(challengeService.updateDailyChallenge(command)).rejects.toThrow('Desafío');

      expect(mockDailyChallengeRepository.update).not.toHaveBeenCalled();
    });

    it('permite actualizar todos los campos', async () => {
      const command = {
        idChallenge: 1,
        title: 'Nuevo título',
        description: 'Nueva descripción',
        challengeType: 'EXERCISES',
        targetValue: 50,
        targetUnit: 'ejercicios',
        tokensReward: 25,
        difficulty: 'EASY',
        isActive: true,
      };

      mockDailyChallengeRepository.findById.mockResolvedValue({ id_challenge: 1 });
      mockDailyChallengeRepository.update.mockResolvedValue({ id_challenge: 1 });

      await challengeService.updateDailyChallenge(command);

      expect(mockDailyChallengeRepository.update).toHaveBeenCalledWith(1, {
        title: 'Nuevo título',
        description: 'Nueva descripción',
        challenge_type: 'EXERCISES',
        target_value: 50,
        target_unit: 'ejercicios',
        tokens_reward: 25,
        difficulty: 'EASY',
        is_active: true,
      });
    });
  });
});
