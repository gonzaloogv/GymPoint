const { Op, fn, col, where, literal } = require('sequelize');
const { GymReview, UserProfile, Gym, Account } = require('../models');
const { NotFoundError } = require('../utils/errors');

const ALLOWED_SORT_FIELDS = new Set(['created_at', 'rating', 'helpful_count']);
const DEFAULT_SORT_FIELD = 'created_at';
const DEFAULT_ORDER = 'DESC';
const MAX_LIMIT = 100;

const REVIEW_ATTRIBUTES = [
  'id_review',
  'id_gym',
  'id_user_profile',
  'rating',
  'title',
  'comment',
  'cleanliness_rating',
  'equipment_rating',
  'staff_rating',
  'value_rating',
  'helpful_count',
  'reported',
  'is_verified',
  'created_at',
  'updated_at'
];

const REVIEW_INCLUDE = [
  {
    model: UserProfile,
    as: 'author',
    attributes: ['id_user_profile', 'name', 'lastname'],
    include: [
      {
        model: Account,
        as: 'account',
        attributes: ['email']
      }
    ]
  },
  {
    model: Gym,
    as: 'gym',
    attributes: ['id_gym', 'name', 'city']
  }
];

const sanitizeSortField = (value) => {
  if (typeof value !== 'string') {
    return DEFAULT_SORT_FIELD;
  }
  return ALLOWED_SORT_FIELDS.has(value) ? value : DEFAULT_SORT_FIELD;
};

const sanitizeOrder = (value) => {
  if (typeof value !== 'string') {
    return DEFAULT_ORDER;
  }
  return value.toUpperCase() === 'ASC' ? 'ASC' : DEFAULT_ORDER;
};

const sanitizeLimit = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 20;
  }
  return parsed > MAX_LIMIT ? MAX_LIMIT : parsed;
};

const sanitizeOffset = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
};

const mapReviewToDTO = (reviewInstance) => {
  if (!reviewInstance) return null;

  const review = reviewInstance.get ? reviewInstance.get({ plain: true }) : reviewInstance;

  const rating = review.rating !== undefined && review.rating !== null
    ? Number.parseFloat(review.rating)
    : null;

  const userData = review.author
    ? {
        id_user_profile: review.author.id_user_profile,
        name: [review.author.name, review.author.lastname].filter(Boolean).join(' ').trim() || review.author.name,
        email: review.author.account ? review.author.account.email : null
      }
    : null;

  const gymData = review.gym
    ? {
        id_gym: review.gym.id_gym,
        name: review.gym.name,
        city: review.gym.city
      }
    : null;

  return {
    id_review: review.id_review,
    id_gym: review.id_gym,
    id_user_profile: review.id_user_profile,
    rating,
    title: review.title,
    comment: review.comment,
    cleanliness_rating: review.cleanliness_rating,
    equipment_rating: review.equipment_rating,
    staff_rating: review.staff_rating,
    value_rating: review.value_rating,
    helpful_count: review.helpful_count,
    reported: review.reported,
    is_approved: Boolean(review.is_verified),
    review_date: review.created_at,
    created_at: review.created_at,
    updated_at: review.updated_at,
    user: userData,
    gym: gymData
  };
};

const getReviewById = async (id_review) => {
  const review = await GymReview.findByPk(id_review);
  if (!review) {
    throw new NotFoundError('Reseña no encontrada');
  }
  return review;
};

const buildSearchConditions = (searchTerm) => {
  if (!searchTerm) {
    return [];
  }

  const normalized = searchTerm.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const likeTerm = `%${normalized}%`;
  return [
    where(fn('LOWER', col('GymReview.comment')), { [Op.like]: likeTerm }),
    where(fn('LOWER', col('GymReview.title')), { [Op.like]: likeTerm }),
    where(fn('LOWER', col('author.name')), { [Op.like]: likeTerm }),
    where(fn('LOWER', col('author.lastname')), { [Op.like]: likeTerm }),
    where(fn('LOWER', col('author->account.email')), { [Op.like]: likeTerm }),
    where(fn('LOWER', col('gym.name')), { [Op.like]: likeTerm })
  ];
};

const getAllReviews = async ({
  limit = 20,
  offset = 0,
  is_approved,
  sortBy = DEFAULT_SORT_FIELD,
  order = DEFAULT_ORDER,
  searchTerm
} = {}) => {
  const whereClause = {};
  if (typeof is_approved === 'boolean') {
    whereClause.is_verified = is_approved;
  }

  const searchConditions = buildSearchConditions(searchTerm);
  if (searchConditions.length > 0) {
    whereClause[Op.or] = searchConditions;
  }

  const reviews = await GymReview.findAndCountAll({
    where: whereClause,
    attributes: REVIEW_ATTRIBUTES,
    include: REVIEW_INCLUDE,
    order: [[sanitizeSortField(sortBy), sanitizeOrder(order)]],
    limit: sanitizeLimit(limit),
    offset: sanitizeOffset(offset),
    distinct: true
  });

  return {
    total: reviews.count,
    reviews: reviews.rows.map(mapReviewToDTO)
  };
};

const getReviewStats = async () => {
  const total_reviews = await GymReview.count();

  if (total_reviews === 0) {
    return {
      total_reviews: 0,
      avg_rating: 0,
      total_approved: 0,
      total_pending: 0,
      rating_distribution: {
        rating_5: 0,
        rating_4: 0,
        rating_3: 0,
        rating_2: 0,
        rating_1: 0
      }
    };
  }

  const aggregates = await GymReview.findOne({
    attributes: [
      [fn('AVG', col('rating')), 'avg_rating'],
      [literal('SUM(CASE WHEN FLOOR(rating) = 5 THEN 1 ELSE 0 END)'), 'rating_5'],
      [literal('SUM(CASE WHEN FLOOR(rating) = 4 THEN 1 ELSE 0 END)'), 'rating_4'],
      [literal('SUM(CASE WHEN FLOOR(rating) = 3 THEN 1 ELSE 0 END)'), 'rating_3'],
      [literal('SUM(CASE WHEN FLOOR(rating) = 2 THEN 1 ELSE 0 END)'), 'rating_2'],
      [literal('SUM(CASE WHEN FLOOR(rating) = 1 THEN 1 ELSE 0 END)'), 'rating_1']
    ],
    raw: true
  });

  const total_approved = await GymReview.count({ where: { is_verified: true } });
  const avg_rating = aggregates?.avg_rating ? Number.parseFloat(aggregates.avg_rating) : 0;

  const parseAggregate = (field) => {
    const value = aggregates?.[field];
    return value ? Number.parseInt(value, 10) : 0;
  };

  return {
    total_reviews,
    avg_rating,
    total_approved,
    total_pending: total_reviews - total_approved,
    rating_distribution: {
      rating_5: parseAggregate('rating_5'),
      rating_4: parseAggregate('rating_4'),
      rating_3: parseAggregate('rating_3'),
      rating_2: parseAggregate('rating_2'),
      rating_1: parseAggregate('rating_1')
    }
  };
};

const approveReview = async (id_review, is_approved) => {
  const review = await getReviewById(id_review);
  review.is_verified = Boolean(is_approved);
  await review.save();
  await review.reload({
    attributes: REVIEW_ATTRIBUTES,
    include: REVIEW_INCLUDE
  });
  return mapReviewToDTO(review);
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

