const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Cargar modelos ya definidos
const Gym = require('./Gym');
const GymType = require('./GymType')(sequelize, DataTypes);

// Definir relación many-to-many
Gym.belongsToMany(GymType, {
  through: 'gym_gym_type',
  foreignKey: 'id_gym',
  otherKey: 'id_type'
});

GymType.belongsToMany(Gym, {
  through: 'gym_gym_type',
  foreignKey: 'id_type',
  otherKey: 'id_gym'
});

// Exportar los modelos listos para usar
module.exports = {
  Gym,
  GymType
};
