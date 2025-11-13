/**
 * Review Service Tests - Lote 4 (Simplified for new architecture)
 */

jest.mock('../infra/db/repositories', () => ({
  gymReviewRepository: {
    findReviewsByGymId: jest.fn(),
    findReviewById: jest.fn(),
    findReviewByUserAndGym: jest.fn(),
    createReview: jest.fn(),
    upsertRatingStats: jest.fn(),
    findRatingStatsByGymId: jest.fn(),
  },
  gymRepository: { findGymById: jest.fn() },
  userProfileRepository: { findProfileById: jest.fn() },
  presenceRepository: { findPresencesByUser: jest.fn() },
}));

jest.mock('../services/token-ledger-service');
jest.mock('../config/database', () => ({ transaction: jest.fn() }));

const reviewService = require('../services/review-service');
const {
  gymReviewRepository,
  gymRepository,
  userProfileRepository,
  presenceRepository,
} = require('../infra/db/repositories');
const tokenLedgerService = require('../services/token-ledger-service');
const sequelize = require('../config/database');

const createTx = () => ({ commit: jest.fn(), rollback: jest.fn() });
let txs = [];

beforeEach(() => {
  jest.clearAllMocks();
  txs = [];
  sequelize.transaction.mockImplementation(async (fn) => {
    const tx = createTx();
    txs.push(tx);
    return fn ? fn(tx) : tx;
  });
});

describe('createGymReview', () => {
  const cmd = { gymId: 1, userId: 2, rating: 4.5, title: 'Great', comment: 'Nice' };

  it('creates review successfully', async () => {
    gymRepository.findGymById.mockResolvedValue({ id_gym: 1 });
    userProfileRepository.findProfileById.mockResolvedValue({ id_user_profile: 2 });
    presenceRepository.findPresencesByUser.mockResolvedValue({ items: [{}] });
    gymReviewRepository.findReviewByUserAndGym.mockResolvedValue(null);
    gymReviewRepository.createReview.mockResolvedValue({ id_review: 15, ...cmd });
    gymReviewRepository.findReviewsByGymId.mockResolvedValue({ items: [{ rating: 4.5, created_at: new Date() }] });

    await reviewService.createGymReview(cmd);

    expect(gymReviewRepository.createReview).toHaveBeenCalled();
    expect(gymReviewRepository.upsertRatingStats).toHaveBeenCalled();
    expect(txs[0].commit).toHaveBeenCalled();
  });

  it('throws if already reviewed', async () => {
    gymRepository.findGymById.mockResolvedValue({ id_gym: 1 });
    userProfileRepository.findProfileById.mockResolvedValue({ id_user_profile: 2 });
    presenceRepository.findPresencesByUser.mockResolvedValue({ items: [{}] });
    gymReviewRepository.findReviewByUserAndGym.mockResolvedValue({ id_review: 9 });

    await expect(reviewService.createGymReview(cmd)).rejects.toThrow('Ya has dejado una reseña');
  });
});

describe('getGymRatingStats', () => {
  it('returns stats', async () => {
    gymRepository.findGymById.mockResolvedValue({ id_gym: 1 });
    gymReviewRepository.findRatingStatsByGymId.mockResolvedValue({ avg_rating: 4.5 });

    const stats = await reviewService.getGymRatingStats({ gymId: 1 });
    expect(stats.avg_rating).toBe(4.5);
  });
});
