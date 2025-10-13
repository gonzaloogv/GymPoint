const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Gym = sequelize.define('Gym', {
  id_gym: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(50)
  },
  whatsapp: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100)
  },
  website: {
    type: DataTypes.STRING(500)
  },
  social_media: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '{"instagram": "@gym", "facebook": "...", "twitter": "..."}'
  },
  registration_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  equipment: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: 'Array de equipamiento disponible'
  },
  instagram: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  facebook: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  google_maps_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  max_capacity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  area_sqm: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  month_price: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  week_price: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  photo_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL de la foto principal del gimnasio'
  }
}, {
  tableName: 'gym',
  timestamps: true,
  paranoid: true,
  deletedAt: 'deleted_at',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Gym;

// Relación Gym - Assistance
const Assistance = require('./Assistance');
Gym.hasMany(Assistance, {
  foreignKey: 'id_gym'
});

// Relación Gym - GymSchedule
const GymSchedule = require('./GymSchedule');
Gym.hasMany(GymSchedule, {
  foreignKey: 'id_gym'
});

// Relación Gym - GymSpecialSchedule
const GymSpecialSchedule = require('./GymSpecialSchedule');
Gym.hasMany(GymSpecialSchedule, {
  foreignKey: 'id_gym'
});

// Relación Gym - GymPayment
const GymPayment = require('./GymPayment');
Gym.hasMany(GymPayment, {
  foreignKey: 'id_gym'
});

// Relación Gym - RewardCode
const RewardCode = require('./RewardCode');
Gym.hasMany(RewardCode, {
  foreignKey: 'id_gym'
});

// Relación N:M con GymType (belongsToMany)
const GymType = require('./GymType');

Gym.belongsToMany(GymType, {
  through: 'gym_gym_type',
  foreignKey: 'id_gym',
  otherKey: 'id_type',
  timestamps: false,
  as: 'gymTypes'
});

GymType.belongsToMany(Gym, {
  through: 'gym_gym_type',
  foreignKey: 'id_type',
  otherKey: 'id_gym',
  timestamps: false,
  as: 'gyms'
});
