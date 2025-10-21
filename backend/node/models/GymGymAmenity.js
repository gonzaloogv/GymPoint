const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymGymAmenity = sequelize.define('GymGymAmenity', {
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'gym',
      key: 'id_gym'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  id_amenity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'gym_amenity',
      key: 'id_amenity'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales sobre esta amenidad en este gym'
  }
}, {
  tableName: 'gym_gym_amenity',
  timestamps: false,
  indexes: [
    {
      fields: ['id_amenity'],
      name: 'idx_gym_amenity_amenity'
    }
  ]
});

module.exports = GymGymAmenity;

