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
  email: { 
    type: DataTypes.STRING(100) 
  },
  website: { 
    type: DataTypes.STRING(500) 
  },
  social_media: { 
    type: DataTypes.TEXT 
  },
  gym_type: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  registration_date: { 
    type: DataTypes.DATE, 
    allowNull: false,
    defaultValue: DataTypes.NOW 
  },
  equipment: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  month_price: { 
    type: DataTypes.DOUBLE, 
    allowNull: false 
  },
  week_price: { 
    type: DataTypes.DOUBLE, 
    allowNull: false 
  }
}, {
  tableName: 'gym',
  timestamps: false
});

module.exports = Gym;
const Assistance = require('./Assistance');
Gym.hasMany(Assistance, {
  foreignKey: 'id_gym'
});

const GymSchedule = require('./GymSchedule');
Gym.hasMany(GymSchedule, { 
  foreignKey: 'id_gym' 
});

const GymSpecialSchedule = require('./GymSpecialSchedule');
Gym.hasMany(GymSpecialSchedule, { 
  foreignKey: 'id_gym' 
});

const GymPayment = require('./GymPayment');
Gym.hasMany(GymPayment, { 
  foreignKey: 'id_gym' 
});

const RewardCode = require('./RewardCode');
Gym.hasMany(RewardCode, { 
  foreignKey: 'id_gym' 
});