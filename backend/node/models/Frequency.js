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
        allowNull: false
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
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
  tableName: 'frequency',
  timestamps: false
});

module.exports = Frequency;

// Asociaciones definidas en models/index.js