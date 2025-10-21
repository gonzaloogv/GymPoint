const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymType = sequelize.define('GymType', {
    id_type: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Nombre del tipo de gimnasio'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción del tipo'
    }
}, {
    tableName: 'gym_type',
    timestamps: false
});

module.exports = GymType;

// Las asociaciones se definen en index.js para evitar referencias circulares