const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Frequency = sequelize.define('Frequency', {
    id_frequency: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    goal: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    assist: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    achieved_goal: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
  tableName: 'frequency',
  timestamps: false
});

module.exports = Frequency;