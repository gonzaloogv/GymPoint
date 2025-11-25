/**
 * Review Controller Tests - Lote 4
 */

jest.mock('../services/review-service');
jest.mock('../services/mappers', () => ({
  gymReviewMappers: {
    toListGymReviewsQuery: jest.fn(),
    toGetGymReviewQuery: jest.fn(),
    toCreateGymReviewCommand: jest.fn(),
    toUpdateGymReviewCommand: jest.fn(),
    toDeleteGymReviewCommand: jest.fn(),
    toMarkReviewHelpfulCommand: jest.fn(),
    toUnmarkReviewHelpfulCommand: jest.fn(),
    toGetGymRatingStatsQuery: jest.fn(),
    toGymReviewDTO: jest.fn(),
    toPaginatedGymReviewsDTO: jest.fn(),
    toGymRatingStatsDTO: jest.fn(),
  },
}));

const controller = require('../controllers/review-controller');
const service = require('../services/review-service');
const { gymReviewMappers } = require('../services/mappers');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('listGymReviews', () => {
  it('returns paginated reviews', async () => {
    const req = { params: { gymId: '1' }, query: { page: '1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    gymReviewMappers.toListGymReviewsQuery.mockReturnValue({ gymId: 1 });
    service.listGymReviews.mockResolvedValue({ items: [], total: 0 });
    gymReviewMappers.toPaginatedGymReviewsDTO.mockReturnValue({ items: [] });

    await controller.listGymReviews(req, res);

    expect(res.json).toHaveBeenCalledWith({ items: [] });
  });
});

describe('createGymReview', () => {
  it('creates review', async () => {
    const req = {
      params: { gymId: '1' },
      body: { rating: 5 },
      account: { userProfile: { id_user_profile: 2 } },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    gymReviewMappers.toCreateGymReviewCommand.mockReturnValue({ gymId: 1, userId: 2 });
    service.createGymReview.mockResolvedValue({ id_review: 1 });
    gymReviewMappers.toGymReviewDTO.mockReturnValue({ id_review: 1 });

    await controller.createGymReview(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 403 if no user profile', async () => {
    const req = { params: { gymId: '1' }, body: {}, account: null };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.createGymReview(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('getGymRatingStats', () => {
  it('returns stats', async () => {
    const req = { params: { gymId: '1' } };
    const res = { json: jest.fn() };

    gymReviewMappers.toGetGymRatingStatsQuery.mockReturnValue({ gymId: 1 });
    service.getGymRatingStats.mockResolvedValue({ avg_rating: 4.5 });
    gymReviewMappers.toGymRatingStatsDTO.mockReturnValue({ avg_rating: 4.5 });

    await controller.getGymRatingStats(req, res);

    expect(res.json).toHaveBeenCalledWith({ avg_rating: 4.5 });
  });
});
