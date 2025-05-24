const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,       // nombre de la base de datos
  process.env.DB_USER,       // usuario
  process.env.DB_PASSWORD,   // contraseña
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false // Cambialo a true si querés ver las consultas SQL en consola
  }
);

module.exports = sequelize;
