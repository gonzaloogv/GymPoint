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
const challengeQueries = require('./challenge.queries');
const streakQueries = require('./streak.queries');
const frequencyQueries = require('./frequency.queries');
const exerciseQueries = require('./exercise.queries');
const routineQueries = require('./routine.queries');
const userRoutineQueries = require('./user-routine.queries');
const workoutQueries = require('./workout.queries');

module.exports = {
  // Auth Queries
  ...authQueries,

  // Gym Queries
  ...gymQueries,

  // User Queries
  ...userQueries,

  // Gym Schedule Queries
  ...gymScheduleQueries,

  // Gym Review Queries
  ...gymReviewQueries,

  // Gym Payment Queries
  ...gymPaymentQueries,

  // Challenge Queries (Lote 6)
  ...challengeQueries,

  // Streak Queries (Lote 6)
  ...streakQueries,

  // Frequency Queries (Lote 6)
  ...frequencyQueries,

  // Exercise Queries (Lote 7)
  ...exerciseQueries,

  // Routine Queries (Lote 7)
  ...routineQueries,

  // UserRoutine Queries (Lote 7)
  ...userRoutineQueries,

  // Workout Queries (Lote 7)
  ...workoutQueries,
};
