/**
 * Index de Modelos - Define todas las asociaciones
 * 
 * Este archivo centraliza la carga de modelos y define todas las relaciones.
 * Importar este archivo en lugar de modelos individuales para garantizar
 * que las asociaciones estén correctamente configuradas.
 */

// Modelos de Autenticación y Perfiles
const Account = require('./Account');
const Role = require('./Role');
const AccountRole = require('./AccountRole');
const UserProfile = require('./UserProfile');
const AdminProfile = require('./AdminProfile');
const AccountDeletionRequest = require('./AccountDeletionRequest');

// Modelos de Dominio (existentes)
const Assistance = require('./Assistance');
const ClaimedReward = require('./ClaimedReward');
const Exercise = require('./Exercise');
const Frequency = require('./Frequency');
const Gym = require('./Gym');
const GymPayment = require('./GymPayment');
const GymSchedule = require('./GymSchedule');
const GymSpecialSchedule = require('./GymSpecialSchedule');
// GymType - ELIMINADO: Ya no se usa, reemplazado por services array
const GymReview = require('./GymReview');
const GymRatingStats = require('./GymRatingStats');
const ReviewHelpful = require('./ReviewHelpful');
const GymRequest = require('./GymRequest');
const GymAmenity = require('./GymAmenity');
const GymGymAmenity = require('./GymGymAmenity');
// GymGymType - ELIMINADO: Ya no se usa, reemplazado por services array
const DailyChallenge = require('./DailyChallenge');
const DailyChallengeTemplate = require('./DailyChallengeTemplate');
const DailyChallengeSettings = require('./DailyChallengeSettings');
const UserDailyChallenge = require('./UserDailyChallenge');
const UserImportedRoutine = require('./UserImportedRoutine');
const MercadoPagoPayment = require('./MercadoPagoPayment');
const AchievementDefinition = require('./AchievementDefinition');
const UserAchievement = require('./UserAchievement');
const UserAchievementEvent = require('./UserAchievementEvent');
const Notification = require('./Notification');
const UserNotificationSetting = require('./UserNotificationSetting');
const Media = require('./Media');
const UserFavoriteGym = require('./UserFavoriteGym');
const Progress = require('./Progress');
const ProgressExercise = require('./ProgressExercise');
const RefreshToken = require('./RefreshToken');
const Reward = require('./Reward');
const RewardCode = require('./RewardCode');
const RewardGymStatsDaily = require('./RewardGymStatsDaily');
const UserRewardInventory = require('./UserRewardInventory');
const ActiveUserEffect = require('./ActiveUserEffect');
const RewardCooldown = require('./RewardCooldown');
const Routine = require('./Routine');
const RoutineExercise = require('./RoutineExercise');
const RoutineDay = require('./RoutineDay');
const Streak = require('./Streak');
const TokenLedger = require('./TokenLedger');
const UserGym = require('./UserGym');
const UserRoutine = require('./UserRoutine');
const UserBodyMetric = require('./UserBodyMetric');
const FrequencyHistory = require('./FrequencyHistory');
const WorkoutSession = require('./WorkoutSession');
const WorkoutSet = require('./WorkoutSet');
const UserDeviceToken = require('./UserDeviceToken');
const Presence = require('./Presence');

// ============================================
// ASOCIACIONES - Nueva Arquitectura
// ============================================

// Account ←→ Role (many-to-many through AccountRole)
Account.belongsToMany(Role, {
  through: AccountRole,
  foreignKey: 'id_account',
  otherKey: 'id_role',
  as: 'roles'
});

Role.belongsToMany(Account, {
  through: AccountRole,
  foreignKey: 'id_role',
  otherKey: 'id_account',
  as: 'accounts'
});

// Account ←→ AccountRole
Account.hasMany(AccountRole, {
  foreignKey: 'id_account',
  as: 'accountRoles'
});

AccountRole.belongsTo(Account, {
  foreignKey: 'id_account',
  as: 'account'
});

// Role ←→ AccountRole
Role.hasMany(AccountRole, {
  foreignKey: 'id_role',
  as: 'accountRoles'
});

AccountRole.belongsTo(Role, {
  foreignKey: 'id_role',
  as: 'role'
});

Account.hasMany(AccountDeletionRequest, {
  foreignKey: 'id_account',
  as: 'deletionRequests'
});

AccountDeletionRequest.belongsTo(Account, {
  foreignKey: 'id_account',
  as: 'account'
});

// Account ←→ UserProfile (1:1)
Account.hasOne(UserProfile, {
  foreignKey: 'id_account',
  as: 'userProfile'
});

UserProfile.belongsTo(Account, {
  foreignKey: 'id_account',
  as: 'account'
});

// Account ←→ AdminProfile (1:1)
Account.hasOne(AdminProfile, {
  foreignKey: 'id_account',
  as: 'adminProfile'
});

AdminProfile.belongsTo(Account, {
  foreignKey: 'id_account',
  as: 'account'
});

// ============================================
// ASOCIACIONES - Dominio con UserProfile
// ============================================

// UserProfile ←→ Assistance
UserProfile.hasMany(Assistance, {
  foreignKey: 'id_user_profile',
  as: 'assistances'
});

Assistance.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'user'
});

// Workout sessions
UserProfile.hasMany(WorkoutSession, {
  foreignKey: 'id_user_profile',
  as: 'workoutSessions'
});

WorkoutSession.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'user'
});

Routine.hasMany(WorkoutSession, {
  foreignKey: 'id_routine',
  as: 'workoutSessions'
});

WorkoutSession.belongsTo(Routine, {
  foreignKey: 'id_routine',
  as: 'routine'
});

RoutineDay.hasMany(WorkoutSession, {
  foreignKey: 'id_routine_day',
  as: 'sessions'
});

WorkoutSession.belongsTo(RoutineDay, {
  foreignKey: 'id_routine_day',
  as: 'routineDay'
});

WorkoutSession.hasMany(WorkoutSet, {
  foreignKey: 'id_workout_session',
  as: 'sets'
});

WorkoutSet.belongsTo(WorkoutSession, {
  foreignKey: 'id_workout_session',
  as: 'session'
});

Exercise.hasMany(WorkoutSet, {
  foreignKey: 'id_exercise',
  as: 'workoutSets'
});

WorkoutSet.belongsTo(Exercise, {
  foreignKey: 'id_exercise',
  as: 'exercise'
});

// Daily Challenges associations
UserProfile.hasMany(UserDailyChallenge, {
  foreignKey: 'id_user_profile',
  as: 'dailyChallenges'
});

UserDailyChallenge.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'user'
});

DailyChallenge.hasMany(UserDailyChallenge, {
  foreignKey: 'id_challenge',
  as: 'userProgress'
});

UserDailyChallenge.belongsTo(DailyChallenge, {
  foreignKey: 'id_challenge',
  as: 'challenge'
});

DailyChallenge.belongsTo(DailyChallengeTemplate, {
  foreignKey: 'id_template',
  as: 'template'
});

DailyChallengeTemplate.hasMany(DailyChallenge, {
  foreignKey: 'id_template',
  as: 'instances'
});

// UserImportedRoutine associations (opcionales para navegación)
UserProfile.hasMany(UserImportedRoutine, {
  foreignKey: 'id_user_profile',
  as: 'importedRoutines'
});

UserImportedRoutine.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'user'
});

UserImportedRoutine.belongsTo(Routine, {
  foreignKey: 'id_template_routine',
  as: 'templateRoutine'
});

UserImportedRoutine.belongsTo(Routine, {
  foreignKey: 'id_user_routine',
  as: 'userRoutine'
});

// Gym ←→ Assistance
Gym.hasMany(Assistance, {
  foreignKey: 'id_gym',
  as: 'assistances'
});

Assistance.belongsTo(Gym, {
  foreignKey: 'id_gym',
  as: 'gym'
});

// UserProfile ←→ Progress
UserProfile.hasMany(Progress, {
  foreignKey: 'id_user_profile',
  as: 'progress'
});

Progress.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'userProfile'
});

// Progress ←→ Exercise (many-to-many through ProgressExercise)
Progress.belongsToMany(Exercise, {
  through: ProgressExercise,
  foreignKey: 'id_progress',
  otherKey: 'id_exercise',
  as: 'exercises'
});

Exercise.belongsToMany(Progress, {
  through: ProgressExercise,
  foreignKey: 'id_exercise',
  otherKey: 'id_progress',
  as: 'progress'
});

// ProgressExercise direct associations
ProgressExercise.belongsTo(Progress, {
  foreignKey: 'id_progress',
  as: 'progress'
});

ProgressExercise.belongsTo(Exercise, {
  foreignKey: 'id_exercise',
  as: 'exercise'
});

// Account ←→ RefreshToken
Account.hasMany(RefreshToken, {
  foreignKey: 'id_account',
  as: 'refreshTokens'
});

RefreshToken.belongsTo(Account, {
  foreignKey: 'id_account',
  as: 'account'
});

// UserProfile ←→ Routine (created_by)
UserProfile.hasMany(Routine, {
  foreignKey: 'created_by',
  as: 'routines'
});

Routine.belongsTo(UserProfile, {
  foreignKey: 'created_by',
  as: 'creator'
});

Routine.hasMany(RoutineDay, {
  foreignKey: 'id_routine',
  as: 'days'
});

RoutineDay.belongsTo(Routine, {
  foreignKey: 'id_routine',
  as: 'routine'
});

// Routine ←→ Exercise (many-to-many through RoutineExercise)
Routine.belongsToMany(Exercise, {
  through: RoutineExercise,
  foreignKey: 'id_routine',
  otherKey: 'id_exercise',
  as: 'Exercises'
});

Exercise.belongsToMany(Routine, {
  through: RoutineExercise,
  foreignKey: 'id_exercise',
  otherKey: 'id_routine',
  as: 'routines'
});

// RoutineExercise direct associations
Routine.hasMany(RoutineExercise, {
  foreignKey: 'id_routine',
  as: 'routineExercises'
});

RoutineExercise.belongsTo(Routine, {
  foreignKey: 'id_routine',
  as: 'routine'
});

RoutineDay.hasMany(RoutineExercise, {
  foreignKey: 'id_routine_day',
  as: 'routineExercises'
});

RoutineExercise.belongsTo(RoutineDay, {
  foreignKey: 'id_routine_day',
  as: 'routineDay'
});

Exercise.hasMany(RoutineExercise, {
  foreignKey: 'id_exercise',
  as: 'routineExercises'
});

RoutineExercise.belongsTo(Exercise, {
  foreignKey: 'id_exercise',
  as: 'exercise'
});

// UserProfile ←→ ClaimedReward
UserProfile.hasMany(ClaimedReward, {
  foreignKey: 'id_user_profile',
  as: 'claimedRewards'
});

ClaimedReward.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'user'
});

// Reward ←→ ClaimedReward
Reward.hasMany(ClaimedReward, {
  foreignKey: 'id_reward',
  as: 'claimedRewards'
});

ClaimedReward.belongsTo(Reward, {
  foreignKey: 'id_reward',
  as: 'reward'
});

// Reward ←→ RewardCode
Reward.hasMany(RewardCode, {
  foreignKey: 'id_reward',
  as: 'codes'
});

RewardCode.belongsTo(Reward, {
  foreignKey: 'id_reward',
  as: 'reward'
});

// RewardCode ←→ ClaimedReward
RewardCode.hasMany(ClaimedReward, {
  foreignKey: 'id_code',
  as: 'claims'
});

ClaimedReward.belongsTo(RewardCode, {
  foreignKey: 'id_code',
  as: 'code'
});

// UserProfile ←→ Frequency
UserProfile.hasOne(Frequency, {
  foreignKey: 'id_user_profile',
  as: 'frequency'
});

Frequency.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'userProfile'
});

// UserProfile ←→ GymPayment
UserProfile.hasMany(GymPayment, {
  foreignKey: 'id_user_profile',
  as: 'gymPayments'
});

GymPayment.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'userProfile'
});

// UserProfile ←→ Streak
UserProfile.hasOne(Streak, {
  foreignKey: 'id_user_profile',
  as: 'streak'
});

UserProfile.hasMany(UserAchievement, {
  foreignKey: 'id_user_profile',
  as: 'achievements'
});

UserAchievement.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'userProfile'
});

AchievementDefinition.hasMany(UserAchievement, {
  foreignKey: 'id_achievement_definition',
  as: 'userAchievements'
});

UserAchievement.belongsTo(AchievementDefinition, {
  foreignKey: 'id_achievement_definition',
  as: 'achievement'
});

UserAchievement.hasMany(UserAchievementEvent, {
  foreignKey: 'id_user_achievement',
  as: 'events'
});

UserAchievementEvent.belongsTo(UserAchievement, {
  foreignKey: 'id_user_achievement',
  as: 'userAchievement'
});

Streak.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'userProfile'
});

// Frequency ←→ Streak
Frequency.hasOne(Streak, {
  foreignKey: 'id_frequency',
  as: 'streak'
});

Streak.belongsTo(Frequency, {
  foreignKey: 'id_frequency',
  as: 'frequency'
});

// UserProfile ←→ TokenLedger
UserProfile.hasMany(TokenLedger, {
  foreignKey: 'id_user_profile',
  as: 'tokenLedger'
});

TokenLedger.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'userProfile'
});

// Gym - GymReview
Gym.hasMany(GymReview, {
  foreignKey: 'id_gym',
  as: 'reviews'
});

GymReview.belongsTo(Gym, {
  foreignKey: 'id_gym',
  as: 'gym'
});

// UserProfile - GymReview
UserProfile.hasMany(GymReview, {
  foreignKey: 'id_user_profile',
  as: 'reviews'
});

GymReview.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'author'
});

// Gym - GymRatingStats
Gym.hasOne(GymRatingStats, {
  foreignKey: 'id_gym',
  as: 'ratingStats'
});

GymRatingStats.belongsTo(Gym, {
  foreignKey: 'id_gym',
  as: 'gym'
});

// GymReview - ReviewHelpful
GymReview.hasMany(ReviewHelpful, {
  foreignKey: 'id_review',
  as: 'helpfulMarks'
});

ReviewHelpful.belongsTo(GymReview, {
  foreignKey: 'id_review',
  as: 'review'
});

ReviewHelpful.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'user'
});

UserProfile.hasMany(ReviewHelpful, {
  foreignKey: 'id_user_profile',
  as: 'helpfulReviews'
});

// Notifications
UserProfile.hasMany(Notification, {
  foreignKey: 'id_user_profile',
  as: 'notifications'
});

Notification.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'userProfile'
});

UserProfile.hasOne(UserNotificationSetting, {
  foreignKey: 'id_user_profile',
  as: 'notificationSettings'
});

UserNotificationSetting.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'userProfile'
});

// Gym amenities
Gym.belongsToMany(GymAmenity, {
  through: GymGymAmenity,
  foreignKey: 'id_gym',
  otherKey: 'id_amenity',
  as: 'amenities'
});

GymAmenity.belongsToMany(Gym, {
  through: GymGymAmenity,
  foreignKey: 'id_amenity',
  otherKey: 'id_gym',
  as: 'gyms'
});

GymGymAmenity.belongsTo(Gym, {
  foreignKey: 'id_gym',
  as: 'gym'
});

GymGymAmenity.belongsTo(GymAmenity, {
  foreignKey: 'id_amenity',
  as: 'amenity'
});

Gym.hasMany(GymGymAmenity, {
  foreignKey: 'id_gym',
  as: 'gymAmenitiesLinks'
});

GymAmenity.hasMany(GymGymAmenity, {
  foreignKey: 'id_amenity',
  as: 'gymLinks'
});

// Gym types - ELIMINADO: Ya no se usa relación many-to-many
// Los tipos/servicios ahora están en gym.services como array de strings
// Ejemplo: ["Funcional", "CrossFit", "Musculación"]

// MercadoPago payments
UserProfile.hasMany(MercadoPagoPayment, {
  foreignKey: 'id_user_profile',
  as: 'payments'
});

MercadoPagoPayment.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'userProfile'
});

Gym.hasMany(MercadoPagoPayment, {
  foreignKey: 'id_gym',
  as: 'mercadopagoPayments'
});

MercadoPagoPayment.belongsTo(Gym, {
  foreignKey: 'id_gym',
  as: 'gym'
});

// MercadoPagoPayment.hasMany(UserGym, {
//   foreignKey: 'id_payment',
//   as: 'memberships'
// });

// UserGym.belongsTo(MercadoPagoPayment, {
//   foreignKey: 'id_payment',
//   as: 'payment'
// });

// NOTA: La asociación UserGym <-> MercadoPagoPayment está comentada porque
// el campo id_payment no existe en la tabla user_gym. Si se necesita en el futuro,
// agregar el campo a la migración primero.

UserProfile.hasMany(UserBodyMetric, {
  foreignKey: 'id_user_profile',
  as: 'bodyMetrics'
});

UserBodyMetric.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'userProfile'
});

UserProfile.hasMany(FrequencyHistory, {
  foreignKey: 'id_user_profile',
  as: 'frequencyHistory'
});

FrequencyHistory.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'userProfile'
});

// Favorites

UserProfile.belongsToMany(Gym, {
  through: UserFavoriteGym,
  foreignKey: 'id_user_profile',
  otherKey: 'id_gym',
  as: 'favoriteGyms'
});

Gym.belongsToMany(UserProfile, {
  through: UserFavoriteGym,
  foreignKey: 'id_gym',
  otherKey: 'id_user_profile',
  as: 'favoritedBy'
});

UserFavoriteGym.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'user'
});

UserFavoriteGym.belongsTo(Gym, {
  foreignKey: 'id_gym',
  as: 'gym'
});

// Media (polimorfico)
UserProfile.hasMany(Media, {
  foreignKey: 'entity_id',
  as: 'media',
  constraints: false,
  scope: {
    entity_type: 'USER_PROFILE'
  }
});

Media.belongsTo(UserProfile, {
  foreignKey: 'entity_id',
  as: 'userProfile',
  constraints: false
});

Gym.hasMany(Media, {
  foreignKey: 'entity_id',
  as: 'media',
  constraints: false,
  scope: {
    entity_type: 'GYM'
  }
});

Media.belongsTo(Gym, {
  foreignKey: 'entity_id',
  as: 'gymMedia',
  constraints: false
});

// Gym ←→ Reward
Gym.hasMany(Reward, {
  foreignKey: 'id_gym',
  as: 'rewards'
});

Reward.belongsTo(Gym, {
  foreignKey: 'id_gym',
  as: 'gym'
});

// UserProfile ←→ UserRewardInventory
UserProfile.hasMany(UserRewardInventory, {
  foreignKey: 'id_user_profile',
  as: 'rewardInventory'
});

UserRewardInventory.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'userProfile'
});

UserRewardInventory.belongsTo(Reward, {
  foreignKey: 'id_reward',
  as: 'reward'
});

Reward.hasMany(UserRewardInventory, {
  foreignKey: 'id_reward',
  as: 'inventoryEntries'
});

// UserProfile ←→ ActiveUserEffect
UserProfile.hasMany(ActiveUserEffect, {
  foreignKey: 'id_user_profile',
  as: 'activeEffects'
});

ActiveUserEffect.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'userProfile'
});

// UserProfile ←→ RewardCooldown
UserProfile.hasMany(RewardCooldown, {
  foreignKey: 'id_user_profile',
  as: 'rewardCooldowns'
});

RewardCooldown.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'userProfile'
});

RewardCooldown.belongsTo(Reward, {
  foreignKey: 'id_reward',
  as: 'reward'
});

Reward.hasMany(RewardCooldown, {
  foreignKey: 'id_reward',
  as: 'cooldowns'
});

// Gym ←→ RewardGymStatsDaily
Gym.hasMany(RewardGymStatsDaily, {
  foreignKey: 'id_gym',
  as: 'rewardStats'
});

RewardGymStatsDaily.belongsTo(Gym, {
  foreignKey: 'id_gym',
  as: 'gym'
});

// UserProfile ←→ UserGym
UserProfile.hasMany(UserGym, {
  foreignKey: 'id_user_profile',
  as: 'userGyms'
});

UserGym.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'userProfile'
});

// Gym ←→ UserGym
Gym.hasMany(UserGym, {
  foreignKey: 'id_gym',
  as: 'userGyms'
});

UserGym.belongsTo(Gym, {
  foreignKey: 'id_gym',
  as: 'gym'
});

// UserProfile ←→ UserRoutine
UserProfile.hasMany(UserRoutine, {
  foreignKey: 'id_user_profile',
  as: 'userRoutines'
});

UserRoutine.belongsTo(UserProfile, {
  foreignKey: 'id_user_profile',
  as: 'userProfile'
});

// UserRoutine ←→ Routine
UserRoutine.belongsTo(Routine, {
  foreignKey: 'id_routine',
  as: 'routine'
});

Routine.hasMany(UserRoutine, {
  foreignKey: 'id_routine',
  as: 'userRoutines'
});

// Relaciones Presence
Presence.associate = (models) => {
  Presence.belongsTo(models.UserProfile, {
    foreignKey: 'id_user_profile',
    as: 'user'
  });
  Presence.belongsTo(models.Gym, {
    foreignKey: 'id_gym',
    as: 'gym'
  });
  Presence.belongsTo(models.Assistance, {
    foreignKey: 'id_assistance',
    as: 'assistance'
  });
};

// ============================================
// ASOCIACIONES - Otras relaciones existentes
// ============================================

// (Mantener todas las relaciones existentes que no involucran User)
// Por ejemplo: Gym ←→ Assistance, Routine ←→ Exercise, etc.

// Exportar todos los modelos
module.exports = {
  // Modelos Usuarios
  Account,
  Role,
  AccountRole,
  UserProfile,
  AdminProfile,
  
  // Modelos existentes
  Assistance,
  ClaimedReward,
  Exercise,
  Frequency,
  Gym,
  GymPayment,
  GymAmenity,
  GymGymAmenity,
  GymSchedule,
  GymSpecialSchedule,
  GymReview,
  GymRatingStats,
  ReviewHelpful,
  GymRequest,
  Media,
  Notification,
  UserNotificationSetting,
  MercadoPagoPayment,
  AccountDeletionRequest,
  UserFavoriteGym,
  Progress,
  ProgressExercise,
  RefreshToken,
  Reward,
  RewardCode,
  RewardGymStatsDaily,
  UserRewardInventory,
  ActiveUserEffect,
  RewardCooldown,
  Routine,
  RoutineExercise,
  RoutineDay,
  Streak,
  TokenLedger,
  UserGym,
  UserRoutine,
  UserBodyMetric,
  FrequencyHistory,
  WorkoutSession,
  WorkoutSet,
  DailyChallenge,
  DailyChallengeTemplate,
  DailyChallengeSettings,
  UserDailyChallenge,
  UserImportedRoutine,
  UserAchievement,
  UserAchievementEvent,
  AchievementDefinition,
  Presence
};



