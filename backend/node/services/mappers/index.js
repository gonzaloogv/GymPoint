/**
 * Index de Mappers
 *
 * Exporta todos los mappers del dominio de manera centralizada
 */

const authMappers = require('./auth.mappers');
const gymMappers = require('./gym.mappers');
const userMappers = require('./user.mappers');
const gymScheduleMappers = require('./gym-schedule.mappers');
const gymReviewMappers = require('./gym-review.mappers');
const gymPaymentMappers = require('./gym-payment.mappers');
const rewardMappers = require('./reward.mappers');
// Lote 9
const paymentMappers = require('./payment.mappers');
const notificationMappers = require('./notification.mappers');
const userFavoriteGymMappers = require('./user-favorite-gym.mappers');
const userGymMappers = require('./user-gym.mappers');

module.exports = {
  auth: authMappers,
  gym: gymMappers,
  user: userMappers,
  gymSchedule: gymScheduleMappers,
  gymReview: gymReviewMappers,
  gymPayment: gymPaymentMappers,
  reward: rewardMappers,
  // Lote 9
  payment: paymentMappers,
  notification: notificationMappers,
  userFavoriteGym: userFavoriteGymMappers,
  userGym: userGymMappers,
  // Aliases for convenience
  authMappers,
  gymMappers,
  userMappers,
  gymScheduleMappers,
  gymReviewMappers,
  gymPaymentMappers,
  rewardMappers,
  paymentMappers,
  notificationMappers,
  userFavoriteGymMappers,
  userGymMappers,
};
