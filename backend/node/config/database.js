const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;
if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
} else {
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false, // Cambialo a true si querés ver las consultas SQL en consola
  });
}

module.exports = sequelize;
