const Joi = require('joi');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');
const {
  Gym,
  GymReview,
  GymRatingStats,
  ReviewHelpful,
  Assistance,
  UserProfile
} = require('../models');
const {
  ValidationError,
  NotFoundError,
  ConflictError,
  BusinessError
} = require('../utils/errors');
const tokenLedgerService = require('./token-ledger-service');
const { TOKENS, TOKEN_REASONS } = require('../config/constants');

const REVIEW_TOKENS = Number.isFinite(TOKENS.REVIEW) ? TOKENS.REVIEW : 0;
const REVIEW_TOKEN_REASON = TOKEN_REASONS.REVIEW_SUBMITTED || 'REVIEW_SUBMITTED';

const reviewSchema = Joi.object({
  id_gym: Joi.number().integer().positive().required(),
  id_user_profile: Joi.number().integer().positive().required(),
  rating: Joi.number().min(1).max(5).precision(1).required(),
  title: Joi.string().max(100).allow('', null),
  comment: Joi.string().max(2000).allow('', null),
  cleanliness_rating: Joi.number().integer().min(1).max(5).allow(null),
  equipment_rating: Joi.number().integer().min(1).max(5).allow(null),
  staff_rating: Joi.number().integer().min(1).max(5).allow(null),
  value_rating: Joi.number().integer().min(1).max(5).allow(null)
});

const updateSchema = Joi.object({
  rating: Joi.number().min(1).max(5).precision(1),
  title: Joi.string().max(100).allow('', null),
  comment: Joi.string().max(2000).allow('', null),
  cleanliness_rating: Joi.number().integer().min(1).max(5).allow(null),
  equipment_rating: Joi.number().integer().min(1).max(5).allow(null),
  staff_rating: Joi.number().integer().min(1).max(5).allow(null),
  value_rating: Joi.number().integer().min(1).max(5).allow(null),
  reported: Joi.boolean()
}).min(1);

const ensureGymExists = async (id_gym, transaction) => {
  const gym = await Gym.findByPk(id_gym, {
    attributes: ['id_gym'],
    transaction
  });

  if (!gym) {
    throw new NotFoundError('Gimnasio');
  }
};

const ensureUserProfileExists = async (id_user_profile, transaction) => {
  const profile = await UserProfile.findByPk(id_user_profile, {
    attributes: ['id_user_profile'],
    transaction
  });

  if (!profile) {
    throw new NotFoundError('Usuario');
  }
};

const ensureUserCanReview = async (id_user_profile, id_gym, transaction) => {
  const asistencia = await Assistance.findOne({
    where: {
      id_user: id_user_profile,
      id_gym
    },
    attributes: ['id_assistance'],
    transaction
  });

  if (!asistencia) {
    throw new BusinessError(
      'Debes haber asistido al gimnasio antes de dejar una reseña',
      'REVIEW_REQUIRES_ASSISTANCE'
    );
  }
};

const validateReviewPayload = (payload) => {
  const { error, value } = reviewSchema.validate(payload, { abortEarly: false });
  if (error) {
    throw new ValidationError(
      'Datos de reseña inválidos',
      error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    );
  }
  return value;
};

const validateUpdatePayload = (payload) => {
  const { error, value } = updateSchema.validate(payload, { abortEarly: false });
  if (error) {
    throw new ValidationError(
      'Datos de actualización inválidos',
      error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    );
  }
  return value;
};

const recalculateStats = async (id_gym, transaction) => {
  const [rawStats] = await GymReview.findAll({
    where: { id_gym },
    attributes: [
      [fn('COUNT', col('id_review')), 'total_reviews'],
      [fn('AVG', col('rating')), 'avg_rating'],
      [literal('SUM(CASE WHEN ROUND(rating) = 5 THEN 1 ELSE 0 END)'), 'rating_5_count'],
      [literal('SUM(CASE WHEN ROUND(rating) = 4 THEN 1 ELSE 0 END)'), 'rating_4_count'],
      [literal('SUM(CASE WHEN ROUND(rating) = 3 THEN 1 ELSE 0 END)'), 'rating_3_count'],
      [literal('SUM(CASE WHEN ROUND(rating) = 2 THEN 1 ELSE 0 END)'), 'rating_2_count'],
      [literal('SUM(CASE WHEN ROUND(rating) = 1 THEN 1 ELSE 0 END)'), 'rating_1_count'],
      [fn('AVG', col('cleanliness_rating')), 'avg_cleanliness'],
      [fn('AVG', col('equipment_rating')), 'avg_equipment'],
      [fn('AVG', col('staff_rating')), 'avg_staff'],
      [fn('AVG', col('value_rating')), 'avg_value'],
      [fn('MAX', col('created_at')), 'last_review_date']
    ],
    raw: true,
    transaction
  });

  const stats = {
    id_gym,
    avg_rating: Number(rawStats?.avg_rating || 0).toFixed(2),
    total_reviews: parseInt(rawStats?.total_reviews || 0, 10),
    rating_5_count: parseInt(rawStats?.rating_5_count || 0, 10),
    rating_4_count: parseInt(rawStats?.rating_4_count || 0, 10),
    rating_3_count: parseInt(rawStats?.rating_3_count || 0, 10),
    rating_2_count: parseInt(rawStats?.rating_2_count || 0, 10),
    rating_1_count: parseInt(rawStats?.rating_1_count || 0, 10),
    avg_cleanliness: Number(rawStats?.avg_cleanliness || 0).toFixed(2),
    avg_equipment: Number(rawStats?.avg_equipment || 0).toFixed(2),
    avg_staff: Number(rawStats?.avg_staff || 0).toFixed(2),
    avg_value: Number(rawStats?.avg_value || 0).toFixed(2),
    last_review_date: rawStats?.last_review_date || null,
    updated_at: new Date()
  };

  if (stats.total_reviews === 0) {
    stats.avg_rating = 0;
    stats.avg_cleanliness = 0;
    stats.avg_equipment = 0;
    stats.avg_staff = 0;
    stats.avg_value = 0;
    stats.last_review_date = null;
  }

  await GymRatingStats.upsert(stats, { transaction });
  return stats;
};

const listarReviewsPorGym = async (id_gym, { limit = 20, offset = 0 } = {}) => {
  await ensureGymExists(id_gym);

  return GymReview.findAll({
    where: { id_gym },
    include: [
      {
        model: UserProfile,
        as: 'author',
        attributes: ['id_user_profile', 'name', 'lastname', 'subscription']
      }
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset
  });
};

const crearReview = async (payload) => {
  const data = validateReviewPayload(payload);

  const transaction = await sequelize.transaction();
  try {
    await ensureGymExists(data.id_gym, transaction);
    await ensureUserProfileExists(data.id_user_profile, transaction);
    await ensureUserCanReview(data.id_user_profile, data.id_gym, transaction);

    const existing = await GymReview.findOne({
      where: {
        id_gym: data.id_gym,
        id_user_profile: data.id_user_profile
      },
      transaction
    });

    if (existing) {
      throw new ConflictError('Ya has dejado una reseña para este gimnasio');
    }

    const review = await GymReview.create(data, { transaction });

    await recalculateStats(data.id_gym, transaction);

    if (REVIEW_TOKENS > 0) {
      await tokenLedgerService.registrarMovimiento({
        userId: data.id_user_profile,
        delta: REVIEW_TOKENS,
        reason: REVIEW_TOKEN_REASON,
        refType: 'gym_review',
        refId: review.id_review,
        transaction
      });
    }

    await transaction.commit();
    return review;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const actualizarReview = async (id_review, payload, { id_user_profile, isAdmin = false } = {}) => {
  const data = validateUpdatePayload(payload);

  const review = await GymReview.findByPk(id_review);
  if (!review) {
    throw new NotFoundError('Reseña');
  }

  if (!isAdmin && review.id_user_profile !== id_user_profile) {
    throw new BusinessError('No puedes actualizar reseñas de otros usuarios', 'REVIEW_FORBIDDEN');
  }

  Object.assign(review, data);
  await review.save();

  await recalculateStats(review.id_gym);

  return review;
};

const eliminarReview = async (id_review, { id_user_profile, isAdmin = false } = {}) => {
  const review = await GymReview.findByPk(id_review);
  if (!review) {
    throw new NotFoundError('Reseña');
  }

  if (!isAdmin && review.id_user_profile !== id_user_profile) {
    throw new BusinessError('No puedes eliminar reseñas de otros usuarios', 'REVIEW_FORBIDDEN');
  }

  await review.destroy();
  await recalculateStats(review.id_gym);

  return true;
};

const marcarReviewUtil = async (id_review, id_user_profile) => {
  const transaction = await sequelize.transaction();
  try {
    const review = await GymReview.findByPk(id_review, { transaction });
    if (!review) {
      throw new NotFoundError('Reseña');
    }

    if (review.id_user_profile === id_user_profile) {
      throw new BusinessError('No puedes marcar tu propia reseña como útil', 'REVIEW_SELF_HELPFUL');
    }

    const [, created] = await ReviewHelpful.findOrCreate({
      where: {
        id_review,
        id_user_profile
      },
      defaults: { id_review, id_user_profile },
      transaction
    });

    if (!created) {
      throw new ConflictError('Ya marcaste esta reseña como útil');
    }

    await review.increment('helpful_count', { by: 1, transaction });

    await transaction.commit();
    return review.reload({ transaction: null });
  } catch (error) {
    await transaction.rollback();
    if (error instanceof ConflictError) {
      throw error;
    }
    throw error;
  }
};

const removerReviewUtil = async (id_review, id_user_profile) => {
  const transaction = await sequelize.transaction();
  try {
    const review = await GymReview.findByPk(id_review, { transaction });
    if (!review) {
      throw new NotFoundError('Reseña');
    }

    const deleted = await ReviewHelpful.destroy({
      where: {
        id_review,
        id_user_profile
      },
      transaction
    });

    if (deleted && review.helpful_count > 0) {
      await review.decrement('helpful_count', { by: 1, transaction });
    }

    await transaction.commit();
    return deleted > 0;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const obtenerStatsPorGym = async (id_gym) => {
  await ensureGymExists(id_gym);

  const stats = await GymRatingStats.findByPk(id_gym);
  if (!stats) {
    return {
      id_gym,
      avg_rating: 0,
      total_reviews: 0,
      rating_5_count: 0,
      rating_4_count: 0,
      rating_3_count: 0,
      rating_2_count: 0,
      rating_1_count: 0,
      avg_cleanliness: 0,
      avg_equipment: 0,
      avg_staff: 0,
      avg_value: 0,
      last_review_date: null,
      updated_at: null
    };
  }

  return stats.toJSON();
};

module.exports = {
  listarReviewsPorGym,
  crearReview,
  actualizarReview,
  eliminarReview,
  marcarReviewUtil,
  removerReviewUtil,
  recalculateStats,
  obtenerStatsPorGym
};
