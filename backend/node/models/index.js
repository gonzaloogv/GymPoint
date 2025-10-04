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

// Modelos de Dominio (existentes)
const User = require('./User'); // Deprecated - mantener para compatibilidad
const Assistance = require('./Assistance');
const ClaimedReward = require('./ClaimedReward');
const Exercise = require('./Exercise');
const Frequency = require('./Frequency');
const Gym = require('./Gym');
const GymPayment = require('./GymPayment');
const GymSchedule = require('./GymSchedule');
const GymSpecialSchedule = require('./GymSpecialSchedule');
const GymType = require('./GymType');
const Progress = require('./Progress');
const ProgressExercise = require('./ProgressExercise');
const RefreshToken = require('./RefreshToken');
const Reward = require('./Reward');
const RewardCode = require('./RewardCode');
const Routine = require('./Routine');
const RoutineExercise = require('./RoutineExercise');
const Streak = require('./Streak');
const Transaction = require('./Transaction');
const UserGym = require('./UserGym');
const UserRoutine = require('./UserRoutine');

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
  foreignKey: 'id_user',
  as: 'assistances'
});

Assistance.belongsTo(UserProfile, {
  foreignKey: 'id_user',
  as: 'userProfile'
});

// UserProfile ←→ Progress
UserProfile.hasMany(Progress, {
  foreignKey: 'id_user',
  as: 'progress'
});

Progress.belongsTo(UserProfile, {
  foreignKey: 'id_user',
  as: 'userProfile'
});

// UserProfile ←→ RefreshToken
UserProfile.hasMany(RefreshToken, {
  foreignKey: 'id_user',
  as: 'refreshTokens'
});

RefreshToken.belongsTo(UserProfile, {
  foreignKey: 'id_user',
  as: 'userProfile'
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

// UserProfile ←→ ClaimedReward (sin FK física, solo en modelo)
UserProfile.hasMany(ClaimedReward, {
  foreignKey: 'id_user',
  as: 'claimedRewards'
});

ClaimedReward.belongsTo(UserProfile, {
  foreignKey: 'id_user',
  as: 'userProfile'
});

// UserProfile ←→ Frequency (sin FK física, solo en modelo)
UserProfile.hasOne(Frequency, {
  foreignKey: 'id_user',
  as: 'frequency'
});

Frequency.belongsTo(UserProfile, {
  foreignKey: 'id_user',
  as: 'userProfile'
});

// UserProfile ←→ GymPayment (sin FK física, solo en modelo)
UserProfile.hasMany(GymPayment, {
  foreignKey: 'id_user',
  as: 'gymPayments'
});

GymPayment.belongsTo(UserProfile, {
  foreignKey: 'id_user',
  as: 'userProfile'
});

// UserProfile ←→ Streak (sin FK física, solo en modelo)
UserProfile.hasOne(Streak, {
  foreignKey: 'id_user',
  as: 'streak'
});

Streak.belongsTo(UserProfile, {
  foreignKey: 'id_user',
  as: 'userProfile'
});

// UserProfile ←→ Transaction (sin FK física, solo en modelo)
UserProfile.hasMany(Transaction, {
  foreignKey: 'id_user',
  as: 'transactions'
});

Transaction.belongsTo(UserProfile, {
  foreignKey: 'id_user',
  as: 'userProfile'
});

// UserProfile ←→ UserGym (sin FK física, solo en modelo)
UserProfile.hasMany(UserGym, {
  foreignKey: 'id_user',
  as: 'userGyms'
});

UserGym.belongsTo(UserProfile, {
  foreignKey: 'id_user',
  as: 'userProfile'
});

// UserProfile ←→ UserRoutine (sin FK física, solo en modelo)
UserProfile.hasMany(UserRoutine, {
  foreignKey: 'id_user',
  as: 'userRoutines'
});

UserRoutine.belongsTo(UserProfile, {
  foreignKey: 'id_user',
  as: 'userProfile'
});

// ============================================
// ASOCIACIONES - Otras relaciones existentes
// ============================================

// (Mantener todas las relaciones existentes que no involucran User)
// Por ejemplo: Gym ←→ Assistance, Routine ←→ Exercise, etc.

// Exportar todos los modelos
module.exports = {
  // Nueva arquitectura
  Account,
  Role,
  AccountRole,
  UserProfile,
  AdminProfile,
  
  // Modelos existentes
  User, // Deprecated
  Assistance,
  ClaimedReward,
  Exercise,
  Frequency,
  Gym,
  GymPayment,
  GymSchedule,
  GymSpecialSchedule,
  GymType,
  Progress,
  ProgressExercise,
  RefreshToken,
  Reward,
  RewardCode,
  Routine,
  RoutineExercise,
  Streak,
  Transaction,
  UserGym,
  UserRoutine
};

