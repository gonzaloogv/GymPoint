/**
 * Tests para admin-review-service
 * Cubre: getAllReviews, getReviewStats, approveReview, deleteReview
 */

// Mock Models
const mockGymReview = {
  findByPk: jest.fn(),
  findAndCountAll: jest.fn(),
  count: jest.fn(),
  findOne: jest.fn(),
};

const mockUserProfile = {
  findByPk: jest.fn(),
};

const mockGym = {
  findByPk: jest.fn(),
};

const mockAccount = {
  findByPk: jest.fn(),
};

// Mock Sequelize operators and functions
const mockOp = {
  like: Symbol('like'),
  or: Symbol('or'),
};

const mockFn = jest.fn((arg1, arg2) => `fn(${arg1}, ${arg2})`);
const mockCol = jest.fn((arg) => `col(${arg})`);
const mockWhere = jest.fn((fn, condition) => ({ fn, condition }));
const mockLiteral = jest.fn((sql) => sql);

// Mock NotFoundError
const mockNotFoundError = class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
};

// Setup de mocks
jest.mock('../../../models', () => ({
  GymReview: mockGymReview,
  UserProfile: mockUserProfile,
  Gym: mockGym,
  Account: mockAccount,
}));

jest.mock('sequelize', () => ({
  Op: mockOp,
  fn: mockFn,
  col: mockCol,
  where: mockWhere,
  literal: mockLiteral,
}));

jest.mock('../../../utils/errors', () => ({
  NotFoundError: mockNotFoundError,
}));

const adminReviewService = require('../../../services/admin-review-service');

describe('admin-review-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllReviews', () => {
    it('obtiene reviews con paginación por defecto', async () => {
      const mockReviews = {
        count: 2,
        rows: [
          {
            id_review: 1,
            rating: 4.5,
            title: 'Excelente gym',
            comment: 'Muy buen equipamiento',
            is_verified: true,
            author: {
              id_user_profile: 1,
              name: 'Juan',
              lastname: 'Pérez',
              account: { email: 'juan@test.com' },
            },
            gym: { id_gym: 1, name: 'Gym Test', city: 'Madrid' },
            get: jest.fn().mockReturnThis(),
          },
          {
            id_review: 2,
            rating: 5.0,
            title: 'Perfecto',
            comment: 'Todo excelente',
            is_verified: true,
            author: {
              id_user_profile: 2,
              name: 'María',
              lastname: 'García',
              account: { email: 'maria@test.com' },
            },
            gym: { id_gym: 1, name: 'Gym Test', city: 'Madrid' },
            get: jest.fn().mockReturnThis(),
          },
        ],
      };

      mockGymReview.findAndCountAll.mockResolvedValue(mockReviews);

      const result = await adminReviewService.getAllReviews({});

      expect(result.total).toBe(2);
      expect(result.reviews).toHaveLength(2);
      expect(result.reviews[0].id_review).toBe(1);
      expect(result.reviews[0].user.email).toBe('juan@test.com');

      expect(mockGymReview.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        attributes: expect.any(Array),
        include: expect.any(Array),
        order: [['created_at', 'DESC']],
        limit: 20,
        offset: 0,
        distinct: true,
      });
    });

    it('filtra por is_approved', async () => {
      mockGymReview.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await adminReviewService.getAllReviews({ is_approved: true });

      expect(mockGymReview.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { is_verified: true },
        })
      );
    });

    it('filtra por is_approved false', async () => {
      mockGymReview.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await adminReviewService.getAllReviews({ is_approved: false });

      expect(mockGymReview.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { is_verified: false },
        })
      );
    });

    it('aplica searchTerm para búsqueda', async () => {
      mockGymReview.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await adminReviewService.getAllReviews({ searchTerm: 'excelente' });

      expect(mockGymReview.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            [mockOp.or]: expect.any(Array),
          },
        })
      );

      expect(mockFn).toHaveBeenCalledWith('LOWER', expect.anything());
      expect(mockCol).toHaveBeenCalled();
    });

    it('sanitiza sortBy inválido a created_at', async () => {
      mockGymReview.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await adminReviewService.getAllReviews({ sortBy: 'invalid_field' });

      expect(mockGymReview.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['created_at', 'DESC']],
        })
      );
    });

    it('permite sortBy rating', async () => {
      mockGymReview.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await adminReviewService.getAllReviews({ sortBy: 'rating' });

      expect(mockGymReview.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['rating', 'DESC']],
        })
      );
    });

    it('permite sortBy helpful_count', async () => {
      mockGymReview.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await adminReviewService.getAllReviews({ sortBy: 'helpful_count' });

      expect(mockGymReview.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['helpful_count', 'DESC']],
        })
      );
    });

    it('permite order ASC', async () => {
      mockGymReview.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await adminReviewService.getAllReviews({ order: 'ASC' });

      expect(mockGymReview.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['created_at', 'ASC']],
        })
      );
    });

    it('sanitiza order inválido a DESC', async () => {
      mockGymReview.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await adminReviewService.getAllReviews({ order: 'INVALID' });

      expect(mockGymReview.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['created_at', 'DESC']],
        })
      );
    });

    it('aplica limit personalizado', async () => {
      mockGymReview.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await adminReviewService.getAllReviews({ limit: 50 });

      expect(mockGymReview.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 50,
        })
      );
    });

    it('limita máximo a 100', async () => {
      mockGymReview.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await adminReviewService.getAllReviews({ limit: 500 });

      expect(mockGymReview.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 100,
        })
      );
    });

    it('sanitiza limit inválido a 20', async () => {
      mockGymReview.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await adminReviewService.getAllReviews({ limit: 'invalid' });

      expect(mockGymReview.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 20,
        })
      );
    });

    it('aplica offset personalizado', async () => {
      mockGymReview.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await adminReviewService.getAllReviews({ offset: 40 });

      expect(mockGymReview.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 40,
        })
      );
    });

    it('sanitiza offset negativo a 0', async () => {
      mockGymReview.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await adminReviewService.getAllReviews({ offset: -10 });

      expect(mockGymReview.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 0,
        })
      );
    });

    it('mapea review a DTO correctamente', async () => {
      const mockReviews = {
        count: 1,
        rows: [
          {
            id_review: 1,
            id_gym: 1,
            id_user_profile: 1,
            rating: 4.5,
            title: 'Buen gym',
            comment: 'Recomendado',
            cleanliness_rating: 5,
            equipment_rating: 4,
            staff_rating: 4,
            value_rating: 5,
            helpful_count: 3,
            reported: false,
            is_verified: true,
            created_at: '2025-01-15T10:00:00Z',
            updated_at: '2025-01-15T10:00:00Z',
            author: {
              id_user_profile: 1,
              name: 'Carlos',
              lastname: 'Ruiz',
              account: { email: 'carlos@test.com' },
            },
            gym: {
              id_gym: 1,
              name: 'Gym Madrid',
              city: 'Madrid',
            },
            get: jest.fn().mockReturnThis(),
          },
        ],
      };

      mockGymReview.findAndCountAll.mockResolvedValue(mockReviews);

      const result = await adminReviewService.getAllReviews({});

      expect(result.reviews[0]).toMatchObject({
        id_review: 1,
        id_gym: 1,
        id_user_profile: 1,
        rating: 4.5,
        title: 'Buen gym',
        comment: 'Recomendado',
        cleanliness_rating: 5,
        equipment_rating: 4,
        staff_rating: 4,
        value_rating: 5,
        helpful_count: 3,
        reported: false,
        is_approved: true,
        user: {
          id_user_profile: 1,
          name: 'Carlos Ruiz',
          email: 'carlos@test.com',
        },
        gym: {
          id_gym: 1,
          name: 'Gym Madrid',
          city: 'Madrid',
        },
      });
    });

    it('maneja review sin autor', async () => {
      const mockReviews = {
        count: 1,
        rows: [
          {
            id_review: 1,
            rating: 4.0,
            title: 'Review sin autor',
            author: null,
            gym: { id_gym: 1, name: 'Gym Test', city: 'Madrid' },
            get: jest.fn().mockReturnThis(),
          },
        ],
      };

      mockGymReview.findAndCountAll.mockResolvedValue(mockReviews);

      const result = await adminReviewService.getAllReviews({});

      expect(result.reviews[0].user).toBeNull();
    });

    it('maneja review sin gym', async () => {
      const mockReviews = {
        count: 1,
        rows: [
          {
            id_review: 1,
            rating: 4.0,
            title: 'Review sin gym',
            author: {
              id_user_profile: 1,
              name: 'Test',
              account: { email: 'test@test.com' },
            },
            gym: null,
            get: jest.fn().mockReturnThis(),
          },
        ],
      };

      mockGymReview.findAndCountAll.mockResolvedValue(mockReviews);

      const result = await adminReviewService.getAllReviews({});

      expect(result.reviews[0].gym).toBeNull();
    });
  });

  describe('getReviewStats', () => {
    it('retorna estadísticas completas cuando hay reviews', async () => {
      mockGymReview.count.mockResolvedValueOnce(100);

      mockGymReview.findOne.mockResolvedValue({
        avg_rating: 4.2,
        rating_5: 30,
        rating_4: 40,
        rating_3: 20,
        rating_2: 8,
        rating_1: 2,
      });

      mockGymReview.count.mockResolvedValueOnce(85);

      const result = await adminReviewService.getReviewStats();

      expect(result).toEqual({
        total_reviews: 100,
        avg_rating: 4.2,
        total_approved: 85,
        total_pending: 15,
        rating_distribution: {
          rating_5: 30,
          rating_4: 40,
          rating_3: 20,
          rating_2: 8,
          rating_1: 2,
        },
      });
    });

    it('retorna estadísticas en 0 cuando no hay reviews', async () => {
      mockGymReview.count.mockResolvedValue(0);

      const result = await adminReviewService.getReviewStats();

      expect(result).toEqual({
        total_reviews: 0,
        avg_rating: 0,
        total_approved: 0,
        total_pending: 0,
        rating_distribution: {
          rating_5: 0,
          rating_4: 0,
          rating_3: 0,
          rating_2: 0,
          rating_1: 0,
        },
      });

      expect(mockGymReview.findOne).not.toHaveBeenCalled();
    });

    it('calcula avg_rating correctamente', async () => {
      mockGymReview.count.mockResolvedValueOnce(50);

      mockGymReview.findOne.mockResolvedValue({
        avg_rating: '3.75',
        rating_5: 10,
        rating_4: 20,
        rating_3: 15,
        rating_2: 4,
        rating_1: 1,
      });

      mockGymReview.count.mockResolvedValueOnce(45);

      const result = await adminReviewService.getReviewStats();

      expect(result.avg_rating).toBe(3.75);
    });

    it('usa SQL aggregates para calcular distribución de ratings', async () => {
      mockGymReview.count.mockResolvedValueOnce(100);
      mockGymReview.findOne.mockResolvedValue({
        avg_rating: 4.0,
        rating_5: 25,
        rating_4: 35,
        rating_3: 20,
        rating_2: 15,
        rating_1: 5,
      });
      mockGymReview.count.mockResolvedValueOnce(80);

      await adminReviewService.getReviewStats();

      expect(mockGymReview.findOne).toHaveBeenCalledWith({
        attributes: expect.arrayContaining([
          expect.anything(),
        ]),
        raw: true,
      });

      expect(mockLiteral).toHaveBeenCalledWith(
        expect.stringContaining('FLOOR(rating)')
      );
    });
  });

  describe('approveReview', () => {
    it('aprueba review existente', async () => {
      const mockReview = {
        id_review: 1,
        is_verified: false,
        save: jest.fn().mockResolvedValue(),
        reload: jest.fn().mockResolvedValue({
          id_review: 1,
          is_verified: true,
          rating: 4.5,
          author: {
            id_user_profile: 1,
            name: 'Test',
            account: { email: 'test@test.com' },
          },
          gym: { id_gym: 1, name: 'Gym Test', city: 'Madrid' },
          get: jest.fn().mockReturnThis(),
        }),
      };

      mockGymReview.findByPk.mockResolvedValue(mockReview);

      const result = await adminReviewService.approveReview(1, true);

      expect(mockReview.is_verified).toBe(true);
      expect(mockReview.save).toHaveBeenCalled();
      expect(mockReview.reload).toHaveBeenCalled();
      expect(result.is_approved).toBe(true);
    });

    it('desaprueba review existente', async () => {
      const mockReview = {
        id_review: 1,
        is_verified: true,
        save: jest.fn().mockResolvedValue(),
        reload: jest.fn().mockResolvedValue({
          id_review: 1,
          is_verified: false,
          get: jest.fn().mockReturnThis(),
        }),
      };

      mockGymReview.findByPk.mockResolvedValue(mockReview);

      const result = await adminReviewService.approveReview(1, false);

      expect(mockReview.is_verified).toBe(false);
      expect(result.is_approved).toBe(false);
    });

    it('lanza NotFoundError si review no existe', async () => {
      mockGymReview.findByPk.mockResolvedValue(null);

      await expect(adminReviewService.approveReview(999, true)).rejects.toThrow(
        mockNotFoundError
      );

      await expect(adminReviewService.approveReview(999, true)).rejects.toThrow(
        'Reseña no encontrada'
      );
    });

    it('convierte is_approved a boolean', async () => {
      const mockReview = {
        id_review: 1,
        is_verified: false,
        save: jest.fn().mockResolvedValue(),
        reload: jest.fn().mockResolvedValue({
          id_review: 1,
          is_verified: true,
          get: jest.fn().mockReturnThis(),
        }),
      };

      mockGymReview.findByPk.mockResolvedValue(mockReview);

      await adminReviewService.approveReview(1, 'true');

      expect(mockReview.is_verified).toBe(true);
    });
  });

  describe('deleteReview', () => {
    it('elimina review existente', async () => {
      const mockReview = {
        id_review: 1,
        destroy: jest.fn().mockResolvedValue(),
      };

      mockGymReview.findByPk.mockResolvedValue(mockReview);

      await adminReviewService.deleteReview(1);

      expect(mockReview.destroy).toHaveBeenCalled();
    });

    it('lanza NotFoundError si review no existe', async () => {
      mockGymReview.findByPk.mockResolvedValue(null);

      await expect(adminReviewService.deleteReview(999)).rejects.toThrow(
        mockNotFoundError
      );

      await expect(adminReviewService.deleteReview(999)).rejects.toThrow(
        'Reseña no encontrada'
      );
    });
  });
});
