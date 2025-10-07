const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id_user: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  lastname: { 
    type: DataTypes.STRING,
    allowNull: false 
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  gender: { 
    type: DataTypes.STRING(1), 
    allowNull: false 
  },
  locality: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  age: { 
    type: DataTypes.TINYINT, 
    allowNull: false 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: true  // Puede ser null para usuarios de Google
  },
  role: { 
    type: DataTypes.STRING(15), 
    allowNull: false, 
    defaultValue: 'USER' 
  },
  tokens: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  id_streak: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Streak',
      key: 'id_streak'
    }
  },
  auth_provider: {
    type: DataTypes.ENUM('local', 'google'),
    allowNull: false,
    defaultValue: 'local'
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;
const Routine = require('./Routine');
const UserRoutine = require('./UserRoutine');

User.belongsToMany(Routine, {
  through: UserRoutine,
  foreignKey: 'id_user',
  otherKey: 'id_routine'
});
const Reward = require('./Reward');
const ClaimedReward = require('./ClaimedReward');

User.belongsToMany(Reward, {
  through: ClaimedReward,
  foreignKey: 'id_user',
  otherKey: 'id_reward'
});

// Transaction model eliminado - usar TokenLedger desde UserProfile
const UserGym = require('./UserGym');
User.hasMany(UserGym, { 
  foreignKey: 'id_user' 
});
const Frequency = require('./Frequency');
User.hasOne(Frequency, { 
  foreignKey: 'id_user' 
});
const GymPayment = require('./GymPayment');
User.hasMany(GymPayment, { 
  foreignKey: 'id_user' 
});