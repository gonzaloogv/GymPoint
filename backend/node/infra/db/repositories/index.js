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
};
