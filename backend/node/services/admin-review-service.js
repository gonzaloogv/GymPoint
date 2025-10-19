
const { Op } = require('sequelize');
const { GymReview, UserProfile, Gym, Account } = require('../models');
const { NotFoundError } = require('../utils/errors');

const getReviewById = async (id_review) => {
  const review = await GymReview.findByPk(id_review);
  if (!review) {
    throw new NotFoundError('Reseña no encontrada');
  }
  return review;
};

const getAllReviews = async ({ limit = 20, offset = 0, is_approved, sortBy = 'created_at', order = 'DESC' }) => {
  const where = {};
  if (is_approved !== undefined) {
    where.is_approved = is_approved;
  }

  const reviews = await GymReview.findAndCountAll({
    where,
    include: [
      {
        model: UserProfile,
        as: 'user',
        attributes: ['id_user_profile', 'name', 'lastname'],
        include: [{
          model: Account,
          as: 'account',
          attributes: ['email']
        }]
      },
      {
        model: Gym,
        as: 'gym',
        attributes: ['id_gym', 'name']
      }
    ],
    order: [[sortBy, order]],
    limit,
    offset
  });

  return {
    total: reviews.count,
    reviews: reviews.rows
  };
};

const getReviewStats = async () => {
  const total_reviews = await GymReview.count();
  const pending_reviews = await GymReview.count({ where: { is_approved: false } });
  const approved_reviews = await GymReview.count({ where: { is_approved: true } });

  const five_stars = await GymReview.count({ where: { rating: { [Op.gte]: 4.5 } } });
  const one_stars = await GymReview.count({ where: { rating: { [Op.lte]: 1.5 } } });

  return {
    total_reviews,
    pending_reviews,
    approved_reviews,
    five_stars,
    one_stars
  };
};

const approveReview = async (id_review, is_approved) => {
  const review = await getReviewById(id_review);
  review.is_approved = is_approved;
  await review.save();
  return review;
};

const deleteReview = async (id_review) => {
  const review = await getReviewById(id_review);
  await review.destroy();
};

module.exports = {
  getAllReviews,
  getReviewStats,
  approveReview,
  deleteReview
};
