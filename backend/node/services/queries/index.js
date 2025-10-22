/**
 * Index de Queries
 *
 * Exporta todas las queries del dominio de manera centralizada
 */

const authQueries = require('./auth.queries');
const gymQueries = require('./gym.queries');
const userQueries = require('./user.queries');
const gymScheduleQueries = require('./gym-schedule.queries');
const gymReviewQueries = require('./gym-review.queries');
const gymPaymentQueries = require('./gym-payment.queries');

module.exports = {
  // Auth Queries
  ...authQueries,

  // Gym Queries
  ...gymQueries,

  // User Queries
  ...userQueries,

  // Gym Schedule Queries (Lote 4)
  ...gymScheduleQueries,

  // Gym Review Queries (Lote 4)
  ...gymReviewQueries,

  // Gym Payment Queries (Lote 4)
  ...gymPaymentQueries,
};
