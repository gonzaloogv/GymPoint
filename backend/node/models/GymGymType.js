const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo GymGymType - Relación Many-to-Many entre Gym y GymType
 *
 * Permite que un gimnasio tenga múltiples tipos/categorías
 * Ejemplo: Un gym puede ser "Funcional" + "CrossFit" + "Powerlifting"
 */
const GymGymType = sequelize.define('GymGymType', {
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
  id_type: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'gym_type',
      key: 'id_type'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
}, {
  tableName: 'gym_gym_type',
  timestamps: false,
  indexes: [
    {
      fields: ['id_type'],
      name: 'idx_gym_type'
    }
  ]
});

module.exports = GymGymType;
