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

module.exports = {
  auth: authMappers,
  gym: gymMappers,
  user: userMappers,
  gymSchedule: gymScheduleMappers,
  gymReview: gymReviewMappers,
  gymPayment: gymPaymentMappers,
};
