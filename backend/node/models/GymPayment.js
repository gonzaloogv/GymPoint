const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymPayment = sequelize.define('GymPayment', {
  id_payment: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20), 
    allowNull: false
  }
}, {
  tableName: 'gym_payment',
  timestamps: false
});

module.exports = GymPayment;
const User = require('./User');
const Gym = require('./Gym');

GymPayment.belongsTo(User, { 
    foreignKey: 'id_user' 
});
GymPayment.belongsTo(Gym, { 
    foreignKey: 'id_gym' 
});
