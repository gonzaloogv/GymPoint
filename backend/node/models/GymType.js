const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymType = sequelize.define('GymType', {
    id_type: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'gym_type',
    timestamps: false
});

module.exports = GymType;