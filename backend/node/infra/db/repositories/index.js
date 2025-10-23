module.exports = {
  accountRepository: require('./account.repository'),
  userProfileRepository: require('./user-profile.repository'),
  refreshTokenRepository: require('./refresh-token.repository'),
  streakRepository: require('./streak.repository'),
  gymRepository: require('./gym.repository'),
  gymTypeRepository: require('./gym-type.repository'),
  gymAmenityRepository: require('./gym-amenity.repository'),
  userNotificationSettingRepository: require('./user-notification-setting.repository'),
  presenceRepository: require('./presence.repository'),
  // Lote 4: Gym Schedules, Reviews, Payments
  gymScheduleRepository: require('./gym-schedule.repository'),
  gymReviewRepository: require('./gym-review.repository'),
  gymPaymentRepository: require('./gym-payment.repository'),
  // Lote 5: Rewards & Tokens
  rewardRepository: require('./reward.repository'),
  // Lote 6: Challenges, Streaks, Frequency
  dailyChallengeRepository: require('./daily-challenge.repository'),
  frequencyRepository: require('./frequency.repository'),
  // Lote 7: Exercise, Routine, UserRoutine, Workout
  exerciseRepository: require('./exercise.repository'),
  routineRepository: require('./routine.repository'),
  userRoutineRepository: require('./user-routine.repository'),
  workoutRepository: require('./workout.repository'),
  // Lote 8: Progress, Media
  progressRepository: require('./progress.repository'),
  // Lote 9: Pagos externos, Notifs, Fav/Afiliación
  paymentRepository: require('./payment.repository'),
  notificationRepository: require('./notification.repository'),
  userFavoriteGymRepository: require('./user-favorite-gym.repository'),
  userGymRepository: require('./user-gym.repository'),
};
