const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserFavoriteGym = sequelize.define('UserFavoriteGym', {
  id_user_profile: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'user_profiles',
      key: 'id_user_profile'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  id_gym: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'gym',
      key: 'id_gym'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_favorite_gym',
  timestamps: false,
  indexes: [
    {
      fields: ['id_gym'],
      name: 'idx_favorite_gym'
    }
  ]
});

module.exports = UserFavoriteGym;