const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRoutine = sequelize.define('UserRoutine', {
  id_user_routine: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user_profiles',
      key: 'id_user_profile'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  id_routine: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'routine',
      key: 'id_routine'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'user_routine',
  timestamps: false,
  indexes: [
    {
      fields: ['id_user_profile', 'is_active'],
      name: 'idx_user_routine_user_active'
    }
  ]
});

module.exports = UserRoutine;
