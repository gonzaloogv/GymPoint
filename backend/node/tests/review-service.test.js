jest.mock('../models', () => ({
  Gym: { findByPk: jest.fn() },
  GymReview: {
    findAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn()
  },
  GymRatingStats: { upsert: jest.fn(), findByPk: jest.fn() },
  ReviewHelpful: {
    findOrCreate: jest.fn(),
    destroy: jest.fn()
  },
  Assistance: { findOne: jest.fn() },
  UserProfile: { findByPk: jest.fn() }
}));
jest.mock('../services/token-ledger-service', () => ({
  registrarMovimiento: jest.fn()
}));
jest.mock('../config/constants', () => ({
  TOKENS: {
    REVIEW: 10
  },
  TOKEN_REASONS: {
    REVIEW_SUBMITTED: 'REVIEW_SUBMITTED'
  }
}));
jest.mock('../config/database', () => ({
  transaction: jest.fn()
}));
const sequelize = require('../config/database');
const reviewService = require('../services/review-service');
const tokenLedgerService = require('../services/token-ledger-service');
const {
  Gym,
  GymReview,
  GymRatingStats,
  ReviewHelpful,
  Assistance,
  UserProfile
} = require('../models');
const { ConflictError } = require('../utils/errors');
const createTransactionMock = () => ({
  commit: jest.fn(),
  rollback: jest.fn()
});
let transactions;
beforeEach(() => {
  jest.clearAllMocks();
  transactions = [];
  sequelize.transaction.mockImplementation(async (arg) => {
    const tx = createTransactionMock();
    transactions.push(tx);
    if (typeof arg === 'function') {
      return arg(tx);
    }
    return tx;
  });
});
describe('review-service.crearReview', () => {
  const payload = {
    id_gym: 1,
    id_user_profile: 2,
    rating: 4.5,
    cleanliness_rating: 4,
    equipment_rating: 5,
    staff_rating: 4,
    value_rating: 4,
    comment: 'Genial'
  };
  it('crea review, recalcula stats y otorga tokens', async () => {
    Gym.findByPk.mockResolvedValue({ id_gym: 1 });
    UserProfile.findByPk.mockResolvedValue({ id_user_profile: 2 });
    Assistance.findOne.mockResolvedValue({ id_assistance: 10 });
    GymReview.findOne.mockResolvedValue(null);
    GymReview.create.mockResolvedValue({ id_review: 15, ...payload });
    GymReview.findAll.mockResolvedValue([
      {
        total_reviews: 1,
        avg_rating: 4.5,
        rating_5_count: 0,
        rating_4_count: 1,
        rating_3_count: 0,
        rating_2_count: 0,
        rating_1_count: 0,
        avg_cleanliness: 4,
        avg_equipment: 5,
        avg_staff: 4,
        avg_value: 4,
        last_review_date: new Date()
      }
    ]);
    GymRatingStats.upsert.mockResolvedValue();
    tokenLedgerService.registrarMovimiento.mockResolvedValue({});
    const review = await reviewService.crearReview(payload);
    expect(review).toEqual(expect.objectContaining({ id_review: 15, id_gym: 1, id_user_profile: 2 }));
    expect(GymReview.create).toHaveBeenCalledWith(expect.objectContaining(payload), { transaction: expect.any(Object) });
    expect(GymRatingStats.upsert).toHaveBeenCalled();
    expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalledWith(expect.objectContaining({
      userId: 2,
      delta: 10,
      reason: 'REVIEW_SUBMITTED',
      refType: 'gym_review',
      refId: 15
    }));
    expect(transactions[0].commit).toHaveBeenCalled();
  });
  it('lanza conflicto si el usuario ya reseñó el gym', async () => {
    Gym.findByPk.mockResolvedValue({ id_gym: 1 });
    UserProfile.findByPk.mockResolvedValue({ id_user_profile: 2 });
    Assistance.findOne.mockResolvedValue({ id_assistance: 10 });
    GymReview.findOne.mockResolvedValue({ id_review: 9 });
    await expect(reviewService.crearReview(payload)).rejects.toBeInstanceOf(ConflictError);
    expect(transactions[0].rollback).toHaveBeenCalled();
  });
});
describe('review-service.obtenerStatsPorGym', () => {
  it('retorna stats existentes', async () => {
    Gym.findByPk.mockResolvedValue({ id_gym: 3 });
    GymRatingStats.findByPk.mockResolvedValue({
      toJSON: () => ({ id_gym: 3, avg_rating: 4.2, total_reviews: 10 })
    });
    const stats = await reviewService.obtenerStatsPorGym(3);
    expect(stats).toEqual({ id_gym: 3, avg_rating: 4.2, total_reviews: 10 });
  });
  it('retorna stats por defecto si no hay registros', async () => {
    Gym.findByPk.mockResolvedValue({ id_gym: 4 });
    GymRatingStats.findByPk.mockResolvedValue(null);
    const stats = await reviewService.obtenerStatsPorGym(4);
    expect(stats).toEqual(expect.objectContaining({
      id_gym: 4,
      avg_rating: 0,
      total_reviews: 0
    }));
  });
});