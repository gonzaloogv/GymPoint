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
// Lote 6: Challenges, Streaks, Frequency
const challengeMappers = require('./challenge.mappers');
const streakMappers = require('./streak.mappers');
const frequencyMappers = require('./frequency.mappers');
// Lote 7: Exercise, Routine, UserRoutine, Workout
const exerciseMappers = require('./exercise.mappers');
const routineMappers = require('./routine.mappers');
const userRoutineMappers = require('./user-routine.mappers');
const workoutMappers = require('./workout.mappers');
// Lote 8: Progress, Media
const progressMappers = require('./progress.mappers');
const mediaMappers = require('./media.mappers');
// Lote 9
const paymentMappers = require('./payment.mappers');
const notificationMappers = require('./notification.mappers');
const userFavoriteGymMappers = require('./user-favorite-gym.mappers');
const userGymMappers = require('./user-gym.mappers');
const assistanceMappers = require('./assistance.mappers');

module.exports = {
  auth: authMappers,
  gym: gymMappers,
  user: userMappers,
  gymSchedule: gymScheduleMappers,
  gymReview: gymReviewMappers,
  gymPayment: gymPaymentMappers,
  reward: rewardMappers,
  challenge: challengeMappers,
  streak: streakMappers,
  frequency: frequencyMappers,
  exercise: exerciseMappers,
  routine: routineMappers,
  userRoutine: userRoutineMappers,
  workout: workoutMappers,
  progress: progressMappers,
  media: mediaMappers,
  // Lote 9
  payment: paymentMappers,
  notification: notificationMappers,
  userFavoriteGym: userFavoriteGymMappers,
  userGym: userGymMappers,
  assistance: assistanceMappers,
  // Aliases for convenience
  authMappers,
  gymMappers,
  userMappers,
  gymScheduleMappers,
  gymReviewMappers,
  gymPaymentMappers,
  rewardMappers,
  challengeMappers,
  streakMappers,
  frequencyMappers,
  exerciseMappers,
  routineMappers,
  userRoutineMappers,
  workoutMappers,
  progressMappers,
  mediaMappers,
  paymentMappers,
  notificationMappers,
  userFavoriteGymMappers,
  userGymMappers,
  assistanceMappers,
};
