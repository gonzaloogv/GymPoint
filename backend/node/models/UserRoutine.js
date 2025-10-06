const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRoutine = sequelize.define('UserRoutine', {
  id_user_routine: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_routine: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  finish_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  tableName: 'user_routine',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_user', 'id_routine', 'active'],
      where: { active: true },
      name: 'unique_active_routine'
    }
  ]
});

module.exports = UserRoutine;
